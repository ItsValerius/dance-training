import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { NewPasswordForm } from "./form";

export default async function NewPasswordPage({ searchParams }: PageProps<"/passwort-neu">) {
  const { token, error } = await searchParams;
  if (typeof token !== "string" || error) {
    return (
      <AuthShell title="Link ungültig" footer={<Link href="/passwort-vergessen" className="font-semibold text-primary underline">Neuen Link anfordern</Link>}>
        <p className="text-muted-foreground">Dieser Link ist abgelaufen oder wurde schon benutzt. Links zum Zurücksetzen gelten eine Stunde.</p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Neues Passwort">
      <NewPasswordForm token={token} />
    </AuthShell>
  );
}
