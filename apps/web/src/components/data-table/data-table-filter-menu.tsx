import {
  Badge as BadgeIcon,
  Calendar as CalendarIcon,
  Check,
  Filter,
  X,
  Type,
} from "lucide-react"
import * as React from "react"
import type { Column, Table } from "@/lib/tanstack-table"

import type { ExtendedColumnFilter, FilterOperator } from "@/types/data-table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
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

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useFilterUpdate } from "@/hooks/use-filter-update"
import { useFilterTriggerKeyDown } from "@/hooks/use-filter-trigger-key-down"
import { useFiltersQueryState } from "@/hooks/use-filters-query-state"
import { FilterDateCalendars } from "@/components/data-table/data-table-filter-date-calendars"
import { generateId } from "@/lib/id"
import { cn } from "@/lib/utils"
import { DataTableFilterFieldSelector } from "@/components/data-table/data-table-filter-field-selector"
import { useDataTableFilterItemControls } from "@/hooks/use-data-table-filter-item-controls"
import { getDefaultFilterOperator, getDateFilterValues } from "@/lib/data-table"

const DEBOUNCE_MS = 300
const THROTTLE_MS = 50
const FILTER_SHORTCUT_KEY = "f"
const REMOVE_FILTER_SHORTCUTS = ["backspace", "delete"]

interface DataTableFilterMenuProps<TData> extends React.ComponentProps<
  typeof PopoverContent
> {
  table: Table<TData>
  debounceMs?: number
  throttleMs?: number
  shallow?: boolean
  disabled?: boolean
}

