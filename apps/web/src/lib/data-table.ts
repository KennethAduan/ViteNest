import { dataTableConfig } from "@/config/data-table";
import type {
  ExtendedColumnFilter,
  FilterOperator,
  FilterVariant,
} from "@/types/data-table";
import { formatDate } from "@/lib/format";
import type { Column } from "./tanstack-table";

// fallow-ignore-next-line complexity
export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastStartPinnedColumn =
    isPinned === "start" && column.getIsLastColumn("start");
  const isFirstEndPinnedColumn =
    isPinned === "end" && column.getIsFirstColumn("end");

  return {
    boxShadow: withBorder
      ? isLastStartPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isFirstEndPinnedColumn
          ? "4px 0 4px -4px var(--border) inset"
          : undefined
      : undefined,
    insetInlineStart:
      isPinned === "start" ? `${column.getStart("start")}px` : undefined,
    insetInlineEnd:
      isPinned === "end" ? `${column.getAfter("end")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "var(--background)" : "var(--background)",
    width: column.getSize(),
    zIndex: isPinned ? 1 : undefined,
  };
}

export function getFilterOperators(
  filterVariant: FilterVariant,
): Array<{ label: string; value: FilterOperator }> {
  const operatorMap: Record<
    FilterVariant,
    Array<{ label: string; value: FilterOperator }>
  > = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    range: dataTableConfig.numericOperators,
    date: dataTableConfig.dateOperators,
    dateRange: dataTableConfig.dateOperators,
    boolean: dataTableConfig.booleanOperators,
    select: dataTableConfig.selectOperators,
    multiSelect: dataTableConfig.multiSelectOperators,
  };

  return operatorMap[filterVariant] ?? dataTableConfig.textOperators;
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
  const operators = getFilterOperators(filterVariant);

  return operators[0]?.value ?? "==";
}

function normalizeDateFilterValue(
  value: ExtendedColumnFilter<unknown>["value"],
) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [value, value].filter(Boolean);
}

function toOptionalDate(value: unknown) {
  if (!value) {
    return undefined;
  }

  return new Date(Number(value));
}

export function getDateFilterValues<TData>(
  filter: ExtendedColumnFilter<TData>,
  placeholder = "Pick a date",
) {
  const dateValue = normalizeDateFilterValue(filter.value);
  const startDate = toOptionalDate(dateValue[0]);
  const endDate = toOptionalDate(dateValue[1]);
  const displayValue = startDate
    ? formatDate(startDate, { month: "short" })
    : placeholder;

  return { dateValue, startDate, endDate, displayValue };
}
