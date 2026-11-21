"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset } from "@/app/actions";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestReset, undefined);
  return (
    <AuthShell title="Passwort vergessen" footer={<Link href="/anmelden" className="font-semibold text-primary underline">Zurück zur Anmeldung</Link>}>
      {state?.ok ? (
        <p role="status">
          Wenn wir ein passendes Konto gefunden haben, ist ein Link unterwegs. In der Mail steht auch dein Benutzername. Schau auch im Spam-Ordner nach.
          Keine Mail bekommen? Dein Trainer kann dein Passwort zurücksetzen.
        </p>
      ) : (
        <form action={action} className="grid gap-4">
          <p className="text-pretty text-muted-foreground">Gib deinen Benutzernamen ein, oder die E-Mail-Adresse, mit der du eingeladen wurdest.</p>
          <div className="grid gap-2">
            <Label htmlFor="username">Benutzername oder E-Mail</Label>
            <Input id="username" name="username" autoComplete="username" autoCapitalize="none" required />
          </div>
          {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
          <Button type="submit" size="lg" disabled={pending}>{pending ? "Wird gesendet…" : "Link schicken"}</Button>
        </form>
      )}
    </AuthShell>
  );
}
