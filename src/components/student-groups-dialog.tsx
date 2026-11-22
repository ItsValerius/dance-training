"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { setStudentGroups } from "@/app/trainer/actions";
import { ActionForm } from "@/components/action-form";
import { MultiPicker } from "@/components/multi-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Icon button + dialog to pick which groups a student belongs to. */
export function StudentGroupsDialog({ student, groups }: { student: { id: string; name: string; groupIds: string[] }; groups: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    // the picker remounts on each open, so it starts from the saved groups
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label={`Gruppen von ${student.name} bearbeiten`} />}>
        <Users aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gruppen von {student.name}</DialogTitle>
          <DialogDescription>Pläne einer Gruppe gehen an alle Mitglieder.</DialogDescription>
        </DialogHeader>
        <ActionForm action={setStudentGroups.bind(null, student.id)} onSuccess={() => setOpen(false)} resetOnSuccess={false} className="grid gap-3">
          <MultiPicker name="groupIds" options={groups.map((g) => ({ value: g.id, label: g.name }))} defaultValue={student.groupIds} ariaLabel="Gruppe hinzufügen" placeholder="Gruppe suchen" />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Abbrechen</DialogClose>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
