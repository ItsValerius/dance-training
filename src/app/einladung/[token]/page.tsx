import { connection } from "next/server";
import Link from "next/link";
import { and, eq, gt, isNull } from "drizzle-orm";
import { acceptInvite } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { db } from "@/db";
import { invitation, user } from "@/db/schema";
import { hashToken } from "@/lib/tokens";

export default async function InvitePage({ params }: PageProps<"/einladung/[token]">) {
  const { token } = await params;
  await connection(); // expiry check uses the current time
  const invite = await db
    .select({ email: invitation.email, trainer: user.name })
    .from(invitation)
    .leftJoin(user, eq(user.id, invitation.createdById))
    .where(and(eq(invitation.tokenHash, hashToken(token)), isNull(invitation.usedAt), gt(invitation.expiresAt, new Date())))
    .get();

  if (!invite) {
    return (
      <AuthShell title="Link ungültig" footer={<Link href="/anmelden" className="font-semibold text-primary underline">Zur Anmeldung</Link>}>
        <p className="text-muted-foreground">Diese Einladung ist abgelaufen oder wurde schon benutzt. Frag deinen Trainer nach einer neuen.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Konto anlegen" footer={<>Einladung für {invite.email}</>}>
      <p className="mb-5 text-pretty text-muted-foreground">
        {invite.trainer ?? "Dein Trainer"} hat dich eingeladen. Hier findest du die Übungsvideos aus dem Training und hakst ab, was du geübt hast.
      </p>
      <ActionForm action={acceptInvite.bind(null, token)} resetOnSuccess={false} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required maxLength={100} />
          <p className="text-sm text-muted-foreground">Der Name der Tänzerin oder des Tänzers.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Benutzername</Label>
          <Input id="username" name="username" autoComplete="username" autoCapitalize="none" required pattern="[A-Za-z0-9_.]{3,30}" />
          <p className="text-sm text-muted-foreground">3–30 Zeichen: Buchstaben, Zahlen, _ oder .</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Passwort</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
          <p className="text-sm text-muted-foreground">Mindestens 8 Zeichen.</p>
        </div>
        <Button type="submit" size="lg" className="mt-1">Konto anlegen</Button>
      </ActionForm>
    </AuthShell>
  );
}
