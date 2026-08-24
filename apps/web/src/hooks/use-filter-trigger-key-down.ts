import * as React from "react"
import type { ExtendedColumnFilter } from "@/types/data-table"

export function useFilterTriggerKeyDown<TData>(
  shortcuts: readonly string[],
  filters: ExtendedColumnFilter<TData>[],
  onFilterRemove: (filterId: string) => void
) {
  return React.useCallback(
    // fallow-ignore-next-line complexity
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (shortcuts.includes(event.key.toLowerCase()) && filters.length > 0) {
        event.preventDefault()
        onFilterRemove(filters[filters.length - 1]?.filterId ?? "")
      }
    },
    [shortcuts, filters, onFilterRemove]
  )
}
