import {
  useMutation,
  useQueryClient,
  type DefaultError,
  type InvalidateQueryFilters,
  type MutationFunctionContext,
  type MutationKey,
  type MutationMeta,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { z } from "zod"

type QueryInvalidation<TData, TVariables> =
  | readonly InvalidateQueryFilters[]
  | ((data: TData, variables: TVariables) => readonly InvalidateQueryFilters[])

export interface ApiMutationDefinition<TInputSchema extends z.ZodType, TData> {
  actionName: string
  inputSchema: TInputSchema
  mutationFn: (
    parsedInput: z.output<TInputSchema>,
    context: MutationFunctionContext
  ) => Promise<TData>
  mutationKey?: MutationKey
  invalidateQueries?: QueryInvalidation<TData, z.input<TInputSchema>>
  meta?: MutationMeta
}

export type UseApiMutationOptions<
  TInputSchema extends z.ZodType,
  TData,
  TError = DefaultError,
  TOnMutateResult = unknown,
> = Omit<
  UseMutationOptions<TData, TError, z.input<TInputSchema>, TOnMutateResult>,
  "meta" | "mutationFn" | "mutationKey"
>

export const defineApiMutation = <TInputSchema extends z.ZodType, TData>(
  definition: ApiMutationDefinition<TInputSchema, TData>
) => definition

/**
 * Executes a reusable API mutation definition with TanStack Query lifecycle state.
 * Authentication, authorization, and final validation still belong to the API.
 */
export const useApiMutation = <
  TInputSchema extends z.ZodType,
  TData,
  TError = DefaultError,
  TOnMutateResult = unknown,
>(
  definition: ApiMutationDefinition<TInputSchema, TData>,
  options: UseApiMutationOptions<
    TInputSchema,
    TData,
    TError,
    TOnMutateResult
  > = {}
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...mutationOptions } = options

  return useMutation<TData, TError, z.input<TInputSchema>, TOnMutateResult>({
    ...mutationOptions,
    mutationKey: definition.mutationKey ?? ["api", definition.actionName],
    meta: { ...definition.meta, actionName: definition.actionName },
    mutationFn: (input, context) =>
      definition.mutationFn(definition.inputSchema.parse(input), context),
    onSuccess: async (data, variables, onMutateResult, context) => {
      const invalidateQueries =
        typeof definition.invalidateQueries === "function"
          ? definition.invalidateQueries(data, variables)
          : (definition.invalidateQueries ?? [])

      await Promise.all(
        invalidateQueries.map((filters) =>
          queryClient.invalidateQueries(filters)
        )
      )
      await onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}
