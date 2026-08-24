
import type { ExtendedColumnFilter } from "@/types/data-table"
import { Calendar } from "@/components/ui/calendar"

interface FilterDateCalendarsProps<TData> {
  filter: ExtendedColumnFilter<TData>
  dateValue: string[]
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
  ) => void
  onAfterSingleSelect?: () => void
  ariaLabelPrefix?: string
}

export function FilterDateCalendars<TData>({
  filter,
  dateValue,
  onFilterUpdate,
  onAfterSingleSelect,
  ariaLabelPrefix,
}: FilterDateCalendarsProps<TData>) {
  return (
    <Calendar
      {...(ariaLabelPrefix
        ? { "aria-label": `Select ${ariaLabelPrefix} date` }
        : {})}
      autoFocus
      captionLayout="dropdown"
      mode="single"
      selected={dateValue[0] ? new Date(Number(dateValue[0])) : undefined}
      onSelect={(date) => {
        onFilterUpdate(filter.filterId, {
          value: (date?.getTime() ?? "").toString(),
        })
        onAfterSingleSelect?.()
      }}
    />
  )
}
