"use client";

import { ChevronDown, CircleCheckBig } from "lucide-react";
import { useState } from "react";

export type StackPlan = { id: string; title: string; finished: boolean; view: React.ReactNode };

/**
 * The student's current plans: plans with open work first, plans already finished on arrival folded into a
 * plum row that opens to the full plan. Order and folding are fixed for the visit, so ticking the last exercise
 * celebrates in place instead of jumping the plan away; the next visit sorts again.
 */
export function PlanStack({ plans }: { plans: StackPlan[] }) {
  const [arrival] = useState(() => ({
    order: [...plans].sort((a, b) => Number(a.finished) - Number(b.finished)).map((p) => p.id),
    folded: new Set(plans.filter((p) => p.finished).map((p) => p.id)),
  }));
  const rank = (id: string) => (arrival.order.includes(id) ? arrival.order.indexOf(id) : arrival.order.length);
  const sorted = [...plans].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <div className="space-y-10">
      {sorted.map((p) =>
        arrival.folded.has(p.id) ? (
          <details key={p.id} className="group surface overflow-hidden border-success/40 bg-success-soft">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <CircleCheckBig aria-hidden className="size-5 shrink-0 text-success-ink" />
              <span className="min-w-0 flex-1 font-bold break-words">
                {p.title}
                <span className="font-semibold text-success-ink"> · alles geschafft</span>
              </span>
              <ChevronDown aria-hidden className="size-5 shrink-0 text-success-ink transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="space-y-8 bg-background p-4 pt-6">{p.view}</div>
          </details>
        ) : (
          <section key={p.id} aria-label={p.title} className="space-y-8">
            {p.view}
          </section>
        ),
      )}
    </div>
  );
}
