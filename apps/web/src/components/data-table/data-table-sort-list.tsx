import {
  ArrowDownUp,
  ArrowUpDown,
  Trash2,
  GripVertical,
} from "lucide-react"
import * as React from "react"
import type { ColumnSort, Table } from "@/lib/tanstack-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { dataTableConfig } from "@/config/data-table"
import { cn } from "@/lib/utils"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useDataTablePanel } from "@/hooks/use-data-table-panel"
import {
  Sortable,
  SortableContent,
  SortableOverlay,
  SortableItem,
  SortableItemHandle,
} from "../ui/sortable"

const SORT_SHORTCUT_KEY = "s"
const REMOVE_SORT_SHORTCUTS = ["backspace", "delete"]

interface DataTableSortListProps<TData> extends React.ComponentProps<
  typeof PopoverContent
> {
  table: Table<TData>
  disabled?: boolean
}

// fallow-ignore-next-line complexity
export function DataTableSortList<TData>({
  table,
  disabled,
  ...props
}: DataTableSortListProps<TData>) {
  const { id, labelId, descriptionId, open, setOpen, addButtonRef } =
    useDataTablePanel()

  const sorting = table.state.sorting
  const onSortingChange = table.setSorting

  // fallow-ignore-next-line complexity
  const { columnLabels, columns } = React.useMemo(() => {
    const labels = new Map<string, string>()
    const sortingIds = new Set(sorting.map((s) => s.id))
    const availableColumns: Array<{ id: string; label: string }> = []

    for (const column of table.getAllColumns()) {
      if (!column.getCanSort()) continue

      const label = column.columnDef.meta?.label ?? column.id
      labels.set(column.id, label)

      if (!sortingIds.has(column.id)) {
        availableColumns.push({ id: column.id, label })
      }
    }

    return {
      columnLabels: labels,
      columns: availableColumns,
    }
  }, [sorting, table])

  const onSortAdd = React.useCallback(() => {
    const firstColumn = columns.at(0)
    if (!firstColumn) return

    onSortingChange((prevSorting) => [
      ...prevSorting,
      { id: firstColumn.id, desc: false },
    ])
  }, [columns, onSortingChange])

  const onSortUpdate = React.useCallback(
    (sortId: string, updates: Partial<ColumnSort>) => {
      onSortingChange((prevSorting) => {
        return prevSorting.map((sort) =>
          sort.id === sortId ? { ...sort, ...updates } : sort
        )
      })
    },
    [onSortingChange]
  )

  const onSortRemove = React.useCallback(
    (sortId: string) => {
      onSortingChange((prevSorting) =>
        prevSorting.filter((item) => item.id !== sortId)
      )
    },
    [onSortingChange]
  )

  const onSortingReset = React.useCallback(
    () => onSortingChange(table.initialState.sorting),
    [onSortingChange, table.initialState.sorting]
  )

  const toggleOpen = React.useCallback(
    () => setOpen((prev) => !prev),
    [setOpen]
  )
  useKeyboardShortcut(SORT_SHORTCUT_KEY, toggleOpen)

  const onTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (
        REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase()) &&
        sorting.length > 0
      ) {
        event.preventDefault()
        onSortingReset()
      }
    },
    [sorting.length, onSortingReset]
  )

  return (
    <Sortable
      value={sorting}
      onValueChange={onSortingChange}
      getItemValue={(item) => item.id}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline-muted"
              size="sm"
              onKeyDown={onTriggerKeyDown}
              disabled={disabled}
            />
          }
        >
          <ArrowDownUp className="text-muted-foreground" />
          Sort
          {sorting.length > 0 && (
            <Badge variant="counter">
              {sorting.length}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="w-full max-w-(--available-width) sm:min-w-[380px]"
          spacing="panel"
          {...props}
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="leading-none font-medium">
              {sorting.length > 0 ? "Sort by" : "No sorting applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-sm text-muted-foreground",
                sorting.length > 0 && "sr-only"
              )}
            >
              {sorting.length > 0
                ? "Modify sorting to organize your rows."
                : "Add sorting to organize your rows."}
            </p>
          </div>
          {sorting.length > 0 && (
            <SortableContent
              render={
                <ul className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1" />
              }
              nativeButton={false}
            >
              {sorting.map((sort) => (
                <DataTableSortItem
                  key={sort.id}
                  sort={sort}
                  sortItemId={`${id}-sort-${sort.id}`}
                  columns={columns}
                  columnLabels={columnLabels}
                  onSortUpdate={onSortUpdate}
                  onSortRemove={onSortRemove}
                />
              ))}
            </SortableContent>
          )}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              ref={addButtonRef}
              onClick={onSortAdd}
              disabled={columns.length === 0}
            >
              Add sort
            </Button>
            {sorting.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSortingReset}
              >
                Reset sorting
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 w-[180px] rounded-sm bg-primary/10" />
          <div className="h-8 w-24 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  )
}

