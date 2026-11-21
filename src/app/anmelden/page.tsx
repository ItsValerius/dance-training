"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveLogin } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const login = await resolveLogin(String(form.get("username"))).catch(() => null);
    if (!login) {
      setPending(false);
      return setError("Anmelden hat nicht geklappt. Prüf dein Internet und versuch es noch einmal.");
    }
    if ("shared" in login) {
      setPending(false);
      return setError("Diese E-Mail gehört zu mehreren Konten. Melde dich bitte mit deinem Benutzernamen an.");
    }
    const { error } = await authClient.signIn.username({ username: login.username, password: String(form.get("password")) });
    setPending(false);
    if (error) return setError("Benutzername, E-Mail oder Passwort ist falsch.");
    router.replace("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Anmelden"
      footer={<Link href="/passwort-vergessen" className="font-semibold text-primary underline">Passwort oder Benutzername vergessen?</Link>}
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <fieldset disabled={pending} className="contents">
          <div className="grid gap-2">
            <Label htmlFor="username">Benutzername oder E-Mail</Label>
            <Input id="username" name="username" autoComplete="username" autoCapitalize="none" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Passwort</Label>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </div>
        </fieldset>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={pending} className="mt-1">{pending ? "Anmelden…" : "Anmelden"}</Button>
      </form>
    </AuthShell>
  );
}
