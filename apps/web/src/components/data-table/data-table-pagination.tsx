import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { Table } from "@/lib/tanstack-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
  pageSizeOptions?: Array<number>
}

// fallow-ignore-next-line complexity
export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const cursorPagination = table.options.meta?.cursorPagination
  const canPreviousPage =
    cursorPagination?.canPreviousPage ?? table.getCanPreviousPage()
  const canNextPage = cursorPagination?.canNextPage ?? table.getCanNextPage()
  const pageLabel =
    cursorPagination?.pageLabel ??
    `Page ${table.state.pagination.pageIndex + 1} of ${table.getPageCount()}`

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-sm whitespace-nowrap text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${table.state.pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-18 data-size:h-8">
              <SelectValue placeholder={table.state.pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          {pageLabel}
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => {
              if (cursorPagination?.onFirstPage) {
                cursorPagination.onFirstPage()
                return
              }

              table.setPageIndex(0)
            }}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              if (cursorPagination?.onPreviousPage) {
                cursorPagination.onPreviousPage()
                return
              }

              table.previousPage()
            }}
            disabled={!canPreviousPage}
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              if (cursorPagination?.onNextPage) {
                cursorPagination.onNextPage()
                return
              }

              table.nextPage()
            }}
            disabled={!canNextPage}
          >
            <ChevronRight />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={Boolean(cursorPagination) || !canNextPage}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
