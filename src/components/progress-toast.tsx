"use client";

import { ArrowDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";

/** After a check-off (done count goes up on re-render) shows the new count near the thumb for a moment. */
export function ProgressToast({ done, total, nextId }: { done: number; total: number; nextId?: string }) {
  const prev = useRef(done);
  const [shown, setShown] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [held, setHeld] = useState(false); // pointer or focus inside: don't dismiss

  useEffect(() => {
    const increased = done > prev.current;
    prev.current = done;
    if (!increased) return;
    setShown(done);
    setLeaving(false);
  }, [done]);

  // with an action the toast stays longer; exit is shorter than the (400ms delayed) entrance
  useEffect(() => {
    if (shown === null || held) return;
    const stay = nextId ? 6000 : 3700;
    const leave = setTimeout(() => setLeaving(true), stay);
    const hide = setTimeout(() => setShown(null), stay + 200);
    return () => (clearTimeout(leave), clearTimeout(hide));
  }, [shown, held, nextId]);

  const goNext = () => {
    const card = nextId && document.getElementById(`uebung-${nextId}`);
    if (!card) return;
    card.scrollIntoView({ block: "start" }); // smooth via html scroll-behavior unless reduced motion
    card.querySelector("button")?.focus({ preventScroll: true });
    setShown(null);
  };

  const allDone = shown !== null && shown >= total;
  return (
    // the live region stays mounted so screen readers announce each change
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center">
      {/* all done: the card above carries the moment; screen readers still hear it */}
      {allDone && <p className="sr-only">Alles geschafft! Alle {total} Übungen erledigt.</p>}
      {shown !== null && !allDone && (
        <div
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          className={cn(
            "surface pointer-events-auto flex w-full max-w-md items-center gap-3 p-3 pl-4 motion-reduce:animate-none",
            leaving ? "animate-out fade-out slide-out-to-bottom-2 duration-200 ease-exit fill-mode-forwards" : "animate-in fade-in slide-in-from-bottom-4 duration-300 ease-enter delay-400 fill-mode-backwards",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
            <Check aria-hidden className="size-6 stroke-3" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-bold">
              {shown} von {total} erledigt
            </p>
            <ProgressBar done={shown} total={total} className="h-2" />
          </div>
          {nextId && (
            <Button type="button" onClick={goNext} className="shrink-0">
              Nächste Übung
              <ArrowDown aria-hidden className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
