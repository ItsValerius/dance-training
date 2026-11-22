"use client";

import { Users } from "lucide-react";
import { Suspense, use } from "react";
import { createGroup, deleteGroup } from "@/app/(app)/trainer/actions";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/skeleton";

type Group = { id: string; name: string; members: number };

/**
 * Manage groups in one place: list with member counts, delete, add. Membership itself is edited per student.
 * `groups` is a promise so the button needs no data; only the list waits, once the dialog is open.
 */
export function GroupsDialog({ groups }: { groups: Promise<Group[]> }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" className="shrink-0" />}>
        <Users aria-hidden />
        Gruppen
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gruppen</DialogTitle>
          <DialogDescription>Mitglieder legst du in der Schülertabelle fest.</DialogDescription>
        </DialogHeader>
        <ActionForm action={createGroup} className="flex gap-2">
          <Input name="name" placeholder="Neue Gruppe" aria-label="Name der neuen Gruppe" required maxLength={100} />
          <Button type="submit" className="shrink-0">Anlegen</Button>
        </ActionForm>
        <Suspense
          fallback={
            <div className="surface divide-y">
              {[0, 1].map((i) => <div key={i} className="flex min-h-12 items-center px-4"><Skeleton className="h-5 w-32 rounded-full" /></div>)}
            </div>
          }
        >
          <GroupList groups={groups} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

function GroupList({ groups: pending }: { groups: Promise<Group[]> }) {
  const groups = use(pending);
  return groups.length === 0 ? (
    <p className="text-muted-foreground">Noch keine Gruppen.</p>
  ) : (
    <ul className="surface max-h-[50dvh] divide-y overflow-y-auto">
      {groups.map((g) => (
        <li key={g.id} className="flex min-h-12 items-center gap-3 py-1 pr-1 pl-4">
          <span className="font-semibold">{g.name}</span>
          <span className="text-sm text-muted-foreground">{g.members === 1 ? "1 Mitglied" : `${g.members} Mitglieder`}</span>
          <span className="ml-auto">
            <ConfirmDelete
              label={`Gruppe ${g.name} löschen`}
              action={deleteGroup.bind(null, g.id)}
              title={`Gruppe „${g.name}“ löschen?`}
              description="Schüler bleiben, Pläne der Gruppe fallen weg."
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
