import {
  Calendar,
  GripVertical,
  Filter,
  Trash2,
} from "lucide-react"
import { parseAsStringEnum, useQueryState } from "nuqs"
import * as React from "react"
import type { Column, ColumnMeta, Table } from "@/lib/tanstack-table"

import type {
  ExtendedColumnFilter,
  FilterOperator,
  FilterVariant,
  JoinOperator,
} from "@/types/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Faceted,
  FacetedBadgeList,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedList,
  FacetedTrigger,
} from "@/components/ui/faceted"
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

import { generateId } from "@/lib/id"
import { cn } from "@/lib/utils"
import {
  Sortable,
  SortableContent,
  SortableOverlay,
  SortableItem,
  SortableItemHandle,
} from "../ui/sortable"
import {
  getDateFilterValues,
  getDefaultFilterOperator,
} from "@/lib/data-table"
import { useDataTablePanel } from "@/hooks/use-data-table-panel"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { useFiltersQueryState } from "@/hooks/use-filters-query-state"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useFilterUpdate } from "@/hooks/use-filter-update"
import { useFilterTriggerKeyDown } from "@/hooks/use-filter-trigger-key-down"
import { FilterDateCalendars } from "@/components/data-table/data-table-filter-date-calendars"
import { DataTableFilterFieldSelector } from "@/components/data-table/data-table-filter-field-selector"
import { useDataTableFilterItemControls } from "@/hooks/use-data-table-filter-item-controls"

const DEBOUNCE_MS = 300
const THROTTLE_MS = 50
const FILTER_SHORTCUT_KEY = "f"
const REMOVE_FILTER_SHORTCUTS = ["backspace", "delete"]

interface DataTableFilterListProps<TData> extends React.ComponentProps<
  typeof PopoverContent
> {
  table: Table<TData>
  debounceMs?: number
  throttleMs?: number
  shallow?: boolean
  disabled?: boolean
}

