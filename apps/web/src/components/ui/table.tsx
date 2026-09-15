import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"tr"> & { variant?: "default" | "static" }) {
  return (
    <tr
      data-slot="table-row"
      data-variant={variant}
      className={cn(
        "border-b transition-colors has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted data-[variant=default]:hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"th"> & { variant?: "default" | "pinned" }) {
  return (
    <th
      data-slot="table-head"
      data-variant={variant}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground data-[variant=pinned]:bg-background data-[variant=pinned]:opacity-(--column-opacity) [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"td"> & { variant?: "default" | "pinned" }) {
  return (
    <td
      data-slot="table-cell"
      data-variant={variant}
      className={cn(
        "p-2 align-middle whitespace-nowrap data-[variant=pinned]:bg-background data-[variant=pinned]:opacity-(--column-opacity) [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
