import type { Table } from "@/lib/tanstack-table";
import { useQueryState } from "nuqs";
import { getFiltersStateParser } from "@/lib/parsers";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export function useFiltersQueryState<TData>(
  table: Table<TData>,
  columns: Array<{ id: string }>,
  shallow: boolean,
  throttleMs: number,
  debounceMs: number,
) {
  const [filters, setFilters] = useQueryState(
    table.options.meta?.queryKeys?.filters ?? "filters",
    getFiltersStateParser<TData>(columns.map((col) => col.id))
      .withDefault([])
      .withOptions({ clearOnDefault: true, shallow, throttleMs }),
  );
  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs);
  return { filters, setFilters, debouncedSetFilters };
}
