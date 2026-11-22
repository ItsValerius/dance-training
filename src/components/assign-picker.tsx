"use client";

import { Check, LoaderCircle, Undo2, UserMinus, UserPlus } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { cn } from "cn";
import type { ActionResult } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PickList } from "@/components/pick-list";

/** `value` is "g:<groupId>" or "u:<userId>"; groups list their member user ids. */
export type Target = {
  value: string;
  label: string;
  hint?: string;
  members?: string[];
};

/**
 * One picker for groups and students, plus the live list of everyone the selection reaches and why.
 * Groups stay live targets: the list is a preview, only the picked groups and students are saved.
 * A reached student can be excluded ("x:<userId>"), which beats both group and direct assignment.
 * Picks are made in a dialog and saved together with "Fertig"; excluding or re-including on the page saves right away.
 */
export function AssignPicker({
  action,
  targets,
  initial,
  done,
  total,
  children,
}: {
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  targets: Target[];
  initial: string[];
  done: Record<string, number>;
  total: number;
  /** progress summary, shown under the header */
  children?: React.ReactNode;
}) {
  const [selected, setSelected] = useState(initial.filter((v) => !v.startsWith("x:")));
  const [excluded, setExcluded] = useState(() => new Set(initial.filter((v) => v.startsWith("x:")).map((v) => v.slice(2))));
  const byValue = new Map(targets.map((t) => [t.value, t]));
  const label = (v: string) => byValue.get(v)?.label ?? "";
  const sections = [
    { label: "Gruppen", items: targets.filter((t) => t.value.startsWith("g:")).map((t) => ({ value: t.value, label: t.label, hint: memberCount(t.members?.length ?? 0) })) },
    { label: "Schüler", items: targets.filter((t) => t.value.startsWith("u:")).map((t) => ({ value: t.value, label: t.label, hint: t.hint })) },
  ].filter((g) => g.items.length);

  const [state, save, saving] = useActionState(action, undefined);

  /** Who the picked targets reach, and why; `out` marks excluded students. */
  const reach = (sel: string[], ex: Set<string>) => {
    const reasons = new Map<string, string[]>();
    const add = (id: string, why: string) => reasons.set(id, [...(reasons.get(id) ?? []), why]);
    for (const v of sel) {
      const t = byValue.get(v);
      if (!t) continue;
      if (v.startsWith("u:")) add(v.slice(2), "einzeln");
      else for (const m of t.members ?? []) add(m, t.label);
    }
    return [...reasons]
      .map(([id, why]) => ({
        id,
        name: label(`u:${id}`),
        why,
        out: ex.has(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  };
  const reached = reach(selected, excluded);
  const count = reached.filter((r) => !r.out).length;
  const exclusionCount = reached.filter((r) => r.out).length;

  const commit = (sel: string[], ex: Set<string>) => {
    setSelected(sel);
    setExcluded(ex);
    const data = new FormData();
    // only exclusions of students a group still reaches are worth saving
    for (const v of [
      ...sel,
      ...reach(sel, ex)
        .filter((r) => r.out)
        .map((r) => `x:${r.id}`),
    ])
      data.append("targets", v);
    startTransition(() => save(data));
  };
  // excluding also drops a direct assignment
  const exclude = (id: string) =>
    commit(
      selected.filter((v) => v !== `u:${id}`),
      new Set(excluded).add(id),
    );
  // picking a student again means "include them": drop any exclusion for picked students
  const pick = (values: string[]) => commit(values, new Set([...excluded].filter((id) => !values.includes(`u:${id}`))));
  const include = (id: string) => {
    const next = new Set(excluded);
    next.delete(id);
    commit(selected, next);
  };

  const status = (
    <p aria-live="polite" className="flex min-h-5 items-center gap-1.5 text-sm text-muted-foreground">
      {saving ? (
        <>
          <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
          Wird gespeichert…
        </>
      ) : state?.error ? (
        <span role="alert" className="text-destructive">
          {state.error}
        </span>
      ) : null}
    </p>
  );
  const names = selected.map(label);
  const [open, setOpen] = useState(false);
  // the dialog edits a draft; only "Fertig" saves it, closing any other way discards it
  const [draft, setDraft] = useState<string[]>([]);
  const onOpenChange = (o: boolean) => {
    if (o) setDraft(selected);
    setOpen(o);
  };
  const finish = () => {
    const same = draft.length === selected.length && draft.every((v) => selected.includes(v));
    if (!same) pick(draft);
    setOpen(false);
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <h2 className="min-w-0 flex-1 text-xl font-bold">Zugewiesen an</h2>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger render={<Button className="shrink-0" />}>
            <UserPlus aria-hidden />
            Zuweisen
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Gruppen und Schüler</DialogTitle>
              <DialogDescription>Gespeichert wird mit „Fertig“.</DialogDescription>
            </DialogHeader>
            <PickList sections={sections} selected={draft} onChange={setDraft} searchLabel="Gruppen und Schüler durchsuchen" empty="Noch keine Gruppen oder Schüler." />
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Abbrechen</DialogClose>
              <Button type="button" onClick={finish}>Fertig</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="min-w-0 flex-1 text-muted-foreground">{names.length ? `Für ${names.join(", ")}` : "Noch niemandem zugewiesen."}</p>
        {status}
      </div>
      {children}

      <div className="space-y-2">
        <h3 className="text-sm font-bold">
          Erreicht: {count} Schüler
          {exclusionCount > 0 && <span className="font-normal text-muted-foreground"> · {exclusionCount} ausgeschlossen</span>}
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
                  <span className="text-sm text-muted-foreground">{r.out ? "ausgeschlossen" : r.why.map((w) => (w === "einzeln" ? w : `über ${w}`)).join(", ")}</span>
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
    </div>
  );
}

const memberCount = (n: number) => (n === 0 ? "keine Mitglieder" : n === 1 ? "1 Mitglied" : `${n} Mitglieder`);
