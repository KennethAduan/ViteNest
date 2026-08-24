import * as React from "react"
import type { ExtendedColumnFilter } from "@/types/data-table"

export function useFilterUpdate<TData>(
  debouncedSetFilters: (
    updater: (
      prev: ExtendedColumnFilter<TData>[]
    ) => ExtendedColumnFilter<TData>[]
  ) => void
) {
  return React.useCallback(
    (
      filterId: string,
      updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>
    ) => {
      debouncedSetFilters((prevFilters) => {
        const updatedFilters = prevFilters.map((filter) => {
          if (filter.filterId === filterId) {
            return { ...filter, ...updates } as ExtendedColumnFilter<TData>
          }
          return filter
        })
        return updatedFilters
      })
    },
    [debouncedSetFilters]
  )
}
