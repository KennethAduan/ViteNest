import { createParser } from "nuqs/server"
import { z } from "zod"
import type {
  ExtendedColumnFilter,
  ExtendedColumnSort,
  FilterOperator,
  FilterVariant,
} from "@/types/data-table"
import { dataTableConfig } from "@/config/data-table"

function buildValidKeys(columnIds?: Array<string> | Set<string>) {
  return columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null
}

// fallow-ignore-next-line complexity
function parseWithValidation<TItem extends { id: string }, TResult>(
  value: string,
  schema: z.ZodType<TItem[]>,
  validKeys: Set<string> | null,
  cast: (data: TItem[]) => TResult
): TResult | null {
  try {
    const parsed = JSON.parse(value)
    const result = schema.safeParse(parsed)
    if (!result.success) return null
    if (validKeys && result.data.some((item) => !validKeys.has(item.id))) return null
    return cast(result.data)
  } catch {
    return null
  }
}

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
})

export const getSortingStateParser = <TData>(
  columnIds?: Array<string> | Set<string>
) => {
  const validKeys = buildValidKeys(columnIds)

  return createParser({
    parse: (value) =>
      parseWithValidation(value, z.array(sortingItemSchema), validKeys, (data) =>
        data as Array<ExtendedColumnSort<TData>>
      ),
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc
      ),
  })
}

const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
})

export type FilterItemSchema = z.infer<typeof filterItemSchema>

export const getFiltersStateParser = <TData>(
  columnIds?: Array<string> | Set<string>
) => {
  const validKeys = buildValidKeys(columnIds)

  return createParser({
    parse: (value) =>
      parseWithValidation(value, z.array(filterItemSchema), validKeys, (data) =>
        data as unknown as Array<ExtendedColumnFilter<TData>>
      ),
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        // fallow-ignore-next-line complexity
        (filter, index) =>
          filter.id === b[index]?.id &&
          (filter as unknown as { value: string | Array<string> }).value ===
            (b[index] as unknown as { value: string | Array<string> }).value &&
          (filter as unknown as { variant: FilterVariant }).variant ===
            (b[index] as unknown as { variant: FilterVariant }).variant &&
          (filter as unknown as { operator: FilterOperator }).operator ===
            (b[index] as unknown as { operator: FilterOperator }).operator
      ),
  })
}
