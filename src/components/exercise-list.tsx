"use client";

import { ChevronDown, CircleCheckBig } from "lucide-react";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { cn } from "cn";
import { DoneToggle } from "@/components/done-toggle";
import { Video } from "@/components/video";

export type ExerciseItem = { id: string; title: string; description: string | null; youtubeId: string; done: boolean };
export type CategoryGroup = { category: string; items: ExerciseItem[] };

/**
 * Open work as full cards, finished work folded into rows. An exercise whose video was started on this
 * visit keeps the layout it was played in (card or row) until the next visit, so ticking or unticking never
 * unmounts a playing video; category order freezes while any video is in use so nothing moves under the thumb.
 */
export function ExerciseList({ groups }: { groups: CategoryGroup[] }) {
  const [played, setPlayed] = useState<ReadonlyMap<string, "card" | "row">>(new Map());
  // category order as it was when the first video started; frozen from then on (new categories go last)
  const [frozen, setFrozen] = useState<string[] | null>(null);

  const sorted = frozen
    ? [...groups].sort((a, b) => rank(frozen, a.category) - rank(frozen, b.category))
    : [...groups].sort((a, b) => Number(b.items.some((e) => !e.done)) - Number(a.items.some((e) => !e.done)));
  const freeze = () => setFrozen((f) => f ?? sorted.map((g) => g.category));
  const markPlayed = (id: string, as: "card" | "row") => {
    setPlayed((m) => (m.has(id) ? m : new Map(m).set(id, as)));
    freeze();
  };

  // The pressed button unmounts when an exercise changes layout (card <-> row). Once the server's data shows
  // the new state, put keyboard focus on the exercise's new control: the row's summary, else its toggle.
  const pendingFocus = useRef<{ id: string; done: boolean } | null>(null);
  const onToggle = (id: string, done: boolean) => {
    freeze(); // the first tick of a visit fixes the category order, so nothing jumps under the thumb
    pendingFocus.current = { id, done };
  };
  useEffect(() => {
    const want = pendingFocus.current;
    if (!want) return;
    const item = groups.flatMap((g) => g.items).find((e) => e.id === want.id);
    if (!item || item.done !== want.done) return;
    const box = document.querySelector(`[data-exercise="${want.id}"]`);
    (box?.querySelector<HTMLElement>("summary") ?? box?.querySelector<HTMLElement>("[data-toggle]"))?.focus();
    pendingFocus.current = null;
  }, [groups]);

  return sorted.map(({ category, items }) => {
    const isRow = (e: ExerciseItem) => played.get(e.id) ?? (e.done ? "row" : "card");
    const cards = items.filter((e) => isRow(e) === "card");
    const rows = items.filter((e) => isRow(e) === "row");
    const doneCount = items.filter((e) => e.done).length;
    return (
      <section key={category} className="space-y-3">
        <ViewTransition name={`category-${category}`} share="morph heading" update="morph heading" default="none">
          <h2 className="flex items-baseline gap-2 text-lg font-extrabold">
            {category}
            <span className={cn("text-sm font-semibold", doneCount < items.length ? "text-muted-foreground" : "text-success-ink")}>
              {doneCount}/{items.length}
              <span className="sr-only"> erledigt</span>
            </span>
          </h2>
        </ViewTransition>
        <div className="grid gap-5">
          {cards.map((e) => (
            <ViewTransition key={e.id} name={`exercise-${e.id}`} share="morph lift" update="morph" default="none">
              <article
                id={`uebung-${e.id}`}
                data-exercise={e.id}
                className={cn("surface flex scroll-mt-20 flex-col overflow-hidden transition-colors", e.done && "border-success/40 bg-success-soft")}
              >
                <Video id={e.youtubeId} title={e.title} className="rounded-none" onPlay={() => markPlayed(e.id, "card")} />
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-2">
                    <h3 className="flex-1 text-lg leading-snug font-bold break-words hyphens-auto">{e.title}</h3>
                    {e.done && <CircleCheckBig aria-hidden className="mt-0.5 size-5 shrink-0 text-success-ink" />}
                  </div>
                  {e.description && <p className="whitespace-pre-line text-muted-foreground">{e.description}</p>}
                  <DoneToggle exerciseId={e.id} done={e.done} title={e.title} onToggle={(d) => onToggle(e.id, d)} />
                </div>
              </article>
            </ViewTransition>
          ))}
        </div>
        {rows.length > 0 && (
          <ul className="grid gap-2">
            {rows.map((e) => (
              <ViewTransition key={e.id} name={`exercise-${e.id}`} share="morph lift" update="morph" default="none">
                <li data-exercise={e.id}>
                  <details className="group surface overflow-hidden border-success/40 bg-success-soft transition-colors hover:border-success/70">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                      <CircleCheckBig aria-hidden className="size-5 shrink-0 text-success-ink" />
                      <span className="min-w-0 flex-1 font-bold break-words hyphens-auto">
                        {e.title}<span className="sr-only">, erledigt</span>
                      </span>
                      <span className="text-sm font-semibold text-success-ink transition-[opacity,visibility] duration-200 group-open:invisible group-open:opacity-0 motion-reduce:transition-none max-sm:sr-only">
                        Nochmal ansehen
                      </span>
                      <ChevronDown aria-hidden className="size-5 shrink-0 text-success-ink transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                    </summary>
                    <Video id={e.youtubeId} title={e.title} className="rounded-none" onPlay={() => markPlayed(e.id, "row")} />
                    <div className="flex flex-col gap-3 p-4">
                      {e.description && <p className="whitespace-pre-line text-muted-foreground">{e.description}</p>}
                      <DoneToggle exerciseId={e.id} done={e.done} title={e.title} onToggle={(d) => onToggle(e.id, d)} />
                    </div>
                  </details>
                </li>
              </ViewTransition>
            ))}
          </ul>
        )}
      </section>
    );
  });
}

const rank = (order: string[], c: string) => (order.includes(c) ? order.indexOf(c) : order.length);
