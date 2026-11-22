import { connection } from "next/server";
import { and, asc, gt, isNull } from "drizzle-orm";
import { Suspense } from "react";
import { CreateDialog } from "@/components/create-dialog";
import { GroupsDialog } from "@/components/groups-dialog";
import { TableSkeleton } from "@/components/skeleton";
import { StudentsTable } from "@/components/students-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { group, groupMember, invitation } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { students } from "@/lib/queries";
import { inviteStudent, revokeInvite } from "../actions";

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" });

export default function StudentsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Schüler</h1>
        <div className="flex flex-wrap gap-2">
          <GroupsDialog groups={groupsWithCounts()} />
          <CreateDialog label="Einladen" title="Per E-Mail einladen" description="Der Link gilt 7 Tage." submitLabel="Einladung senden" action={inviteStudent}>
            <div className="grid gap-1.5">
              <Label htmlFor="inviteEmail">E-Mail</Label>
              <Input id="inviteEmail" name="email" type="email" required placeholder="kind@beispiel.de" aria-describedby="inviteEmail-hint" />
              <p id="inviteEmail-hint" className="text-sm text-muted-foreground">Geschwister brauchen je eine eigene Adresse.</p>
            </div>
          </CreateDialog>
        </div>
      </div>
      {/* only the data waits; heading and buttons are in the static shell */}
      <Suspense fallback={<TableSkeleton />}>
        <Students />
      </Suspense>
    </main>
  );
}

/** Not awaited by the page: the dialog unwraps it, so only its list waits for data. */
async function groupsWithCounts() {
  await requireTrainer();
  const [groups, members] = await Promise.all([db.select({ id: group.id, name: group.name }).from(group).orderBy(asc(group.name)), db.select().from(groupMember)]);
  const memberCount = Map.groupBy(members, (m) => m.groupId);
  return groups.map((g) => ({ ...g, members: memberCount.get(g.id)?.length ?? 0 }));
}

async function Students() {
  await requireTrainer();
  await connection(); // expiry check uses the current time
  const [all, groups, members, invites] = await Promise.all([
    students(),
    db.select({ id: group.id, name: group.name }).from(group).orderBy(asc(group.name)),
    db.select().from(groupMember),
    db
      .select({ id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt })
      .from(invitation)
      .where(and(isNull(invitation.usedAt), gt(invitation.expiresAt, new Date())))
      .orderBy(asc(invitation.createdAt)),
  ]);
  const groupsOf = Map.groupBy(members, (m) => m.userId);

  return (
    <>
      <StudentsTable students={all.map((s) => ({ ...s, groupIds: groupsOf.get(s.id)?.map((m) => m.groupId) ?? [] }))} groups={groups} />
      {invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Offene Einladungen</h2>
          <ul className="surface divide-y overflow-hidden">
            {invites.map((i) => (
              <li key={i.id} className="flex min-h-14 items-center gap-3 py-2 pr-2 pl-4 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold" title={i.email}>{i.email}</span>
                <span className="shrink-0 text-muted-foreground">bis {dateFmt.format(i.expiresAt)}</span>
                <form action={revokeInvite.bind(null, i.id)}>
                  <Button type="submit" variant="ghost" className="text-destructive">Zurückziehen</Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
