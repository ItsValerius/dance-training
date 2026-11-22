"use client";

import Link from "next/link";
import { columnHelper, DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ExerciseRow = { id: string; slug: string; title: string; categories: string[]; plans: number };

const helper = columnHelper<ExerciseRow>();
const columns = helper.columns([
  helper.accessor("title", {
    header: "Titel",
    sortFn: "text",
    filterFn: "includesString",
    cell: ({ row }) => (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link href={`/trainer/uebungen/${row.original.slug}`} className="font-semibold underline-offset-4 hover:underline">
          {row.original.title}
        </Link>
        <span className="flex w-full items-center gap-2 text-sm text-muted-foreground sm:hidden">
          {row.original.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          {row.original.plans === 0 ? "in keinem Plan" : `in ${row.original.plans} ${row.original.plans === 1 ? "Plan" : "Plänen"}`}
        </span>
      </span>
    ),
  }),
  helper.accessor("categories", {
    header: "Kategorien",
    enableSorting: false,
    filterFn: "arrIncludes",
    cell: ({ getValue }) => <span className="flex flex-wrap gap-1">{getValue().map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</span>,
  }),
  helper.accessor("plans", { header: "In Plänen", sortFn: "alphanumeric" }),
]);
const sorting = [{ id: "title", desc: false }];
const ALL = "__all__";

/** Exercise library with title search, category filter and sortable columns. */
export function ExercisesTable({ exercises, categories }: { exercises: ExerciseRow[]; categories: string[] }) {
  const items = [{ value: ALL, label: "Alle Kategorien" }, ...categories.map((c) => ({ value: c, label: c }))];
  return (
    <DataTable
      columns={columns}
      data={exercises}
      rowHref={(e) => `/trainer/uebungen/${e.slug}`}
      initialSorting={sorting}
      mobileHidden={["categories", "plans"]}
      empty="Noch keine Übungen. Leg deine erste an."
      toolbar={(table) => {
        const title = table.getColumn("title");
        const category = table.getColumn("categories");
        return (
          <>
            <Input placeholder="Titel suchen" aria-label="Titel suchen" value={(title?.getFilterValue() as string) ?? ""} onChange={(e) => title?.setFilterValue(e.target.value)} className="min-w-0 flex-1 sm:max-w-xs" />
            <Select items={items} value={(category?.getFilterValue() as string[] | undefined)?.[0] ?? ALL} onValueChange={(v) => category?.setFilterValue(v === ALL ? undefined : [v])}>
              <SelectTrigger aria-label="Kategorie filtern" className="shrink-0 sm:min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        );
      }}
    />
  );
}
