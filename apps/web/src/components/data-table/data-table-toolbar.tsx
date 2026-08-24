import type { Column, Table } from "@/lib/tanstack-table"
import { X } from "lucide-react"
import * as React from "react"

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.state.columnFilters.length > 0

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  )

  const onReset = React.useCallback(() => {
    // `true` forces [] — without it, reset uses `initialState.columnFilters` only.
    table.resetColumnFilters(true)
  }, [table])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full flex-col gap-3 p-1 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex w-full flex-1 flex-wrap items-stretch gap-2 sm:items-center">
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="w-full border-dashed sm:w-auto"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        {children}
        <DataTableViewOptions table={table} align="end" />
      </div>
    </div>
  )
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>
}

// fallow-ignore-next-line complexity
function renderTextFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
  const meta = column.columnDef.meta
  return (
    <Input
      placeholder={meta?.placeholder ?? meta?.label}
      value={(column.getFilterValue() as string | undefined) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="h-8 w-full sm:w-40 lg:w-56"
    />
  )
}

// fallow-ignore-next-line complexity
function renderNumberFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
  const meta = column.columnDef.meta
  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="numeric"
        placeholder={meta?.placeholder ?? meta?.label}
        value={(column.getFilterValue() as string | undefined) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className={cn("h-8 w-full sm:w-[120px]", meta?.unit && "pr-8")}
      />
      {meta?.unit && (
        <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-sm text-muted-foreground">
          {meta.unit}
        </span>
      )}
    </div>
  )
}

// fallow-ignore-next-line complexity
function renderBooleanFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
  const meta = column.columnDef.meta
  return (
    <label
      className={cn(
        "inline-flex h-8 w-full items-center justify-start gap-2 rounded-md border border-dashed px-3 text-sm font-normal sm:w-auto",
        column.getFilterValue() ? "border-solid bg-accent/40" : undefined
      )}
    >
      <Checkbox
        aria-label={meta?.trueLabel ?? meta?.label ?? column.id}
        checked={Boolean(column.getFilterValue())}
        onCheckedChange={(checked) =>
          column.setFilterValue(checked ? "true" : undefined)
        }
      />
      {meta?.trueLabel ?? meta?.label ?? column.id}
    </label>
  )
}

// fallow-ignore-next-line complexity
function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  const meta = column.columnDef.meta
  if (!meta?.variant) return null

  switch (meta.variant) {
    case "text":
      return renderTextFilter({ column })
    case "number":
      return renderNumberFilter({ column })
    case "range":
      return (
        <DataTableSliderFilter
          column={column}
          title={meta.label ?? column.id}
        />
      )
    case "date":
    case "dateRange":
      return (
        <DataTableDateFilter
          column={column}
          title={meta.label ?? column.id}
          multiple={meta.variant === "dateRange"}
        />
      )
    case "select":
    case "multiSelect":
      return (
        <DataTableFacetedFilter
          column={column}
          title={meta.label ?? column.id}
          options={meta.options ?? []}
          multiple={meta.variant === "multiSelect"}
        />
      )
    case "boolean":
      return renderBooleanFilter({ column })
    default:
      return null
  }
}