// fallow-ignore-next-line complexity
export function DataTableFilterList<TData>({
  table,
  debounceMs = DEBOUNCE_MS,
  throttleMs = THROTTLE_MS,
  shallow = true,
  disabled,
  ...props
}: DataTableFilterListProps<TData>) {
  const { id, labelId, descriptionId, open, setOpen, addButtonRef } =
    useDataTablePanel()

  const columns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.columnDef.enableColumnFilter)
  }, [table])

  const { filters, setFilters, debouncedSetFilters } = useFiltersQueryState(
    table,
    columns,
    shallow,
    throttleMs,
    debounceMs
  )

  const [joinOperator, setJoinOperator] = useQueryState(
    table.options.meta?.queryKeys?.joinOperator ?? "",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  )

  // fallow-ignore-next-line complexity
  const onFilterAdd = React.useCallback(() => {
    const column = columns.at(0)

    if (!column) return

    debouncedSetFilters([
      ...filters,
      {
        id: column.id as Extract<keyof TData, string>,
        value: "",
        variant: column.columnDef.meta?.variant ?? "text",
        operator: getDefaultFilterOperator(
          column.columnDef.meta?.variant ?? "text"
        ),
        filterId: generateId({ length: 8 }),
      },
    ])
  }, [columns, filters, debouncedSetFilters])

  const onFilterUpdate = useFilterUpdate<TData>(debouncedSetFilters)

  const onFilterRemove = React.useCallback(
    (filterId: string) => {
      const updatedFilters = filters.filter(
        (filter) => filter.filterId !== filterId
      )
      void setFilters(updatedFilters)
      requestAnimationFrame(() => {
        addButtonRef.current?.focus()
      })
    },
    [filters, setFilters, addButtonRef]
  )

  const onFiltersReset = React.useCallback(() => {
    void setFilters(null)
    void setJoinOperator("and")
  }, [setFilters, setJoinOperator])

  const toggleOpen = React.useCallback(
    () => setOpen((prev) => !prev),
    [setOpen]
  )
  useKeyboardShortcut(FILTER_SHORTCUT_KEY, toggleOpen)

  const onTriggerKeyDown = useFilterTriggerKeyDown(
    REMOVE_FILTER_SHORTCUTS,
    filters,
    onFilterRemove
  )

  return (
    <Sortable
      value={filters}
      onValueChange={setFilters}
      getItemValue={(item: ExtendedColumnFilter<TData>) => item.filterId}
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
          <Filter className="text-muted-foreground" />
          Filter
          {filters.length > 0 && (
            <Badge variant="counter">
              {filters.length}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          className="w-full max-w-(--available-width) sm:min-w-[380px]"
          spacing="panel"
          {...props}
        >
          <div className="flex flex-col gap-1">
            <h4 id={labelId} className="leading-none font-medium">
              {filters.length > 0 ? "Filters" : "No filters applied"}
            </h4>
            <p
              id={descriptionId}
              className={cn(
                "text-sm text-muted-foreground",
                filters.length > 0 && "sr-only"
              )}
            >
              {filters.length > 0
                ? "Modify filters to refine your rows."
                : "Add filters to refine your rows."}
            </p>
          </div>
          {filters.length > 0 ? (
            <SortableContent
              render={
                <ul className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1" />
              }
              nativeButton={false}
            >
              {filters.map((filter, index) => (
                <DataTableFilterItem<TData>
                  key={filter.filterId}
                  filter={filter}
                  index={index}
                  filterItemId={`${id}-filter-${filter.filterId}`}
                  joinOperator={joinOperator}
                  setJoinOperator={setJoinOperator}
                  columns={columns}
                  onFilterUpdate={onFilterUpdate}
                  onFilterRemove={onFilterRemove}
                />
              ))}
            </SortableContent>
          ) : null}
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              ref={addButtonRef}
              onClick={onFilterAdd}
            >
              Add filter
            </Button>
            {filters.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onFiltersReset}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 min-w-[72px] rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  )
}

interface DataTableFilterItemProps<TData> {
  filter: ExtendedColumnFilter<TData>
  index: number
  filterItemId: string
  joinOperator: JoinOperator
  setJoinOperator: (value: JoinOperator) => void
  columns: Array<Column<TData>>
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  onFilterRemove: (filterId: string) => void
}

// fallow-ignore-next-line complexity
function DataTableFilterItem<TData>({
  filter,
  index,
  filterItemId,
  joinOperator,
  setJoinOperator,
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
    columnMeta,
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

  const joinOperatorListboxId = `${filterItemId}-join-operator-listbox`

  if (!column) return null

  return (
    <SortableItem
      value={filter.filterId}
      render={
        <li
          id={filterItemId}
          tabIndex={-1}
          className="flex items-center gap-2"
        />
      }
      nativeButton={false}
    >
      <div className="min-w-[72px] text-center">
        {index === 0 ? (
          <span className="text-sm text-muted-foreground">Where</span>
        ) : index === 1 ? (
          <Select
            value={joinOperator}
            onValueChange={(value: "and" | "or" | null) => {
              if (value !== null) {
                setJoinOperator(value)
              }
            }}
          >
            <SelectTrigger
              aria-label="Select how filters combine"
              aria-controls={joinOperatorListboxId}
              size="sm"
            >
              <SelectValue placeholder={joinOperator} />
            </SelectTrigger>
            <SelectContent
              id={joinOperatorListboxId}
              className="min-w-(--anchor-width)"
            >
              <SelectItem value="and">And</SelectItem>
              <SelectItem value="or">Or</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-muted-foreground">{joinOperator}</span>
        )}
      </div>
      <DataTableFilterFieldSelector
        filter={filter}
        columns={columns}
        column={column}
        listboxId={fieldListboxId}
        open={showFieldSelector}
        onOpenChange={setShowFieldSelector}
        onFilterUpdate={onFilterUpdate}
        variant="list"
      />
      <Select
        open={showOperatorSelector}
        onOpenChange={setShowOperatorSelector}
        value={filter.operator}
        onValueChange={(value: FilterOperator | null) => {
          if (value !== null) {
            onFilterUpdate(filter.filterId, {
              operator: value,
            })
          }
        }}
      >
        <SelectTrigger
          aria-controls={operatorListboxId}
          size="sm"
          className="w-36"
        >
          <div className="truncate">
            <SelectValue placeholder={filter.operator} />
          </div>
        </SelectTrigger>
        <SelectContent id={operatorListboxId}>
          {filterOperators.map((operator) => (
            <SelectItem key={operator.value} value={operator.value}>
              {operator.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="max-w-60 min-w-36 flex-1">
        {onFilterInputRender({
          filter,
          inputId,
          column,
          columnMeta,
          onFilterUpdate,
          showValueSelector,
          setShowValueSelector,
        })}
      </div>
      <Button
        aria-controls={filterItemId}
        variant="outline"
        size="icon"
        onClick={() => onFilterRemove(filter.filterId)}
        onKeyDown={onItemKeyDown}
      >
        <Trash2 />
      </Button>
      <SortableItemHandle
        render={
          <Button variant="outline" size="icon" />
        }
      >
        <GripVertical />
      </SortableItemHandle>
    </SortableItem>
  )
}

type ListFilterRenderParams<TData> = {
  filter: ExtendedColumnFilter<TData>
  inputId: string
  column: Column<TData>
  columnMeta?: ColumnMeta<TData, unknown>
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  showValueSelector: boolean
  setShowValueSelector: (value: boolean) => void
}

function isNumericFilterVariant(variant: FilterVariant): boolean {
  return variant === "number" || variant === "range"
}

function resolveTextFilterInputType(variant: FilterVariant) {
  return isNumericFilterVariant(variant) ? "number" : variant
}

function resolveTextFilterInputMode(variant: FilterVariant) {
  return isNumericFilterVariant(variant) ? "numeric" : undefined
}

function resolveInitialTextFilterValue(
  value: ExtendedColumnFilter<unknown>["value"]
) {
  return typeof value === "string" ? value : ""
}

function ListTextFilterInput<TData>({
  filter,
  inputId,
  columnMeta,
  onFilterUpdate,
}: ListFilterRenderParams<TData>) {
  const [value, setValue] = React.useState(() =>
    resolveInitialTextFilterValue(filter.value)
  )

  const debouncedOnFilterUpdate = useDebouncedCallback(
    (nextValue: string) =>
      onFilterUpdate(filter.filterId, { value: nextValue }),
    300
  )

  const updateFilterValue = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
      void debouncedOnFilterUpdate(event.target.value)
    },
    [debouncedOnFilterUpdate]
  )

  return (
    <Input
      id={inputId}
      type={resolveTextFilterInputType(filter.variant)}
      aria-label={`${columnMeta?.label} filter value`}
      aria-describedby={`${inputId}-description`}
      inputMode={resolveTextFilterInputMode(filter.variant)}
      placeholder={columnMeta?.placeholder ?? "Enter a value..."}
      className="h-8 w-full"
      value={value}
      onChange={updateFilterValue}
    />
  )
}

function renderListTextFilter<TData>(params: ListFilterRenderParams<TData>) {
  return (
    <ListTextFilterInput
      key={`${params.filter.filterId}-${String(params.filter.id)}`}
      {...params}
    />
  )
}

function renderListBooleanFilter<TData>({
  filter,
  inputId,
  columnMeta,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: ListFilterRenderParams<TData>) {
  if (Array.isArray(filter.value)) return null
  const inputListboxId = `${inputId}-listbox`
  return (
    <Select
      open={showValueSelector}
      onOpenChange={setShowValueSelector}
      value={filter.value}
      onValueChange={(value) =>
        onFilterUpdate(filter.filterId, { value: value as "true" | "false" })
      }
    >
      <SelectTrigger
        id={inputId}
        aria-controls={inputListboxId}
        aria-label={`${columnMeta?.label} boolean filter`}
        size="sm"
        className="w-full"
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
function renderListSelectFilter<TData>({
  filter,
  inputId,
  columnMeta,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: ListFilterRenderParams<TData>) {
  const inputListboxId = `${inputId}-listbox`
  const multiple = filter.variant === "multiSelect"
  const selectedValues = multiple
    ? Array.isArray(filter.value)
      ? filter.value
      : []
    : typeof filter.value === "string"
      ? filter.value
      : undefined
  return (
    <Faceted
      open={showValueSelector}
      onOpenChange={setShowValueSelector}
      value={selectedValues}
      onValueChange={(value) => onFilterUpdate(filter.filterId, { value })}
      multiple={multiple}
    >
      <FacetedTrigger
        render={
          <Button
            id={inputId}
            aria-controls={inputListboxId}
            aria-label={`${columnMeta?.label} filter value${multiple ? "s" : ""}`}
            variant="outline-muted"
            size="sm"
            className="w-full"
          />
        }
      >
        <FacetedBadgeList
          options={columnMeta?.options}
          placeholder={
            columnMeta?.placeholder ?? `Select option${multiple ? "s" : ""}...`
          }
        />
      </FacetedTrigger>
      <FacetedContent id={inputListboxId} className="w-[200px]">
        <FacetedInput
          aria-label={`Search ${columnMeta?.label} options`}
          placeholder={columnMeta?.placeholder ?? "Search options..."}
        />
        <FacetedList>
          <FacetedEmpty>No options found.</FacetedEmpty>
          <FacetedGroup>
            {columnMeta?.options?.map((option) => (
              <FacetedItem key={option.value} value={option.value}>
                {option.icon && <option.icon />}
                <span>{option.label}</span>
                {option.count && (
                  <span className="ml-auto font-mono text-xs">
                    {option.count}
                  </span>
                )}
              </FacetedItem>
            ))}
          </FacetedGroup>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  )
}

function renderListDateFilter<TData>({
  filter,
  inputId,
  columnMeta,
  onFilterUpdate,
  showValueSelector,
  setShowValueSelector,
}: ListFilterRenderParams<TData>) {
  const inputListboxId = `${inputId}-listbox`
  const { dateValue, displayValue } = getDateFilterValues(filter)
  return (
    <Popover open={showValueSelector} onOpenChange={setShowValueSelector}>
      <PopoverTrigger
        render={
          <Button
            id={inputId}
            aria-controls={inputListboxId}
            aria-label={`${columnMeta?.label} date filter`}
            variant="outline-muted"
            size="sm"
            className="w-full justify-start text-left"
          />
        }
      >
        <Calendar />
        <span className={cn("truncate", !filter.value && "text-muted-foreground")}>{displayValue}</span>
      </PopoverTrigger>
      <PopoverContent id={inputListboxId} align="start" className="w-auto" spacing="none">
        <FilterDateCalendars
          filter={filter}
          dateValue={dateValue}
          onFilterUpdate={onFilterUpdate}
          onAfterSingleSelect={() => setShowValueSelector(false)}
          ariaLabelPrefix={columnMeta?.label}
        />
      </PopoverContent>
    </Popover>
  )
}

// fallow-ignore-next-line complexity
function onFilterInputRender<TData>(params: ListFilterRenderParams<TData>) {
  const { filter } = params

  switch (filter.variant) {
    case "text":
    case "number":
    case "range":
      return renderListTextFilter(params)
    case "boolean":
      return renderListBooleanFilter(params)
    case "select":
    case "multiSelect":
      return renderListSelectFilter(params)
    case "date":
    case "dateRange":
      return renderListDateFilter(params)
    default:
      return null
  }
}
