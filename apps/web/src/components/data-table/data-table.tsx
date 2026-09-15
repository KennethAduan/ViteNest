import { flexRender } from "@tanstack/react-table";
import type { Table as TanstackTable } from "@/lib/tanstack-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  /** Wraps the bordered table region (e.g. page-specific surface styling). */
  frameClassName?: string;
  /** Applied to the pagination row wrapper below the table. */
  paginationClassName?: string;
  /** Replaces the default “No results.” empty row. */
  emptyState?: React.ReactNode;
}

// fallow-ignore-next-line complexity
export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  frameClassName,
  paginationClassName,
  emptyState,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div
        className={cn("overflow-hidden rounded-md border", frameClassName)}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    variant="pinned"
                    data-pinned={header.column.getIsPinned() || undefined}
                    className="relative w-(--column-width) data-[pinned=start]:start-(--column-offset) data-[pinned=end]:end-(--column-offset) data-[pinned]:sticky data-[pinned]:z-1"
                    style={{
                      "--column-width": `${header.column.getSize()}px`,
                      "--column-offset": `${
                        header.column.getIsPinned() === "start"
                          ? header.column.getStart("start")
                          : header.column.getAfter("end")
                      }px`,
                      "--column-opacity": header.column.getIsPinned() ? 0.97 : 1,
                    } as React.CSSProperties}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      variant="pinned"
                      data-pinned={cell.column.getIsPinned() || undefined}
                      className="relative w-(--column-width) data-[pinned=start]:start-(--column-offset) data-[pinned=end]:end-(--column-offset) data-[pinned]:sticky data-[pinned]:z-1"
                      style={{
                        "--column-width": `${cell.column.getSize()}px`,
                        "--column-offset": `${
                          cell.column.getIsPinned() === "start"
                            ? cell.column.getStart("start")
                            : cell.column.getAfter("end")
                        }px`,
                        "--column-opacity": cell.column.getIsPinned() ? 0.97 : 1,
                      } as React.CSSProperties}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center align-middle"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      emptyState ? "min-h-56 px-6 py-10" : "h-24",
                    )}
                  >
                    {emptyState ?? "No results."}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className={cn("flex flex-col gap-2.5", paginationClassName)}>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
