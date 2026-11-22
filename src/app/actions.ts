"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/components/action-form";
import { db } from "@/db";
import { completion, invitation, user } from "@/db/schema";
import { auth, requireUser } from "@/lib/auth";
import { isAssigned } from "@/lib/queries";
import { appUrl, sendMail } from "@/lib/mail";
import { hashToken } from "@/lib/tokens";

/** Student checks an exercise off (or un-checks it). Only exercises assigned to them. */
export async function setDone(exerciseId: string, done: boolean): Promise<{ ok: boolean }> {
  const me = await requireUser();
  if (typeof exerciseId !== "string" || !(await isAssigned(me.id, exerciseId))) return { ok: false };
  try {
    if (done) await db.insert(completion).values({ userId: me.id, exerciseId }).onConflictDoNothing();
    else await db.delete(completion).where(and(eq(completion.userId, me.id), eq(completion.exerciseId, exerciseId)));
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
  revalidatePath("/");
  revalidatePath("/trainer/uebungen/[slug]", "page");
  return { ok: true };
}

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(100),
  // mirrors better-auth username plugin defaults
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,30}$/, "Benutzername: 3–30 Buchstaben, Zahlen, _ oder ."),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben").max(128),
});

/** Redeems an invite link: creates the student account and signs it in. */
export async function acceptInvite(token: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const { name, username, password } = parsed.data;
  const taken = await db.query.user.findFirst({ where: eq(user.username, username), columns: { id: true } });
  if (taken) return { error: "Benutzername ist schon vergeben" };

  // claim the invite first so a double submit can't create two accounts
  const [invite] = await db
    .update(invitation)
    .set({ usedAt: new Date() })
    .where(and(eq(invitation.tokenHash, hashToken(token)), isNull(invitation.usedAt), gt(invitation.expiresAt, new Date())))
    .returning();
  if (!invite) return { error: "Diese Einladung ist abgelaufen oder wurde schon benutzt. Frag deinen Trainer nach einer neuen." };

  try {
    await auth.api.createUser({
      body: { name, password, email: `${username}@students.invalid`, data: { username, displayUsername: username, contactEmail: invite.email } },
    });
  } catch (e) {
    console.error(e);
    await db.update(invitation).set({ usedAt: null }).where(eq(invitation.id, invite.id));
    return { error: "Etwas ist schiefgelaufen. Bitte versuch es noch einmal." };
  }
  try {
    await sendMail(
      invite.email,
      "Willkommen bei Tanztraining",
      `Hallo ${name},\n\ndein Konto ist fertig.\n\nBenutzername: ${username}\nAnmelden: ${appUrl("/anmelden")}\n\nPasswort vergessen? Auf der Anmeldeseite kannst du dir einen Link an diese Adresse schicken lassen.`,
    );
  } catch (e) {
    console.error(e); // the account exists; a missing welcome mail must not block sign-in
  }
  try {
    await auth.api.signInUsername({ body: { username, password }, headers: await headers() });
  } catch (e) {
    console.error(e);
    redirect("/anmelden"); // account exists; let them sign in by hand
  }
  redirect("/?willkommen=1");
}

// shortcut: in-memory throttle, per server instance; move to the DB if this runs on several instances
const lastResetMail = new Map<string, number>();

/**
 * Sends reset links to the contact address. Accepts a username or the contact email itself
 * (one mail per account, so siblings sharing a parent's address each get theirs). Same answer either way.
 */
export async function requestReset(_: ActionResult, data: FormData): Promise<ActionResult> {
  const input = String(data.get("username") ?? "").trim().toLowerCase();
  if (!input) return { error: "Benutzername oder E-Mail fehlt" };
  const last = lastResetMail.get(input) ?? 0;
  if (Date.now() - last > 5 * 60 * 1000) {
    lastResetMail.set(input, Date.now());
    const accounts = await db.query.user.findMany({
      where: input.includes("@") ? eq(user.contactEmail, input) : eq(user.username, input),
      columns: { email: true },
      limit: 10,
    });
    for (const u of accounts) {
      try {
        await auth.api.requestPasswordReset({ body: { email: u.email, redirectTo: "/passwort-neu" } });
      } catch (e) {
        console.error(e);
      }
    }
  }
  return { ok: Date.now() };
}

/**
 * Login accepts a username or the contact email. An email maps to its account's username when exactly one
 * account uses it; siblings sharing a parent's address must use their username.
 */
export async function resolveLogin(identifier: string): Promise<{ username: string } | { shared: true }> {
  const input = String(identifier ?? "").trim().toLowerCase();
  if (!input.includes("@")) return { username: input };
  const accounts = await db.query.user.findMany({ where: eq(user.contactEmail, input), columns: { username: true }, limit: 2 });
  if (accounts.length > 1) return { shared: true };
  // unknown email: pass it through so sign-in fails with the usual message
  return { username: accounts[0]?.username ?? input };
}
