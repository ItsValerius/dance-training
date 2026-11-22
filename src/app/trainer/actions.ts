"use server";

import { and, eq, isNull, like, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/components/action-form";
import { db } from "@/db";
import { assignment, category, exercise, group, groupMember, invitation, user } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { nextFreeSlug, slugify } from "@/lib/slug";
import { youtubeId } from "@/lib/youtube";
import { appUrl, sendMail } from "@/lib/mail";
import { hashToken, newToken } from "@/lib/tokens";

const ok = (): ActionResult => ({ ok: Date.now() });
const fail = (e: z.ZodError): ActionResult => ({ error: e.issues.map((i) => i.message).join(", ") });
// better-auth/DB errors are English-only; log the detail, show a German message
const errorMessage = (e: unknown) => (console.error(e), "Etwas ist schiefgelaufen. Bitte versuch es noch einmal.");

const exerciseSchema = z.object({
  title: z.string().trim().min(1, "Titel fehlt").max(200),
  description: z.string().trim().max(5000).transform((s) => s || null),
  categoryId: z.string().min(1, "Kategorie fehlt"),
  youtubeId: z.string().transform((u, ctx) => youtubeId(u) ?? (ctx.addIssue({ code: "custom", message: "Kein gültiger YouTube-Link" }), z.NEVER)),
});

const parseExercise = (data: FormData) =>
  exerciseSchema.safeParse({
    title: data.get("title"),
    description: data.get("description") ?? "",
    categoryId: data.get("categoryId") ?? "",
    youtubeId: data.get("youtubeUrl"),
  });

/** Unique URL slug for an exercise title; `ownId` lets an exercise keep its own slug on edit. */
async function exerciseSlug(title: string, ownId?: string) {
  const base = slugify(title); // only [a-z0-9-], so safe inside LIKE
  const rows = await db
    .select({ id: exercise.id, slug: exercise.slug })
    .from(exercise)
    .where(or(eq(exercise.slug, base), like(exercise.slug, `${base}-%`)));
  return nextFreeSlug(base, new Set(rows.filter((r) => r.id !== ownId).map((r) => r.slug)));
}

export async function createExercise(_: ActionResult, data: FormData): Promise<ActionResult> {
  const me = await requireTrainer();
  const parsed = parseExercise(data);
  if (!parsed.success) return fail(parsed.error);
  const slug = await exerciseSlug(parsed.data.title);
  await db.insert(exercise).values({ ...parsed.data, slug, createdById: me.id });
  redirect(`/trainer/uebungen/${slug}`);
}

export async function updateExercise(id: string, oldSlug: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = parseExercise(data);
  if (!parsed.success) return fail(parsed.error);
  const slug = await exerciseSlug(parsed.data.title, id);
  await db.update(exercise).set({ ...parsed.data, slug }).where(eq(exercise.id, id));
  // title changed -> new URL
  if (slug !== oldSlug) redirect(`/trainer/uebungen/${slug}`);
  revalidatePath(`/trainer/uebungen/${slug}`);
  return ok();
}

export async function deleteExercise(id: string) {
  await requireTrainer();
  await db.delete(exercise).where(eq(exercise.id, id));
  redirect("/trainer");
}

/** Replaces the exercise's assignments with the checked students and groups. */
export async function setAssignments(exerciseId: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const ids = z.array(z.string().min(1));
  const userIds = ids.parse(data.getAll("userIds"));
  const groupIds = ids.parse(data.getAll("groupIds"));
  try {
    await db.transaction(async (tx) => {
      await tx.delete(assignment).where(eq(assignment.exerciseId, exerciseId));
      const rows = [...userIds.map((userId) => ({ exerciseId, userId })), ...groupIds.map((groupId) => ({ exerciseId, groupId }))];
      if (rows.length) await tx.insert(assignment).values(rows);
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/trainer/uebungen/[slug]", "page");
  return ok();
}

const emailSchema = z.email("Keine gültige E-Mail-Adresse").trim().toLowerCase().max(200);
const INVITE_DAYS = 7;

export async function inviteStudent(_: ActionResult, data: FormData): Promise<ActionResult> {
  const me = await requireTrainer();
  const parsed = emailSchema.safeParse(data.get("email"));
  if (!parsed.success) return fail(parsed.error);
  const token = newToken();
  await db.insert(invitation).values({
    email: parsed.data,
    tokenHash: hashToken(token),
    createdById: me.id,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
  });
  try {
    await sendMail(
      parsed.data,
      "Einladung zu Tanztraining",
      `Hallo,\n\n${me.name} lädt dich zu Tanztraining ein. Dort findest du die Übungsvideos aus dem Training.\n\nÜber diesen Link legst du dein Konto an (${INVITE_DAYS} Tage gültig):\n${appUrl(`/einladung/${token}`)}\n\nWenn du ein Kind anmeldest: Leg das Konto mit dem Namen des Kindes an.`,
    );
  } catch (e) {
    console.error(e);
    await db.delete(invitation).where(eq(invitation.tokenHash, hashToken(token)));
    return { error: "Die E-Mail konnte nicht verschickt werden. Prüf die Adresse oder versuch es später noch einmal." };
  }
  revalidatePath("/trainer/schueler");
  return ok();
}

export async function revokeInvite(id: string) {
  await requireTrainer();
  await db.delete(invitation).where(and(eq(invitation.id, id), isNull(invitation.usedAt)));
  revalidatePath("/trainer/schueler");
}

export async function deleteStudent(userId: string) {
  await requireTrainer();
  // only students; trainers can't delete each other (or themselves) from here
  await db.delete(user).where(and(eq(user.id, userId), ne(user.role, "admin")));
  revalidatePath("/trainer/schueler");
}

export async function createCategory(_: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = z.string().trim().min(1, "Name der Kategorie fehlt").max(100).safeParse(data.get("name"));
  if (!parsed.success) return fail(parsed.error);
  const exists = await db.query.category.findFirst({ where: eq(category.name, parsed.data) });
  if (exists) return { error: "Diese Kategorie gibt es schon" };
  await db.insert(category).values({ name: parsed.data });
  revalidatePath("/trainer/kategorien");
  return ok();
}

export async function deleteCategory(categoryId: string) {
  await requireTrainer();
  // FK restrict rejects this if exercises still use it; the page only offers delete for unused ones
  await db.delete(category).where(eq(category.id, categoryId));
  revalidatePath("/trainer/kategorien");
}

export async function createGroup(_: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = z.string().trim().min(1, "Name der Gruppe fehlt").max(100).safeParse(data.get("name"));
  if (!parsed.success) return fail(parsed.error);
  const exists = await db.query.group.findFirst({ where: eq(group.name, parsed.data) });
  if (exists) return { error: "Eine Gruppe mit diesem Namen gibt es schon" };
  await db.insert(group).values({ name: parsed.data });
  revalidatePath("/trainer/gruppen");
  return ok();
}

export async function deleteGroup(groupId: string) {
  await requireTrainer();
  await db.delete(group).where(eq(group.id, groupId));
  revalidatePath("/trainer/gruppen");
}

/** Replaces the group's members with the checked students. */
export async function setGroupMembers(groupId: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const userIds = z.array(z.string().min(1)).parse(data.getAll("userIds"));
  try {
    await db.transaction(async (tx) => {
      await tx.delete(groupMember).where(eq(groupMember.groupId, groupId));
      if (userIds.length) await tx.insert(groupMember).values(userIds.map((userId) => ({ groupId, userId })));
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/trainer/gruppen");
  return ok();
}
