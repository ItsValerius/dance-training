import { asc } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { group, groupMember } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { students } from "@/lib/queries";
import { createGroup, deleteGroup, setGroupMembers } from "../actions";

export default async function GroupsPage() {
  await requireTrainer();
  const [groups, members, allStudents] = await Promise.all([
    db.select().from(group).orderBy(asc(group.name)),
    db.select().from(groupMember),
    students(),
  ]);
  const membersByGroup = Map.groupBy(members, (m) => m.groupId);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Gruppen</h1>
      <ActionForm action={createGroup} className="flex gap-2">
        <Input name="name" placeholder="Name der neuen Gruppe" aria-label="Name der neuen Gruppe" required maxLength={100} className="max-w-xs" />
        <Button type="submit">Gruppe anlegen</Button>
      </ActionForm>
      {groups.length === 0 && <p className="text-muted-foreground">Noch keine Gruppen.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => {
          const inGroup = new Set(membersByGroup.get(g.id)?.map((m) => m.userId));
          return (
            <Card key={g.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{g.name}</CardTitle>
                <ConfirmDelete action={deleteGroup.bind(null, g.id)} title={`Gruppe „${g.name}“ löschen?`} description="Die Schüler bleiben, verlieren aber die Übungen, die über diese Gruppe zugewiesen wurden." />
              </CardHeader>
              <CardContent>
                <ActionForm action={setGroupMembers.bind(null, g.id)} resetOnSuccess={false} className="grid gap-3">
                  <CheckList legend="Mitglieder" name="userIds" items={allStudents.map((s) => ({ id: s.id, label: s.name, checked: inGroup.has(s.id) }))} />
                  <Button type="submit" variant="outline" className="w-fit">Mitglieder speichern</Button>
                </ActionForm>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
