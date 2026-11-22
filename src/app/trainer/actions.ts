"use server";

import { and, eq, isNull, like, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/components/action-form";
import { db } from "@/db";
import { assignment, category, exercise, exerciseCategory, group, groupMember, invitation, planExercise, trainingPlan, user } from "@/db/schema";
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
  categoryIds: z.array(z.string().min(1)),
  youtubeId: z.string().transform((u, ctx) => youtubeId(u) ?? (ctx.addIssue({ code: "custom", message: "Kein gültiger YouTube-Link" }), z.NEVER)),
});

const parseExercise = (data: FormData) =>
  exerciseSchema.safeParse({
    title: data.get("title"),
    description: data.get("description") ?? "",
    categoryIds: data.getAll("categoryIds"),
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
  const { categoryIds, ...fields } = parsed.data;
  const planIds = z.array(z.string().min(1)).parse(data.getAll("planIds"));
  const slug = await exerciseSlug(fields.title);
  await db.transaction(async (tx) => {
    const [row] = await tx.insert(exercise).values({ ...fields, slug, createdById: me.id }).returning();
    if (categoryIds.length) await tx.insert(exerciseCategory).values(categoryIds.map((categoryId) => ({ exerciseId: row.id, categoryId })));
    if (planIds.length) await tx.insert(planExercise).values(planIds.map((planId) => ({ planId, exerciseId: row.id })));
  });
  // created from a plan page: stay there, the dialog closes and the list refreshes
  if (data.get("stay")) {
    for (const planId of planIds) revalidatePath(`/trainer/plaene/${planId}`);
    return ok();
  }
  redirect(`/trainer/uebungen/${slug}`);
}

export async function updateExercise(id: string, oldSlug: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = parseExercise(data);
  if (!parsed.success) return fail(parsed.error);
  const { categoryIds, ...fields } = parsed.data;
  const slug = await exerciseSlug(fields.title, id);
  await db.transaction(async (tx) => {
    await tx.update(exercise).set({ ...fields, slug }).where(eq(exercise.id, id));
    await tx.delete(exerciseCategory).where(eq(exerciseCategory.exerciseId, id));
    if (categoryIds.length) await tx.insert(exerciseCategory).values(categoryIds.map((categoryId) => ({ exerciseId: id, categoryId })));
  });
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

const planSchema = z.object({
  title: z.string().trim().min(1, "Titel fehlt").max(200),
  dueDate: z.iso.date("Fälligkeitsdatum fehlt"),
});
const parsePlan = (data: FormData) => planSchema.safeParse({ title: data.get("title"), dueDate: data.get("dueDate") });

export async function createPlan(_: ActionResult, data: FormData): Promise<ActionResult> {
  const me = await requireTrainer();
  const parsed = parsePlan(data);
  if (!parsed.success) return fail(parsed.error);
  const [plan] = await db.insert(trainingPlan).values({ ...parsed.data, createdById: me.id }).returning();
  redirect(`/trainer/plaene/${plan.id}`);
}

export async function updatePlan(id: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = parsePlan(data);
  if (!parsed.success) return fail(parsed.error);
  await db.update(trainingPlan).set(parsed.data).where(eq(trainingPlan.id, id));
  revalidatePath(`/trainer/plaene/${id}`);
  return ok();
}

export async function deletePlan(id: string) {
  await requireTrainer();
  await db.delete(trainingPlan).where(eq(trainingPlan.id, id));
  redirect("/trainer/plaene");
}

/** Copies a plan's exercises and assignments into a new plan with a new due date; done states start fresh. */
export async function duplicatePlan(id: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  const me = await requireTrainer();
  const parsed = parsePlan(data);
  if (!parsed.success) return fail(parsed.error);
  let newId: string;
  try {
    newId = await db.transaction(async (tx) => {
      const [plan] = await tx.insert(trainingPlan).values({ ...parsed.data, createdById: me.id }).returning();
      const exercises = await tx.select().from(planExercise).where(eq(planExercise.planId, id));
      const targets = await tx.select().from(assignment).where(eq(assignment.planId, id));
      if (exercises.length) await tx.insert(planExercise).values(exercises.map((e) => ({ planId: plan.id, exerciseId: e.exerciseId })));
      if (targets.length) await tx.insert(assignment).values(targets.map((a) => ({ planId: plan.id, userId: a.userId, groupId: a.groupId, excluded: a.excluded })));
      return plan.id;
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  redirect(`/trainer/plaene/${newId}`);
}

export async function addPlanExercise(planId: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = z.array(z.string().min(1)).min(1, "Übung wählen").safeParse(data.getAll("exerciseId"));
  if (!parsed.success) return fail(parsed.error);
  try {
    await db.insert(planExercise).values(parsed.data.map((exerciseId) => ({ planId, exerciseId }))).onConflictDoNothing();
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/trainer/plaene/${planId}`);
  return ok();
}

/** From the exercise page: puts the exercise into the picked plans. */
export async function addExerciseToPlans(exerciseId: string, slug: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const parsed = z.array(z.string().min(1)).min(1, "Plan wählen").safeParse(data.getAll("planIds"));
  if (!parsed.success) return fail(parsed.error);
  try {
    await db.insert(planExercise).values(parsed.data.map((planId) => ({ planId, exerciseId }))).onConflictDoNothing();
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/trainer/uebungen/${slug}`);
  return ok();
}

export async function removePlanExercise(planId: string, exerciseId: string) {
  await requireTrainer();
  await db.delete(planExercise).where(and(eq(planExercise.planId, planId), eq(planExercise.exerciseId, exerciseId)));
  revalidatePath(`/trainer/plaene/${planId}`);
}

/** Replaces the plan's assignments with the picked targets: "g:<groupId>", "u:<userId>" or "x:<userId>" (excluded). */
export async function setAssignments(planId: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const targets = z.array(z.string().regex(/^[gux]:.+$/)).parse(data.getAll("targets"));
  const rows = targets.map((t) => (t.startsWith("g:") ? { planId, groupId: t.slice(2) } : { planId, userId: t.slice(2), excluded: t.startsWith("x:") }));
  try {
    await db.transaction(async (tx) => {
      await tx.delete(assignment).where(eq(assignment.planId, planId));
      if (rows.length) await tx.insert(assignment).values(rows);
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath(`/trainer/plaene/${planId}`);
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
  revalidatePath("/trainer/schueler");
  return ok();
}

export async function deleteGroup(groupId: string) {
  await requireTrainer();
  await db.delete(group).where(eq(group.id, groupId));
  revalidatePath("/trainer/schueler");
}

/** Replaces the student's group memberships with the picked groups. */
export async function setStudentGroups(userId: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  await requireTrainer();
  const groupIds = z.array(z.string().min(1)).parse(data.getAll("groupIds"));
  try {
    await db.transaction(async (tx) => {
      await tx.delete(groupMember).where(eq(groupMember.userId, userId));
      if (groupIds.length) await tx.insert(groupMember).values(groupIds.map((groupId) => ({ groupId, userId })));
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/trainer/schueler");
  revalidatePath("/trainer/plaene/[id]", "page");
  return ok();
}
