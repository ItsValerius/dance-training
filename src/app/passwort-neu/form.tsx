"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

export function NewPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== String(form.get("repeat"))) return setError("Die beiden Passwörter sind nicht gleich.");
    setPending(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setPending(false);
    if (error) return setError("Das hat nicht geklappt. Der Link ist vielleicht abgelaufen – fordere einen neuen an.");
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-4">
        <p role="status">Dein Passwort ist geändert.</p>
        <Button size="lg" render={<Link href="/anmelden" />}>Jetzt anmelden</Button>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password">Neues Passwort</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="repeat">Noch einmal</Label>
        <PasswordInput id="repeat" name="repeat" autoComplete="new-password" required minLength={8} />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Speichern…" : "Passwort speichern"}</Button>
    </form>
  );
}
