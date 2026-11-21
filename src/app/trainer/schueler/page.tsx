import { connection } from "next/server";
import { and, asc, gt, isNull } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { invitation } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { students } from "@/lib/queries";
import { deleteStudent, inviteStudent, resetPassword, revokeInvite, setContactEmail } from "../actions";

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" });

export default async function StudentsPage() {
  await requireTrainer();
  await connection(); // expiry check uses the current time
  const [all, invites] = await Promise.all([
    students(),
    db
      .select({ id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt })
      .from(invitation)
      .where(and(isNull(invitation.usedAt), gt(invitation.expiresAt, new Date())))
      .orderBy(asc(invitation.createdAt)),
  ]);

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 pt-6 pb-16 md:grid-cols-[1fr_22rem]">
      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Schüler</h1>
        {all.length === 0 && <p className="text-muted-foreground">Noch keine Schüler. Lade jemanden per E-Mail ein.</p>}
        <ul className="surface divide-y overflow-hidden">
          {all.map((s) => (
            <li key={s.id} className="grid gap-3 px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{s.name}</span>
                <span className="text-sm text-muted-foreground">{s.username}</span>
                <div className="ml-auto">
                  <ConfirmDelete action={deleteStudent.bind(null, s.id)} title={`${s.name} löschen?`} description="Konto und Gruppenmitgliedschaften werden entfernt. Das lässt sich nicht rückgängig machen." />
                </div>
              </div>
              <div className="grid gap-2 lg:grid-cols-2">
                {/* key: remount with the saved value after a change */}
                <ActionForm key={s.contactEmail ?? ""} action={setContactEmail.bind(null, s.id)} resetOnSuccess={false} className="flex items-center gap-2">
                  <Input name="contactEmail" type="email" defaultValue={s.contactEmail ?? ""} placeholder="E-Mail" aria-label={`E-Mail für ${s.name}`} className="min-w-0 flex-1 text-sm" />
                  <Button type="submit" variant="outline">Speichern</Button>
                </ActionForm>
                <ActionForm action={resetPassword.bind(null, s.id)} className="flex items-center gap-2">
                  <Input name="password" type="text" placeholder="Neues Passwort" aria-label={`Neues Passwort für ${s.name}`} minLength={8} required className="min-w-0 flex-1 text-sm" />
                  <Button type="submit" variant="outline">Zurücksetzen</Button>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-6 md:sticky md:top-20 md:h-fit">
        <Card>
          <CardHeader><CardTitle>Per E-Mail einladen</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <ActionForm action={inviteStudent} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="inviteEmail">E-Mail</Label>
                <Input id="inviteEmail" name="email" type="email" required placeholder="kind@beispiel.de" />
                <p className="text-sm text-muted-foreground">Des Kindes oder eines Elternteils. Der Link gilt 7 Tage; Name, Benutzername und Passwort wählt die Person selbst.</p>
              </div>
              <Button type="submit">Einladung senden</Button>
            </ActionForm>
            {invites.length > 0 && (
              <div className="grid gap-2">
                <p className="text-sm font-bold">Offene Einladungen</p>
                <ul className="grid gap-1">
                  {invites.map((i) => (
                    <li key={i.id} className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate" title={i.email}>{i.email}</span>
                      <span className="shrink-0 text-muted-foreground">bis {dateFmt.format(i.expiresAt)}</span>
                      <form action={revokeInvite.bind(null, i.id)}>
                        <Button type="submit" variant="ghost" className="text-destructive">Zurückziehen</Button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
