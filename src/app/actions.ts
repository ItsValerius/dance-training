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

/** Student checks an exercise of a plan off (or un-checks it). Only plans assigned to them. */
export async function setDone(planId: string, exerciseId: string, done: boolean): Promise<{ ok: boolean }> {
  const me = await requireUser();
  if (typeof planId !== "string" || typeof exerciseId !== "string" || !(await isAssigned(me.id, planId, exerciseId))) return { ok: false };
  try {
    if (done) await db.insert(completion).values({ userId: me.id, planId, exerciseId }).onConflictDoNothing();
    else await db.delete(completion).where(and(eq(completion.userId, me.id), eq(completion.planId, planId), eq(completion.exerciseId, exerciseId)));
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
  revalidatePath("/");
  revalidatePath("/verlauf", "layout");
  revalidatePath("/trainer/plaene/[id]", "page");
  return { ok: true };
}

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(100),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben").max(128),
});

/** Redeems an invite link: creates the student account and signs it in. */
export async function acceptInvite(token: string, _: ActionResult, data: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  const { name, password } = parsed.data;

  // claim the invite first so a double submit can't create two accounts
  const [invite] = await db
    .update(invitation)
    .set({ usedAt: new Date() })
    .where(and(eq(invitation.tokenHash, hashToken(token)), isNull(invitation.usedAt), gt(invitation.expiresAt, new Date())))
    .returning();
  if (!invite) return { error: "Diese Einladung ist abgelaufen oder wurde schon benutzt. Frag deinen Trainer nach einer neuen." };
  const email = invite.email;
  const taken = await db.query.user.findFirst({ where: eq(user.email, email), columns: { id: true } });
  if (taken) return { error: "Für diese E-Mail gibt es schon ein Konto. Melde dich an oder nutze „Passwort vergessen“." };

  try {
    await auth.api.createUser({
      body: { name, password, email },
    });
  } catch (e) {
    console.error(e);
    await db.update(invitation).set({ usedAt: null }).where(eq(invitation.id, invite.id));
    return { error: "Etwas ist schiefgelaufen. Bitte versuch es noch einmal." };
  }
  try {
    await sendMail(
      email,
      "Willkommen bei Tanztraining",
      `Hallo ${name},\n\ndein Konto ist fertig. Du meldest dich mit dieser E-Mail-Adresse an.\n\nAnmelden: ${appUrl("/anmelden")}\n\nPasswort vergessen? Auf der Anmeldeseite kannst du dir einen Link an diese Adresse schicken lassen.`,
    );
  } catch (e) {
    console.error(e); // the account exists; a missing welcome mail must not block sign-in
  }
  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (e) {
    console.error(e);
    redirect("/anmelden"); // account exists; let them sign in by hand
  }
  redirect("/?willkommen=1");
}

// shortcut: in-memory throttle, per server instance; move to the DB if this runs on several instances
const lastResetMail = new Map<string, number>();

/** Sends a reset link if an account uses this email. Same answer either way. */
export async function requestReset(_: ActionResult, data: FormData): Promise<ActionResult> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "E-Mail fehlt" };
  const last = lastResetMail.get(email) ?? 0;
  if (Date.now() - last > 5 * 60 * 1000) {
    lastResetMail.set(email, Date.now());
    try {
      await auth.api.requestPasswordReset({ body: { email, redirectTo: "/passwort-neu" } });
    } catch (e) {
      console.error(e);
    }
  }
  return { ok: Date.now() };
}
