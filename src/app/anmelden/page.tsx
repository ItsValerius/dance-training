"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const { error } = await authClient
      .signIn.email({ email: String(form.get("email")).trim().toLowerCase(), password: String(form.get("password")) })
      .catch(() => ({ error: { status: 0 } }));
    setPending(false);
    if (error) return setError(error.status ? "E-Mail oder Passwort ist falsch." : "Anmelden hat nicht geklappt. Prüf dein Internet und versuch es noch einmal.");
    router.replace("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Anmelden"
      footer={<Link href="/passwort-vergessen" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Passwort vergessen?</Link>}
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <fieldset disabled={pending} className="contents">
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
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
