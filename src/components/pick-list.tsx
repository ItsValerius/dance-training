"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type PickItem = { value: string; label: string; hint?: string; tags?: string[] };
export type PickSection = { label?: string; items: PickItem[] };

/**
 * Browsable checklist for dialogs: a search box over a scrolling list of rows, optionally in labelled sections.
 * Controlled with `selected`/`onChange`, else keeps its own state; with `name` it submits one hidden field per picked value.
 */
export function PickList({
  sections,
  selected,
  onChange,
  name,
  searchLabel,
  empty,
}: {
  sections: PickSection[];
  selected?: string[];
  onChange?: (values: string[]) => void;
  name?: string;
  searchLabel: string;
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const [own, setOwn] = useState<string[]>([]);
  const picked = selected ?? own;
  const set = onChange ?? setOwn;
  const q = query.trim().toLocaleLowerCase("de");
  const match = (i: PickItem) => !q || [i.label, i.hint, ...(i.tags ?? [])].some((t) => t?.toLocaleLowerCase("de").includes(q));
  const shown = sections.map((s) => ({ ...s, items: s.items.filter(match) })).filter((s) => s.items.length);
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const toggle = (v: string, on: boolean) => set(on ? [...picked, v] : picked.filter((x) => x !== v));

  return (
    <div className="grid gap-3">
      {name && picked.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {total > 6 && (
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      )}
      <div className="surface max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain">
        {total === 0 ? (
          <p className="px-4 py-6 text-center text-muted-foreground">{empty}</p>
        ) : shown.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted-foreground">Nichts gefunden.</p>
        ) : (
          shown.map((s) => (
            <div key={s.label ?? "all"} role="group" aria-label={s.label}>
              {s.label && <p className="sticky top-0 z-10 border-b bg-card px-4 pt-3 pb-1.5 text-sm font-bold text-muted-foreground">{s.label}</p>}
              <ul className="divide-y">
                {s.items.map((i) => (
                  <li key={i.value}>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-muted has-data-checked:bg-secondary/60">
                      <Checkbox checked={picked.includes(i.value)} onCheckedChange={(on) => toggle(i.value, on)} />
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold">{i.label}</span>
                        {i.tags?.map((t) => (
                          <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{t}</span>
                        ))}
                      </span>
                      {i.hint && <span className="shrink-0 text-sm text-muted-foreground">{i.hint}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
