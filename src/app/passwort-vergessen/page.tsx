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
    <AuthShell title="Passwort vergessen" footer={<Link href="/anmelden" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Zurück zur Anmeldung</Link>}>
      {state?.ok ? (
        <p role="status">
          Wenn wir ein passendes Konto gefunden haben, ist ein Link unterwegs. Schau auch im Spam-Ordner nach.
        </p>
      ) : (
        <form action={action} className="grid gap-4">
          <p className="text-pretty text-muted-foreground">Gib die E-Mail-Adresse ein, mit der du dich anmeldest.</p>
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {state?.error && <p role="alert" className="text-sm font-medium text-destructive">{state.error}</p>}
          <Button type="submit" size="lg" disabled={pending}>{pending ? "Wird gesendet…" : "Link schicken"}</Button>
        </form>
      )}
    </AuthShell>
  );
}
