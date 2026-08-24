import type { Table } from "@/lib/tanstack-table"
import type * as React from "react"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { cn } from "@/lib/utils"

interface DataTableAdvancedToolbarProps<
  TData,
> extends React.ComponentProps<"div"> {
  table: Table<TData>
  /** Right-side actions (rendered before column View options). */
  actions?: React.ReactNode
}

export function DataTableAdvancedToolbar<TData>({
  table,
  children,
  actions,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-2 p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} align="end" />
      </div>
    </div>
  )
}
