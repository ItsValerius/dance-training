import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { sendMail } from "@/lib/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  // Accounts are created by trainers only (admin plugin), never by public sign-up.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    // goes to the contact address (student or parent); the login email is only a placeholder
    sendResetPassword: async ({ user, url }) => {
      const to = (user as { contactEmail?: string | null }).contactEmail;
      if (!to) return;
      await sendMail(
        to,
        "Tanztraining: neues Passwort",
        `Hallo ${user.name},\n\nüber diesen Link kannst du ein neues Passwort für Tanztraining festlegen (1 Stunde gültig):\n${url}\n\nDein Benutzername: ${(user as { username?: string | null }).username}\n\nWenn du das nicht angefordert hast, kannst du diese Mail ignorieren.`,
      );
    },
  },
  user: { additionalFields: { contactEmail: { type: "string", required: false, input: false } } },
  plugins: [username(), admin(), nextCookies()],
});

// Roles: better-auth admin plugin's "admin" = trainer, default "user" = student.
export const isTrainer = (user: { role?: string | null }) => user.role === "admin";

// cache: Nav and the page both need the session; dedupe to one lookup per request
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/anmelden");
  return session.user;
}

export async function requireTrainer() {
  const user = await requireUser();
  if (!isTrainer(user)) redirect("/");
  return user;
}
