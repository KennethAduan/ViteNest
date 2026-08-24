/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ColumnSort, RowData, TableFeatures } from "@tanstack/react-table";
import type { DataTableConfig } from "@/config/data-table";
import type { FilterItemSchema } from "@/lib/parsers";
import type { Row } from "@/lib/tanstack-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TFeatures extends TableFeatures, TData extends RowData> {
    queryKeys?: QueryKeys;
    cursorPagination?: CursorPaginationMeta;
  }

  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Array<Option>;
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    trueLabel?: string;
  }
}

export interface QueryKeys {
  page: string;
  perPage: string;
  sort: string;
  filters: string;
  joinOperator: string;
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface CursorPaginationMeta {
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageLabel?: string;
  onFirstPage?: () => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "delete";
}
