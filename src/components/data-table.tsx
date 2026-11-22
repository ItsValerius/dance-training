"use client";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equalsString,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ReactTable,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString, arrIncludes: filterFn_arrIncludes },
});
type Features = typeof features;
export type DataTableInstance<T extends RowData> = ReactTable<Features, T>;
export const columnHelper = <T extends RowData>() => createColumnHelper<Features, T>();

/**
 * shadcn-style data table on TanStack Table v9: sortable headers, a toolbar for filters, and rows that open
 * `rowHref`. The title cell should still be a real link so keyboard and screen-reader users can open a row.
 */
export function DataTable<T extends RowData>({
  columns,
  data,
  rowHref,
  initialSorting,
  toolbar,
  empty,
  mobileHidden = [],
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns mix value types
  columns: ColumnDef<Features, T, any>[];
  data: T[];
  rowHref?: (row: T) => string;
  initialSorting?: SortingState;
  toolbar?: (table: DataTableInstance<T>) => React.ReactNode;
  empty: string;
  /** column ids hidden below `sm`; put their info into the title cell's mobile subline instead */
  mobileHidden?: string[];
}) {
  const router = useRouter();
  const table = useTable({ features, columns, data, initialState: { sorting: initialSorting ?? [] } });
  const rows = table.getRowModel().rows;

  const open = (e: React.MouseEvent<HTMLTableRowElement>, href: string) => {
    const target = e.target as HTMLElement;
    // React bubbles clicks out of portals (dialogs) too; only react to plain clicks on the row itself
    if (!e.currentTarget.contains(target) || target.closest("a, button, input, label, [role=checkbox]")) return;
    if (e.metaKey || e.ctrlKey) window.open(href, "_blank");
    else router.push(href);
  };

  return (
    <div className="space-y-3">
      {toolbar && <div className="flex items-center gap-2 sm:gap-4">{toolbar(table)}</div>}
      <div className="surface overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined} className={cn("px-4", mobileHidden.includes(header.column.id) && "max-sm:hidden")}>
                      {header.column.getCanSort() ? (
                        <Button variant="ghost" className="-ml-4 px-4" onClick={header.column.getToggleSortingHandler()}>
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? <ArrowUp aria-hidden /> : sorted === "desc" ? <ArrowDown aria-hidden /> : <ArrowUpDown aria-hidden className="opacity-40" />}
                        </Button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 px-4 text-center text-muted-foreground">
                  {data.length === 0 ? empty : "Keine Treffer."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} onClick={rowHref && ((e) => open(e, rowHref(row.original)))} className={cn(rowHref && "cursor-pointer")}>
                  {row.getAllCells().map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "h-14", // one row height whether or not a cell holds a chip
                        cell.column.id === "actions" ? "w-px px-2 text-right whitespace-nowrap" : "px-4",
                        i === 0 && "whitespace-normal", // the title cell carries the phone subline; let it wrap
                        mobileHidden.includes(cell.column.id) && "max-sm:hidden",
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
