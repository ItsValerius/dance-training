"use client";

import { useMemo } from "react";
import { deleteStudent } from "@/app/trainer/actions";
import { ConfirmDelete } from "@/components/confirm-delete";
import { columnHelper, DataTable } from "@/components/data-table";
import { StudentGroupsDialog } from "@/components/student-groups-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StudentRow = { id: string; name: string; email: string; groupIds: string[] };
type Group = { id: string; name: string };

const helper = columnHelper<StudentRow>();
const sorting = [{ id: "person", desc: false }];
const ALL = "__all__";

/** Students with their groups: search by name or email, filter by group, edit groups or delete per row. */
export function StudentsTable({ students, groups }: { students: StudentRow[]; groups: Group[] }) {
  const columns = useMemo(() => {
    const name = new Map(groups.map((g) => [g.id, g.name]));
    const chips = (ids: string[]) =>
      ids.length === 0 ? (
        <span className="text-sm text-muted-foreground">keine Gruppe</span>
      ) : (
        ids.map((id) => <Badge key={id} variant="secondary">{name.get(id)}</Badge>)
      );
    return helper.columns([
      helper.accessor((s) => `${s.name} ${s.email}`, {
        id: "person",
        header: "Name",
        sortFn: "text",
        filterFn: "includesString",
        cell: ({ row }) => (
          <span className="grid gap-0.5">
            <span className="font-semibold">{row.original.name}</span>
            <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
            <span className="mt-1 flex flex-wrap gap-1 sm:hidden">{chips(row.original.groupIds)}</span>
          </span>
        ),
      }),
      helper.accessor("groupIds", {
        header: "Gruppen",
        enableSorting: false,
        filterFn: "arrIncludes",
        cell: ({ row }) => <span className="flex flex-wrap gap-1">{chips(row.original.groupIds)}</span>,
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Aktionen</span>,
        cell: ({ row }) => (
          <span className="inline-flex">
            <StudentGroupsDialog student={row.original} groups={groups} />
            <ConfirmDelete
              label={`${row.original.name} löschen`}
              action={deleteStudent.bind(null, row.original.id)}
              title={`${row.original.name} löschen?`}
              description="Konto und Gruppenmitgliedschaften werden entfernt. Das lässt sich nicht rückgängig machen."
            />
          </span>
        ),
      }),
    ]);
  }, [groups]);
  const items = [{ value: ALL, label: "Alle Gruppen" }, ...groups.map((g) => ({ value: g.id, label: g.name }))];

  return (
    <DataTable
      columns={columns}
      data={students}
      initialSorting={sorting}
      mobileHidden={["groupIds"]}
      empty="Noch keine Schüler. Lade jemanden per E-Mail ein."
      toolbar={(table) => {
        const person = table.getColumn("person");
        const group = table.getColumn("groupIds");
        return (
          <>
            <Input placeholder="Suchen" aria-label="Name oder E-Mail suchen" value={(person?.getFilterValue() as string) ?? ""} onChange={(e) => person?.setFilterValue(e.target.value)} className="min-w-0 flex-1 sm:max-w-xs" />
            {groups.length > 0 && (
              <Select items={items} value={(group?.getFilterValue() as string[] | undefined)?.[0] ?? ALL} onValueChange={(v) => group?.setFilterValue(v === ALL ? undefined : [v])}>
                <SelectTrigger aria-label="Nach Gruppe filtern" className="max-w-[45%] shrink-0 sm:min-w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </>
        );
      }}
    />
  );
}
