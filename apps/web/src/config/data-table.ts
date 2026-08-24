/**
 * Filter operators for CRM data tables.
 */
export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  textOperators: [
    { label: "Equals", value: "==" as const },
    { label: "Not equals", value: "!=" as const },
  ],
  numericOperators: [
    { label: "Equals", value: "==" as const },
    { label: "Not equals", value: "!=" as const },
    { label: "Less than", value: "<" as const },
    { label: "At most", value: "<=" as const },
    { label: "Greater than", value: ">" as const },
    { label: "At least", value: ">=" as const },
  ],
  dateOperators: [
    { label: "Equals", value: "==" as const },
    { label: "Not equals", value: "!=" as const },
    { label: "Before", value: "<" as const },
    { label: "On or before", value: "<=" as const },
    { label: "After", value: ">" as const },
    { label: "On or after", value: ">=" as const },
  ],
  selectOperators: [
    { label: "Equals", value: "==" as const },
    { label: "Not equals", value: "!=" as const },
  ],
  multiSelectOperators: [
    { label: "Is any of", value: "in" as const },
    { label: "Is none of", value: "not-in" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "==" as const },
    { label: "Is not", value: "!=" as const },
  ],
  joinOperators: ["and", "or"] as const,
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  filterVariants: [
    "text",
    "number",
    "range",
    "date",
    "dateRange",
    "boolean",
    "select",
    "multiSelect",
  ] as const,
  operators: ["==", "!=", "<", "<=", ">", ">=", "in", "not-in"] as const,
}
