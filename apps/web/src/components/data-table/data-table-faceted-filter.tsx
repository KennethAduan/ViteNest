import type { Column } from "@/lib/tanstack-table"
import { Check, CirclePlus, CircleX } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Option } from "@/types/data-table"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Array<Option>
  multiple?: boolean
}

// fallow-ignore-next-line complexity
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  const columnFilterValue = column?.getFilterValue()
  const selectedValues = React.useMemo(
    () => new Set(Array.isArray(columnFilterValue) ? columnFilterValue : []),
    [columnFilterValue]
  )

  const onItemSelect = React.useCallback(
    // fallow-ignore-next-line complexity
    (option: Option, isSelected: boolean) => {
      if (!column) return

      if (multiple) {
        const newSelectedValues = new Set(selectedValues)
        if (isSelected) {
          newSelectedValues.delete(option.value)
        } else {
          newSelectedValues.add(option.value)
        }
        const filterValues = Array.from(newSelectedValues)
        column.setFilterValue(filterValues.length ? filterValues : undefined)
      } else {
        column.setFilterValue(isSelected ? undefined : [option.value])
        setOpen(false)
      }
    },
    [column, multiple, selectedValues]
  )

  const onReset = React.useCallback(() => {
    column?.setFilterValue(undefined)
  }, [column])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="filter"
            size="sm"
            className="w-full sm:w-fit"
          />
        }
      >
        {selectedValues.size > 0 ? (
          <CircleX className="opacity-70" />
        ) : (
          <CirclePlus />
        )}
        {title}
        {selectedValues.size > 0 && (
          <>
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-4"
            />
            <Badge
              variant="filter-value"
              className="lg:hidden"
            >
              {selectedValues.size}
            </Badge>
            <div className="hidden items-center gap-1 lg:flex">
              {selectedValues.size > 2 ? (
                <Badge
                  variant="filter-value"
                >
                  {selectedValues.size} selected
                </Badge>
              ) : (
                options.flatMap((option) =>
                  selectedValues.has(option.value)
                    ? [
                        <Badge
                          variant="filter-value"
                          key={option.value}
                        >
                          {option.label}
                        </Badge>,
                      ]
                    : []
                )
              )}
            </div>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-50" spacing="none" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onItemSelect(option, isSelected)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && <option.icon />}
                    <span className="truncate">{option.label}</span>
                    {option.count && (
                      <span className="ml-auto font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onReset()}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