interface DataTableSortItemProps {
  sort: ColumnSort
  sortItemId: string
  columns: Array<{ id: string; label: string }>
  columnLabels: Map<string, string>
  onSortUpdate: (sortId: string, updates: Partial<ColumnSort>) => void
  onSortRemove: (sortId: string) => void
}

function DataTableSortItem({
  sort,
  sortItemId,
  columns,
  columnLabels,
  onSortUpdate,
  onSortRemove,
}: DataTableSortItemProps) {
  const fieldListboxId = `${sortItemId}-field-listbox`
  const fieldTriggerId = `${sortItemId}-field-trigger`
  const directionListboxId = `${sortItemId}-direction-listbox`

  const [showFieldSelector, setShowFieldSelector] = React.useState(false)
  const [showDirectionSelector, setShowDirectionSelector] =
    React.useState(false)

  const onItemKeyDown = React.useCallback(
    // fallow-ignore-next-line complexity
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (showFieldSelector || showDirectionSelector) {
        return
      }

      if (REMOVE_SORT_SHORTCUTS.includes(event.key.toLowerCase())) {
        event.preventDefault()
        onSortRemove(sort.id)
      }
    },
    [sort.id, showFieldSelector, showDirectionSelector, onSortRemove]
  )

  return (
    <SortableItem
      value={sort.id}
      render={
        <li id={sortItemId} tabIndex={-1} className="flex items-center gap-2" />
      }
      nativeButton={false}
    >
      <Popover open={showFieldSelector} onOpenChange={setShowFieldSelector}>
        <PopoverTrigger
          render={
            <Button
              id={fieldTriggerId}
              aria-controls={fieldListboxId}
              variant="outline-muted"
              size="sm"
              className="w-44 justify-between"
            />
          }
        >
          <span className="truncate">{columnLabels.get(sort.id)}</span>
          <ArrowUpDown className="opacity-50" />
        </PopoverTrigger>
        <PopoverContent id={fieldListboxId} className="w-(--anchor-width)" spacing="none">
          <Command>
            <CommandInput placeholder="Search fields..." />
            <CommandList>
              <CommandEmpty>No fields found.</CommandEmpty>
              <CommandGroup>
                {columns.map((column) => (
                  <CommandItem
                    key={column.id}
                    value={column.id}
                    onSelect={(value) => onSortUpdate(sort.id, { id: value })}
                  >
                    <span className="truncate">{column.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Select
        open={showDirectionSelector}
        onOpenChange={setShowDirectionSelector}
        value={sort.desc ? "desc" : "asc"}
        onValueChange={(value: string | null) =>
          onSortUpdate(sort.id, { desc: value === "desc" })
        }
      >
        <SelectTrigger
          aria-controls={directionListboxId}
          size="sm"
          className="w-32"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          id={directionListboxId}
          className="min-w-(--anchor-width)"
        >
          {dataTableConfig.sortOrders.map((order) => (
            <SelectItem key={order.value} value={order.value}>
              {order.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        aria-controls={sortItemId}
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={() => onSortRemove(sort.id)}
        onKeyDown={onItemKeyDown}
      >
        <Trash2 />
      </Button>
      <SortableItemHandle
        render={
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
          />
        }
      >
        <GripVertical />
      </SortableItemHandle>
    </SortableItem>
  )
}
