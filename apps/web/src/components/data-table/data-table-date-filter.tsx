import type { Column } from "@/lib/tanstack-table"
import { Calendar as CalendarIcon, CircleX } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/format"

type DateSelection = Array<Date> | DateRange

function getIsDateRange(value: DateSelection): value is DateRange {
  return typeof value === "object"
}

function parseAsDate(timestamp: number | string | undefined): Date | undefined {
  if (!timestamp) return undefined
  const numericTimestamp =
    typeof timestamp === "string" ? Number(timestamp) : timestamp
  const date = new Date(numericTimestamp)
  return !Number.isNaN(date.getTime()) ? date : undefined
}

// fallow-ignore-next-line complexity
function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return item
      }
      return undefined
    })
  }

  if (typeof value === "string" || typeof value === "number") {
    return [value]
  }

  return []
}

interface DataTableDateFilterProps<TData> {
  column: Column<TData, unknown>
  title?: string
  multiple?: boolean
}

// fallow-ignore-next-line complexity
export function DataTableDateFilter<TData>({
  column,
  title,
  multiple,
}: DataTableDateFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()
  const [open, setOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    undefined
  )
  // react-day-picker v9 sends { from: d, to: d } on the FIRST click (both
  // set to the same date). We use this ref to distinguish pick #1 from pick
  // #2 instead of relying on to being undefined.
  const isFirstPickRef = React.useRef(true)

  // fallow-ignore-next-line complexity
  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : []
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue)
      return {
        from: parseAsDate(timestamps[0]),
        to: parseAsDate(timestamps[1]),
      }
    }

    const timestamps = parseColumnFilterValue(columnFilterValue)
    const date = parseAsDate(timestamps[0])
    return date ? [date] : []
  }, [columnFilterValue, multiple])

  // Keep external filter resets in sync before paint without routing user
  // events through a passive effect.
  React.useLayoutEffect(() => {
    if (!columnFilterValue) {
      isFirstPickRef.current = true
    }
  }, [columnFilterValue])

  // When the popover opens, reset pick state and restore committed range so
  // an abandoned partial selection doesn't linger.
  const handleOpenChange = React.useCallback(
    // fallow-ignore-next-line complexity
    (isOpen: boolean) => {
      setOpen(isOpen)
      if (isOpen && multiple) {
        isFirstPickRef.current = true
        const committed = getIsDateRange(selectedDates)
          ? selectedDates
          : undefined
        setDraftRange(
          (committed?.from ?? committed?.to) ? committed : undefined
        )
      }
    },
    [multiple, selectedDates]
  )

  // fallow-ignore-next-line complexity
  const rangeCalendarSelected = React.useMemo((): DateRange => {
    if (columnFilterValue) {
      const committed = getIsDateRange(selectedDates)
        ? selectedDates
        : { from: undefined, to: undefined }
      return draftRange ?? committed
    }
    if (draftRange?.from && draftRange.to === undefined) {
      return draftRange
    }
    return { from: undefined, to: undefined }
  }, [columnFilterValue, draftRange, selectedDates])

  const onSelect = React.useCallback(
    // fallow-ignore-next-line complexity
    (date: Date | DateRange | undefined) => {
      if (!date) {
        isFirstPickRef.current = true
        setDraftRange(undefined)
        column.setFilterValue(undefined)
        return
      }

      if (multiple && !("getTime" in date)) {
        // First pick, or second pick that has no `to` (reset scenario where
        // the user clicked before the current `from`).
        if (isFirstPickRef.current || !date.to) {
          isFirstPickRef.current = false
          setDraftRange({ from: date.from, to: undefined })
          return
        }

        // Second pick with a complete range — commit and close.
        isFirstPickRef.current = true
        setDraftRange(date)
        if (date.from) {
          column.setFilterValue([date.from.getTime(), date.to.getTime()])
          setOpen(false)
        }
      } else if (!multiple && "getTime" in date) {
        column.setFilterValue(date.getTime())
      }
    },
    [column, multiple]
  )

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      isFirstPickRef.current = true
      setDraftRange(undefined)
      column.setFilterValue(undefined)
    },
    [column]
  )

  // fallow-ignore-next-line complexity
  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return false
      return selectedDates.from || selectedDates.to
    }
    if (!Array.isArray(selectedDates)) return false
    return selectedDates.length > 0
  }, [multiple, selectedDates])

  // fallow-ignore-next-line complexity
  const formatDateRange = React.useCallback((range: DateRange) => {
    if (!range.from && !range.to) return ""
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`
    }
    return formatDate(range.from ?? range.to)
  }, [])

  // fallow-ignore-next-line complexity
  const label = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) return null

      const hasSelectedDates = selectedDates.from || selectedDates.to
      const dateText = hasSelectedDates
        ? formatDateRange(selectedDates)
        : "Select date range"

      return (
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {hasSelectedDates && (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span>{dateText}</span>
            </>
          )}
        </span>
      )
    }

    if (getIsDateRange(selectedDates)) return null

    const hasSelectedDate = selectedDates.length > 0
    const dateText = hasSelectedDate
      ? formatDate(selectedDates[0])
      : "Select date"

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        {hasSelectedDate && (
          <>
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-4"
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    )
  }, [selectedDates, multiple, formatDateRange, title])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="filter" size="sm" />
        }
      >
        {hasValue ? (
          <button
            type="button"
            aria-label={`Clear ${title} filter`}
            onClick={onReset}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <CircleX />
          </button>
        ) : (
          <CalendarIcon />
        )}
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto" spacing="none" align="start">
        {multiple ? (
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="range"
            selected={rangeCalendarSelected}
            onSelect={onSelect}
          />
        ) : (
          <Calendar
            captionLayout="dropdown"
            mode="single"
            selected={
              !getIsDateRange(selectedDates) ? selectedDates[0] : undefined
            }
            onSelect={onSelect}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
