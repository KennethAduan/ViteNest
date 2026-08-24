import { ArrowDownUp, Check } from "lucide-react"
import type { Column } from "@/lib/tanstack-table"

import type { ExtendedColumnFilter } from "@/types/data-table"
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
import { getDefaultFilterOperator } from "@/lib/data-table"
import { cn } from "@/lib/utils"

interface DataTableFilterFieldSelectorProps<TData> {
  filter: ExtendedColumnFilter<TData>
  columns: Array<Column<TData>>
  column: Column<TData>
  listboxId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  variant: "list" | "menu"
}

// fallow-ignore-next-line complexity
function DataTableFilterFieldSelector<TData>({
  filter,
  columns,
  column,
  listboxId,
  open,
  onOpenChange,
  onFilterUpdate,
  variant,
}: DataTableFilterFieldSelectorProps<TData>) {
  const isMenu = variant === "menu"

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            aria-controls={listboxId}
            variant={isMenu ? "ghost" : "outline"}
            size="sm"
            className={
              isMenu
                ? "rounded-none rounded-l-md border border-r-0 font-normal dark:bg-input/30"
                : "w-32 justify-between rounded font-normal"
            }
          />
        }
      >
        {isMenu && column.columnDef.meta?.icon ? (
          <column.columnDef.meta.icon className="text-muted-foreground" />
        ) : null}
        <span className="truncate">
          {column.columnDef.meta?.label ?? column.id}
        </span>
        {!isMenu ? <ArrowDownUp className="opacity-50" /> : null}
      </PopoverTrigger>
      <PopoverContent
        id={listboxId}
        align="start"
        className={isMenu ? "w-48 p-0" : "w-40 p-0"}
      >
        <Command loop={isMenu}>
          <CommandInput placeholder="Search fields..." />
          <CommandList>
            <CommandEmpty>No fields found.</CommandEmpty>
            <CommandGroup>
              {columns.map(
                // fallow-ignore-next-line complexity
                (availableColumn) => (
                <CommandItem
                  key={availableColumn.id}
                  value={availableColumn.id}
                  onSelect={
                    // fallow-ignore-next-line complexity
                    (value) => {
                    const nextColumnId = isMenu ? availableColumn.id : value
                    onFilterUpdate(filter.filterId, {
                      id: nextColumnId as Extract<keyof TData, string>,
                      variant: availableColumn.columnDef.meta?.variant ?? "text",
                      operator: getDefaultFilterOperator(
                        availableColumn.columnDef.meta?.variant ?? "text"
                      ),
                      value: "",
                    })

                    onOpenChange(false)
                  }}
                >
                  {isMenu && availableColumn.columnDef.meta?.icon ? (
                    <availableColumn.columnDef.meta.icon />
                  ) : null}
                  <span className="truncate">
                    {availableColumn.columnDef.meta?.label ??
                      availableColumn.id}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto",
                      availableColumn.id === filter.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { DataTableFilterFieldSelector }
