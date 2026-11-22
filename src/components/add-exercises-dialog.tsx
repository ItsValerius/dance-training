"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { ExerciseFields } from "@/components/exercise-fields";
import { PickList, type PickItem } from "@/components/pick-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Action = (prev: ActionResult, data: FormData) => Promise<ActionResult>;

/**
 * "Übungen hinzufügen": pick exercises from the library as a checklist, or switch to "Neue Übung" and create one
 * straight into the plan. `create` must honour the hidden `planIds` and `stay` fields (see createExercise).
 */
export function AddExercisesDialog({
  planId,
  planTitle,
  exercises,
  categories,
  add,
  create,
}: {
  planId: string;
  planTitle: string;
  exercises: PickItem[];
  categories: { value: string; label: string }[];
  add: Action;
  create: Action;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"pick" | "new">("pick");
  const [picked, setPicked] = useState<string[]>([]);
  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      setView(exercises.length ? "pick" : "new");
      setPicked([]);
    }
  };
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button className="shrink-0" />}>
        <Plus aria-hidden />
        Übungen hinzufügen
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {view === "pick" ? (
          <>
            <DialogHeader>
              <DialogTitle>Übungen hinzufügen</DialogTitle>
              <DialogDescription>Hak an, was in den Plan soll.</DialogDescription>
            </DialogHeader>
            <ActionForm action={add} onSuccess={close} className="grid gap-4">
              <PickList
                sections={[{ items: exercises }]}
                selected={picked}
                onChange={setPicked}
                name="exerciseId"
                searchLabel="Übungen durchsuchen"
                empty="Alle Übungen sind schon im Plan."
              />
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setView("new")}>
                  <Plus aria-hidden />
                  Neue Übung
                </Button>
                <Button type="submit" disabled={!picked.length}>
                  {picked.length > 1 ? `${picked.length} Übungen hinzufügen` : "Hinzufügen"}
                </Button>
              </DialogFooter>
            </ActionForm>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Neue Übung</DialogTitle>
              <DialogDescription className="truncate">Landet direkt in „{planTitle}“.</DialogDescription>
            </DialogHeader>
            <ActionForm action={create} onSuccess={close} className="grid gap-3">
              <input type="hidden" name="planIds" value={planId} />
              <input type="hidden" name="stay" value="1" />
              <ExerciseFields categories={categories} />
              <DialogFooter className="sm:justify-between">
                {exercises.length > 0 ? (
                  <Button type="button" variant="outline" onClick={() => setView("pick")}>
                    <ArrowLeft aria-hidden />
                    Zur Liste
                  </Button>
                ) : (
                  <DialogClose render={<Button type="button" variant="outline" />}>Abbrechen</DialogClose>
                )}
                <Button type="submit">Anlegen</Button>
              </DialogFooter>
            </ActionForm>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
