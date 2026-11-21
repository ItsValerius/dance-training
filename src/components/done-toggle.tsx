"use client";

import { Check, Circle, Undo2 } from "lucide-react";
import { startTransition, useOptimistic, useState } from "react";
import { setDone } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { markTick } from "@/lib/celebrate";

/**
 * Open: one button "Als erledigt markieren". Done: a plain status (tapping it again does nothing)
 * plus a separate "Rückgängig" button, so a double tap can never silently un-tick.
 */
export function DoneToggle({
  exerciseId,
  done,
  title,
  onToggle,
}: {
  exerciseId: string;
  done: boolean;
  title: string;
  onToggle?: (next: boolean) => void;
}) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [failed, setFailed] = useState(false);
  const set = (next: boolean) =>
    startTransition(async () => {
      setFailed(false);
      if (next) markTick();
      onToggle?.(next);
      setOptimistic(next);
      // network errors throw, server-side refusals return ok: false; both revert the optimistic state
      const res = await setDone(exerciseId, next).catch(() => ({ ok: false }));
      if (!res.ok) setFailed(true);
    });

  return (
    <div className="grid gap-2">
      {optimistic ? (
        <div className="flex gap-2">
          {/* a status, not a button: no box, no fill */}
          <p className="flex h-11 flex-1 items-center gap-2 font-bold text-success-ink">
            <span className="grid size-7 place-items-center rounded-full bg-success text-success-foreground">
              <Check key="on" aria-hidden className="size-4 stroke-3 animate-in zoom-in-50 duration-300 ease-enter motion-reduce:animate-none" />
            </span>
            Erledigt
          </p>
          <Button type="button" variant="ghost" data-toggle aria-label={`Rückgängig: ${title}`} onClick={() => set(false)} className="text-success-ink">
            <Undo2 aria-hidden className="size-4" />
            Rückgängig
          </Button>
        </div>
      ) : (
        <Button type="button" data-toggle aria-label={`Als erledigt markieren: ${title}`} onClick={() => set(true)} className="w-full">
          <Circle aria-hidden className="size-5 stroke-[2.5]" />
          Als erledigt markieren
        </Button>
      )}
      {failed && (
        <p role="alert" className="text-center text-sm font-medium text-destructive">
          Hat nicht geklappt. Prüf dein Internet und tipp nochmal.
        </p>
      )}
    </div>
  );
}
