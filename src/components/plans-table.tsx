"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "cn";
import { columnHelper, DataTable } from "@/components/data-table";
import { DuplicatePlan } from "@/components/duplicate-plan";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PlanRow = {
  id: string;
  title: string;
  dueDate: string;
  due: string;
  exercises: number;
  expired: boolean;
  /** group names, then names of students assigned directly */
  audience: string[];
  reached: number;
  finished: number;
};

const Audience = ({ names }: { names: string[] }) =>
  names.length === 0 ? <span className="text-muted-foreground">niemand</span> : <span>{names.join(", ")}</span>;

const Done = ({ row }: { row: PlanRow }) =>
  row.reached === 0 || row.exercises === 0 ? (
    <span className="text-muted-foreground">–</span>
  ) : (
    <span className="flex min-w-24 flex-col gap-1">
      <span className={cn("text-sm tabular-nums", row.finished === row.reached ? "font-semibold text-success-ink" : "text-muted-foreground")}>
        {row.finished}/{row.reached} fertig
      </span>
      <ProgressBar done={row.finished} total={row.reached} className="h-1.5" />
    </span>
  );

const helper = columnHelper<PlanRow>();
const columns = helper.columns([
  helper.accessor("title", {
    header: "Titel",
    sortFn: "text",
    filterFn: "includesString",
    cell: ({ row }) => (
      <span className="flex flex-wrap items-center gap-2">
        <Link href={`/trainer/plaene/${row.original.id}`} className="font-semibold underline-offset-4 hover:underline">
          {row.original.title}
        </Link>
        {row.original.expired && <Badge variant="outline" className="text-muted-foreground">abgelaufen</Badge>}
        {/* phones: the hidden columns, one fact per line */}
        <span className="grid w-full gap-0.5 text-sm text-muted-foreground sm:hidden">
          <span>fällig {row.original.due}</span>
          <span>
            {row.original.exercises} {row.original.exercises === 1 ? "Übung" : "Übungen"}
            {row.original.reached > 0 && row.original.exercises > 0 && ` · ${row.original.finished}/${row.original.reached} fertig`}
          </span>
          <span className="text-foreground">
            <Audience names={row.original.audience} />
          </span>
        </span>
      </span>
    ),
  }),
  helper.accessor("dueDate", { header: "Fällig", sortFn: "alphanumeric", cell: ({ row }) => row.original.due }),
  helper.accessor("exercises", { header: "Übungen", sortFn: "alphanumeric" }),
  helper.display({ id: "audience", header: "Für", cell: ({ row }) => <Audience names={row.original.audience} /> }),
  helper.accessor("finished", { header: "Erledigt", sortFn: "alphanumeric", cell: ({ row }) => <Done row={row.original} /> }),
  helper.display({ id: "actions", header: () => <span className="sr-only">Aktionen</span>, cell: ({ row }) => <DuplicatePlan plan={row.original} /> }),
]);
const sorting = [{ id: "dueDate", desc: false }];
const SHOW = { current: "Aktuell", expired: "Abgelaufen", all: "Alle" };
type Show = keyof typeof SHOW;
const SHOW_ITEMS = (Object.keys(SHOW) as Show[]).map((value) => ({ value, label: SHOW[value] }));

/** Plans with title search, sortable columns and expired plans hidden unless asked for. */
export function PlansTable({ plans }: { plans: PlanRow[] }) {
  const [show, setShow] = useState<Show>("current");
  const data = useMemo(() => (show === "all" ? plans : plans.filter((p) => p.expired === (show === "expired"))), [plans, show]);
  const expired = plans.filter((p) => p.expired).length;

  return (
    <DataTable
      columns={columns}
      data={data}
      rowHref={(p) => `/trainer/plaene/${p.id}`}
      initialSorting={sorting}
      mobileHidden={["dueDate", "exercises", "audience", "finished"]}
      empty={plans.length === 0 ? "Noch keine Trainingspläne. Leg deinen ersten an." : show === "expired" ? "Keine abgelaufenen Pläne." : "Keine aktuellen Pläne."}
      toolbar={(table) => {
        const title = table.getColumn("title");
        return (
          <>
            <Input placeholder="Titel suchen" aria-label="Titel suchen" value={(title?.getFilterValue() as string) ?? ""} onChange={(e) => title?.setFilterValue(e.target.value)} className="min-w-0 flex-1 sm:max-w-xs" />
            {/* phones: same choice as a compact select, so search and filter share one row */}
            <Select items={SHOW_ITEMS} value={show} onValueChange={(v) => setShow(v as Show)}>
              <SelectTrigger aria-label="Pläne anzeigen" className="shrink-0 sm:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOW_ITEMS.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                    {i.value === "expired" && expired > 0 && ` (${expired})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div role="group" aria-label="Pläne anzeigen" className="flex shrink-0 gap-0.5 rounded-full bg-muted p-0.5 max-sm:hidden">
              {(["current", "expired", "all"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={show === v}
                  onClick={() => setShow(v)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                    show === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SHOW[v]}
                  {v === "expired" && expired > 0 && <span className="text-xs tabular-nums opacity-70">{expired}</span>}
                </button>
              ))}
            </div>
          </>
        );
      }}
    />
  );
}