// fallow-ignore-next-line complexity
export function DataTableFilterMenu<TData>({
  table,
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  shallow = true,
  disabled,
  ...props
}: DataTableFilterMenuProps<TData>) {
  const id = React.useId()

  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.columnDef.enableColumnFilter)
  }, [table])

  const [open, setOpen] = React.useState(false)
  const [selectedColumn, setSelectedColumn] =
    React.useState<Column<TData> | null>(null)
  const [inputValue, setInputValue] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const onOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setTimeout(() => {
        setSelectedColumn(null)
        setInputValue("")
      }, 100)
    }
  }, [])

  const onInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        REMOVE_FILTER_SHORTCUTS.includes(event.key.toLowerCase()) &&
        !inputValue &&
        selectedColumn
      ) {
        event.preventDefault()
        setSelectedColumn(null)
      }
    },
    [inputValue, selectedColumn]
  )

  const { filters, debouncedSetFilters } = useFiltersQueryState(
    table,
    columns,
    shallow,
    throttleMs,
    debounceMs
  )

  const onFilterAdd = React.useCallback(
    // fallow-ignore-next-line complexity
    (column: Column<TData>, value: string) => {
      if (!value.trim() && column.columnDef.meta?.variant !== "boolean") {
        return
      }

      const filterValue =
        column.columnDef.meta?.variant === "multiSelect" ? [value] : value

      const newFilter: ExtendedColumnFilter<TData> = {
        id: column.id as Extract<keyof TData, string>,
        value: filterValue,
        variant: column.columnDef.meta?.variant ?? "text",
        operator: getDefaultFilterOperator(
          column.columnDef.meta?.variant ?? "text"
        ),
        filterId: generateId({ length: 8 }),
      }

      debouncedSetFilters([...filters, newFilter])
      setOpen(false)

      setTimeout(() => {
        setSelectedColumn(null)
        setInputValue("")
      }, 100)
    },
    [filters, debouncedSetFilters]
  )

  const onFilterRemove = React.useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter(
        (filter) => filter.filterId !== filterId
      )
      debouncedSetFilters(updatedFilters)
      requestAnimationFrame(() => {
        triggerRef.current?.focus()
      })
    },
    [filters, debouncedSetFilters]
  )

  const onFilterUpdate = useFilterUpdate<TData>(debouncedSetFilters)

  const onFiltersReset = React.useCallback(() => {
    debouncedSetFilters([])
  }, [debouncedSetFilters])

  const toggleOpen = React.useCallback(() => setOpen((prev) => !prev), [])
  useKeyboardShortcut(FILTER_SHORTCUT_KEY, toggleOpen)

  const onTriggerKeyDown = useFilterTriggerKeyDown(
    REMOVE_FILTER_SHORTCUTS,
    filters,
    onFilterRemove
  )

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <DataTableFilterItem
          key={filter.filterId}
          filter={filter}
          filterItemId={`${id}-filter-${filter.filterId}`}
          columns={columns}
          onFilterUpdate={onFilterUpdate}
          onFilterRemove={onFilterRemove}
        />
      ))}
      {filters.length > 0 && (
        <Button
          aria-label="Reset all filters"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onFiltersReset}
        >
          <X />
        </Button>
      )}
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          render={
            <Button
              aria-label="Open filter command menu"
              variant="outline"
              size={filters.length > 0 ? "icon" : "sm"}
              className={cn(filters.length > 0 && "size-8", "h-8 font-normal")}
              ref={triggerRef}
              onKeyDown={onTriggerKeyDown}
              disabled={disabled}
            />
          }
        >
          <Filter className="text-muted-foreground" />
          {filters.length > 0 ? null : "Filter"}
        </PopoverTrigger>
        <PopoverContent
          className="w-full max-w-(--available-width) p-0"
          {...props}
        >
          <Command loop className="[&_[cmdk-input-wrapper]_svg]:hidden">
            <CommandInput
              ref={inputRef}
              placeholder={
                selectedColumn
                  ? (selectedColumn.columnDef.meta?.label ?? selectedColumn.id)
                  : "Search fields..."
              }
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={onInputKeyDown}
            />
            <CommandList>
              {selectedColumn ? (
                <>
                  {selectedColumn.columnDef.meta?.options && (
                    <CommandEmpty>No options found.</CommandEmpty>
                  )}
                  <FilterValueSelector
                    column={selectedColumn}
                    value={inputValue}
                    onSelect={(value) => onFilterAdd(selectedColumn, value)}
                  />
                </>
              ) : (
                <>
                  <CommandEmpty>No fields found.</CommandEmpty>
                  <CommandGroup>
                    {columns.map(
                      // fallow-ignore-next-line complexity
                      (column) => (
                        <CommandItem
                          key={column.id}
                          value={column.id}
                          onSelect={() => {
                            setSelectedColumn(column)
                            setInputValue("")
                            requestAnimationFrame(() => {
                              inputRef.current?.focus()
                            })
                          }}
                        >
                          {column.columnDef.meta?.icon && (
                            <column.columnDef.meta.icon />
                          )}
                          <span className="truncate">
                            {column.columnDef.meta?.label ?? column.id}
                          </span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ul>
  )
}

interface DataTableFilterItemProps<TData> {
  filter: ExtendedColumnFilter<TData>
  filterItemId: string
  columns: Array<Column<TData>>
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  onFilterRemove: (filterId: string) => void
}

function DataTableFilterItem<TData>({
  filter,
  filterItemId,
  columns,
  onFilterUpdate,
  onFilterRemove,
}: DataTableFilterItemProps<TData>) {
  const {
    showFieldSelector,
    setShowFieldSelector,
    showOperatorSelector,
    setShowOperatorSelector,
    showValueSelector,
    setShowValueSelector,
    column,
    fieldListboxId,
    operatorListboxId,
    inputId,
    filterOperators,
    onItemKeyDown,
  } = useDataTableFilterItemControls({
    filter,
    filterItemId,
    columns,
    onFilterRemove,
  })

  if (!column) return null

  return (
    <li
      key={filter.filterId}
      id={filterItemId}
      className="flex h-8 items-center rounded-md bg-background"
    >
      <DataTableFilterFieldSelector
        filter={filter}
        columns={columns}
        column={column}
        listboxId={fieldListboxId}
        open={showFieldSelector}
        onOpenChange={setShowFieldSelector}
        onFilterUpdate={onFilterUpdate}
        variant="menu"
      />
      <Select
        open={showOperatorSelector}
        onOpenChange={setShowOperatorSelector}
        value={filter.operator}
        onValueChange={(value: FilterOperator | null) => {
          if (value == null) return
          onFilterUpdate(filter.filterId, {
            operator: value,
          })
        }}
      >
        <SelectTrigger
          aria-controls={operatorListboxId}
          className="h-8 rounded-none border-r-0 px-2.5 data-size:h-8 [&_svg]:hidden"
        >
          <SelectValue placeholder={filter.operator} />
        </SelectTrigger>
        <SelectContent id={operatorListboxId}>
          {filterOperators.map((operator) => (
            <SelectItem key={operator.value} value={operator.value}>
              {operator.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onFilterInputRender({
        filter,
        column,
        inputId,
        onFilterUpdate,
        showValueSelector,
        setShowValueSelector,
      })}
      <Button
        aria-controls={filterItemId}
        variant="ghost"
        size="sm"
        className="h-full rounded-none rounded-r-md border border-l-0 px-1.5 font-normal dark:bg-input/30"
        onClick={() => onFilterRemove(filter.filterId)}
        onKeyDown={onItemKeyDown}
      >
        <X className="size-3.5" />
      </Button>
    </li>
  )
}

interface FilterValueSelectorProps<TData> {
  column: Column<TData>
  value: string
  onSelect: (value: string) => void
}

// fallow-ignore-next-line complexity
function FilterValueSelector<TData>({
  column,
  value,
  onSelect,
}: FilterValueSelectorProps<TData>) {
  const variant = column.columnDef.meta?.variant ?? "text"

  switch (variant) {
    case "boolean":
      return (
        <CommandGroup>
          <CommandItem value="true" onSelect={() => onSelect("true")}>
            True
          </CommandItem>
          <CommandItem value="false" onSelect={() => onSelect("false")}>
            False
          </CommandItem>
        </CommandGroup>
      )

    case "select":
    case "multiSelect":
      return (
        <CommandGroup>
          {column.columnDef.meta?.options?.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => onSelect(option.value)}
            >
              {option.icon && <option.icon />}
              <span className="truncate">{option.label}</span>
              {option.count && (
                <span className="ml-auto font-mono text-xs">
                  {option.count}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      )

    case "date":
    case "dateRange":
      return (
        <Calendar
          autoFocus
          captionLayout="dropdown"
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onSelect(date?.getTime().toString() ?? "")}
        />
      )

    default: {
      const isEmpty = !value.trim()

      return (
        <CommandGroup>
          <CommandItem
            value={value}
            onSelect={() => onSelect(value)}
            disabled={isEmpty}
          >
            {isEmpty ? (
              <>
                <Type />
                <span>Type to add filter…</span>
              </>
            ) : (
              <>
                <BadgeIcon />
                <span className="truncate">Filter by &quot;{value}&quot;</span>
              </>
            )}
          </CommandItem>
        </CommandGroup>
      )
    }
  }
}

type MenuFilterRenderParams<TData> = {
  filter: ExtendedColumnFilter<TData>
  column: Column<TData>
  inputId: string
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  showValueSelector: boolean
  setShowValueSelector: (value: boolean) => void
}

// fallow-ignore-next-line complexity
function renderMenuTextFilter<TData>({
  filter,
  column,
  inputId,
  onFilterUpdate,
}: MenuFilterRenderParams<TData>) {
  const isNumber = filter.variant === "number" || filter.variant === "range"
  return (
    <Input
      id={inputId}
      type={isNumber ? "number" : "text"}
      inputMode={isNumber ? "numeric" : undefined}
      placeholder={column.columnDef.meta?.placeholder ?? "Enter value..."}
      className="h-full w-24 rounded-none px-1.5"
      defaultValue={typeof filter.value === "string" ? filter.value : ""}
      onChange={(event) =>
        onFilterUpdate(filter.filterId, { value: event.target.value })
      }
    />
  )
}

function renderMenuBooleanFilter<TData>({
  filter,
  inputId,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: MenuFilterRenderParams<TData>) {
  const inputListboxId = `${inputId}-listbox`
  return (
    <Select
      open={showValueSelector}
      onOpenChange={setShowValueSelector}
      value={typeof filter.value === "string" ? filter.value : "true"}
      onValueChange={(value) => {
        if (value === "true" || value === "false") {
          onFilterUpdate(filter.filterId, { value })
        }
      }}
    >
      <SelectTrigger
        id={inputId}
        aria-controls={inputListboxId}
        className="rounded-none bg-transparent px-1.5 py-0.5 [&_svg]:hidden"
      >
        <SelectValue placeholder={filter.value ? "True" : "False"} />
      </SelectTrigger>
      <SelectContent id={inputListboxId}>
        <SelectItem value="true">True</SelectItem>
        <SelectItem value="false">False</SelectItem>
      </SelectContent>
    </Select>
  )
}

// fallow-ignore-next-line complexity
function renderMenuSelectFilter<TData>({
  filter,
  column,
  inputId,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: MenuFilterRenderParams<TData>) {
  const inputListboxId = `${inputId}-listbox`
  const options = column.columnDef.meta?.options ?? []
  const selectedValues = Array.isArray(filter.value)
    ? filter.value
    : [filter.value]
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  )
  return (
    <Popover open={showValueSelector} onOpenChange={setShowValueSelector}>
      <PopoverTrigger
        render={
          <Button
            id={inputId}
            aria-controls={inputListboxId}
            variant="ghost"
            size="sm"
            className="h-full min-w-16 rounded-none border px-1.5 font-normal dark:bg-input/30"
          />
        }
      >
        {selectedOptions.length === 0 ? (
          filter.variant === "multiSelect" ? (
            "Select options..."
          ) : (
            "Select option..."
          )
        ) : (
          <>
            <div className="flex items-center gap-0">
              {selectedOptions.map((selectedOption) =>
                selectedOption.icon ? (
                  <div
                    key={selectedOption.value}
                    className="-ms-2 rounded-full border bg-background p-0.5 first:ms-0"
                  >
                    <selectedOption.icon className="size-3.5" />
                  </div>
                ) : null
              )}
            </div>
            <span className="truncate">
              {selectedOptions.length > 1
                ? `${selectedOptions.length} selected`
                : selectedOptions[0]?.label}
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent id={inputListboxId} align="start" className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    const value =
                      filter.variant === "multiSelect"
                        ? selectedValues.includes(option.value)
                          ? selectedValues.filter((v) => v !== option.value)
                          : [...selectedValues, option.value]
                        : option.value
                    onFilterUpdate(filter.filterId, { value })
                  }}
                >
                  {option.icon && <option.icon />}
                  <span className="truncate">{option.label}</span>
                  {filter.variant === "multiSelect" && (
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValues.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function renderMenuDateFilter<TData>({
  filter,
  inputId,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: MenuFilterRenderParams<TData>) {
  const inputListboxId = `${inputId}-listbox`
  const { dateValue, displayValue } = getDateFilterValues(
    filter,
    "Pick date..."
  )
  return (
    <Popover open={showValueSelector} onOpenChange={setShowValueSelector}>
      <PopoverTrigger
        render={
          <Button
            id={inputId}
            aria-controls={inputListboxId}
            variant="ghost"
            size="sm"
            className={cn(
              "h-full rounded-none border px-1.5 font-normal dark:bg-input/30",
              !filter.value && "text-muted-foreground"
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5" />
        <span className="truncate">{displayValue}</span>
      </PopoverTrigger>
      <PopoverContent id={inputListboxId} align="start" className="w-auto p-0">
        <FilterDateCalendars
          filter={filter}
          dateValue={dateValue}
          onFilterUpdate={onFilterUpdate}
        />
      </PopoverContent>
    </Popover>
  )
}

// fallow-ignore-next-line complexity
function onFilterInputRender<TData>(params: MenuFilterRenderParams<TData>) {
  const { filter } = params

  switch (filter.variant) {
    case "text":
    case "number":
    case "range":
      return renderMenuTextFilter(params)
    case "boolean":
      return renderMenuBooleanFilter(params)
    case "select":
    case "multiSelect":
      return renderMenuSelectFilter(params)
    case "date":
    case "dateRange":
      return renderMenuDateFilter(params)
    default:
      return null
  }
}
