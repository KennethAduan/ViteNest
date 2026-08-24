import type {
  Column as TanstackColumn,
  ColumnDef as TanstackColumnDef,
  ColumnFiltersState,
  ColumnMeta as TanstackColumnMeta,
  ColumnSort,
  ColumnVisibilityState,
  PaginationState,
  ReactTable,
  Row as TanstackRow,
  RowData,
  RowSelectionState,
  SortingState,
  TableOptions as TanstackTableOptions,
  TableState as TanstackTableState,
  Updater,
} from "@tanstack/react-table"
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable as useTanstackTable,
} from "@tanstack/react-table"

export type {
  ColumnFiltersState,
  ColumnSort,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  Updater,
}

export type VisibilityState = ColumnVisibilityState

const tableFeatureSet = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  facetedRowModel: createFacetedRowModel(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

type Features = typeof tableFeatureSet

export type TableState = TanstackTableState<Features>
export type TableOptions<TData = unknown> = Omit<
  TanstackTableOptions<Features, TData & RowData>,
  "features"
>
export type Table<TData = unknown> = ReactTable<Features, TData & RowData>
export type Column<TData = unknown, TValue = unknown> = TanstackColumn<
  Features,
  TData & RowData,
  TValue
>
export type ColumnDef<TData = unknown, TValue = unknown> = TanstackColumnDef<
  Features,
  TData & RowData,
  TValue
>
export type Row<TData = unknown> = TanstackRow<Features, TData & RowData>
export type ColumnMeta<TData = unknown, TValue = unknown> = TanstackColumnMeta<
  Features,
  TData & RowData,
  TValue
>

export function useTable<TData>(
  options: TableOptions<TData>
): Table<TData> {
  return useTanstackTable({ ...options, features: tableFeatureSet })
}
