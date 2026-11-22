"use client";

import { Check, Undo2, UserMinus } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

/** `value` is "g:<groupId>" or "u:<userId>"; groups list their member user ids. */
export type Target = { value: string; label: string; hint?: string; members?: string[] };

/**
 * One picker for groups and students, plus the live list of everyone the selection reaches and why.
 * Groups stay live targets: the list is a preview, only the picked groups and students are saved.
 * A reached student can be excluded ("x:<userId>"), which beats both group and direct assignment.
 */
export function AssignPicker({
  action,
  targets,
  initial,
  done,
  total,
}: {
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  targets: Target[];
  initial: string[];
  done: Record<string, number>;
  total: number;
}) {
  const [selected, setSelected] = useState(initial.filter((v) => !v.startsWith("x:")));
  const [excluded, setExcluded] = useState(() => new Set(initial.filter((v) => v.startsWith("x:")).map((v) => v.slice(2))));
  const anchor = useComboboxAnchor();
  const byValue = new Map(targets.map((t) => [t.value, t]));
  const label = (v: string) => byValue.get(v)?.label ?? "";

  const reasons = new Map<string, string[]>(); // user id -> why they're reached
  const add = (id: string, why: string) => reasons.set(id, [...(reasons.get(id) ?? []), why]);
  for (const v of selected) {
    const t = byValue.get(v);
    if (!t) continue;
    if (v.startsWith("u:")) add(v.slice(2), "einzeln");
    else for (const m of t.members ?? []) add(m, t.label);
  }
  const reached = [...reasons].map(([id, why]) => ({ id, name: label(`u:${id}`), why, out: excluded.has(id) })).sort((a, b) => a.name.localeCompare(b.name, "de"));
  const count = reached.filter((r) => !r.out).length;
  // only exclusions of students a group still reaches are worth saving
  const exclusions = reached.filter((r) => r.out).map((r) => `x:${r.id}`);
  const exclude = (id: string) => {
    setSelected((s) => s.filter((v) => v !== `u:${id}`)); // excluding also drops a direct assignment
    setExcluded((x) => new Set(x).add(id));
  };
  // picking a student again means "include them": drop any exclusion for picked students
  const pick = (values: string[]) => {
    setSelected(values);
    setExcluded((x) => new Set([...x].filter((id) => !values.includes(`u:${id}`))));
  };
  const include = (id: string) =>
    setExcluded((x) => {
      const next = new Set(x);
      next.delete(id);
      return next;
    });

  return (
    <ActionForm action={action} resetOnSuccess={false} className="grid gap-4">
      {[...selected, ...exclusions].map((v) => <input key={v} type="hidden" name="targets" value={v} />)}
      <Combobox multiple autoHighlight items={targets.map((t) => t.value)} itemToStringLabel={label} value={selected} onValueChange={pick}>
        <ComboboxChips ref={anchor} className="min-h-11 bg-card px-2 py-1.5 text-base">
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((v) => (
                  <ComboboxChip key={v} className={cn("h-7 px-2 text-sm", v.startsWith("g:") && "bg-secondary text-secondary-foreground")}>
                    {label(v)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput aria-label="Gruppe oder Schüler hinzufügen" placeholder={values.length ? "" : "Gruppe oder Schüler suchen"} />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Nichts gefunden.</ComboboxEmpty>
          <ComboboxList>
            {(v: string) => (
              <ComboboxItem key={v} value={v}>
                <span className="flex-1">{label(v)}</span>
                <span className="text-sm text-muted-foreground">{byValue.get(v)?.hint ?? memberCount(byValue.get(v)?.members?.length ?? 0)}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <div className="space-y-2">
        <h3 className="text-sm font-bold">
          Erreicht: {count} Schüler
          {exclusions.length > 0 && <span className="font-normal text-muted-foreground"> · {exclusions.length} ausgeschlossen</span>}
        </h3>
        {reached.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch niemand. Wähl oben Gruppen oder Schüler aus.</p>
        ) : (
          <ul className="surface divide-y overflow-hidden">
            {reached.map((r) => {
              const n = done[r.id] ?? 0;
              const all = total > 0 && n >= total;
              return (
                <li key={r.id} className={cn("flex min-h-12 flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5 pr-2 pl-4", r.out && "bg-muted/50")}>
                  <span className={cn("font-semibold", r.out && "text-muted-foreground line-through")}>{r.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {r.out ? "ausgeschlossen" : r.why.map((w) => (w === "einzeln" ? w : `über ${w}`)).join(", ")}
                  </span>
                  {total > 0 && !r.out && (
                    <span className={cn("ml-auto flex items-center gap-1 text-sm", all ? "font-semibold text-success-ink" : "text-muted-foreground")}>
                      {all && <Check aria-hidden className="size-4 stroke-3" />}
                      {n}/{total} erledigt
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn((r.out || total === 0) && "ml-auto")}
                    aria-label={r.out ? `${r.name} wieder aufnehmen` : `${r.name} ausschließen`}
                    onClick={() => (r.out ? include(r.id) : exclude(r.id))}
                  >
                    {r.out ? <Undo2 aria-hidden /> : <UserMinus aria-hidden />}
                    <span className="max-sm:sr-only">{r.out ? "Aufnehmen" : "Ausschließen"}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Button type="submit" className="w-fit">Zuweisungen speichern</Button>
    </ActionForm>
  );
}

const memberCount = (n: number) => (n === 0 ? "keine Mitglieder" : n === 1 ? "1 Mitglied" : `${n} Mitglieder`);
