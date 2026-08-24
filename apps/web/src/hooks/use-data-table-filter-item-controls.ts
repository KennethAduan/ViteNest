import type { Column } from "@/lib/tanstack-table";

import type {
  ExtendedColumnFilter,
  FilterOperator,
} from "@/types/data-table";
import { getFilterOperators } from "@/lib/data-table";
import { useFilterItemKeyDown } from "@/hooks/use-filter-item-key-down";
import { useFilterItemSelectorState } from "@/hooks/use-filter-item-selector-state";

interface UseDataTableFilterItemControlsProps<TData> {
  filter: ExtendedColumnFilter<TData>;
  filterItemId: string;
  columns: Array<Column<TData>>;
  onFilterRemove: (filterId: string) => void;
}

function useDataTableFilterItemControls<TData>({
  filter,
  filterItemId,
  columns,
  onFilterRemove,
}: UseDataTableFilterItemControlsProps<TData>) {
  const selectorState = useFilterItemSelectorState();
  const column = columns.find(
    (availableColumn) => availableColumn.id === filter.id,
  );

  const onItemKeyDown = useFilterItemKeyDown(
    filter.filterId,
    selectorState.showFieldSelector,
    selectorState.showOperatorSelector,
    selectorState.showValueSelector,
    onFilterRemove,
  );

  const filterOperators: Array<{ label: string; value: FilterOperator }> =
    getFilterOperators(filter.variant);

  return {
    ...selectorState,
    column,
    columnMeta: column?.columnDef.meta,
    fieldListboxId: `${filterItemId}-field-listbox`,
    operatorListboxId: `${filterItemId}-operator-listbox`,
    inputId: `${filterItemId}-input`,
    filterOperators,
    onItemKeyDown,
  };
}

export { useDataTableFilterItemControls };
