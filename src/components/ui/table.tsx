"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

const Table = ({ className, ref, ...props }: React.HTMLAttributes<HTMLTableElement> & { ref?: React.RefObject<HTMLTableElement | null> }) => {
  return <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        ref={ref}
        {...props}
      />
    </div>;
}
Table.displayName = "Table"

const TableHeader = ({ className, ref, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { ref?: React.RefObject<HTMLTableSectionElement | null> }) => {
  return <thead className={cn("[&_tr]:border-b", className)} ref={ref} {...props} />;
}
TableHeader.displayName = "TableHeader"

const TableBody = ({ className, ref, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { ref?: React.RefObject<HTMLTableSectionElement | null> }) => {
  return <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      ref={ref}
      {...props}
    />;
}
TableBody.displayName = "TableBody"

const TableRow = ({ className, ref, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { ref?: React.RefObject<HTMLTableRowElement | null> }) => {
  return <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      ref={ref}
      {...props}
    />;
}
TableRow.displayName = "TableRow"

const TableHead = ({ className, ref, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { ref?: React.RefObject<HTMLTableCellElement | null> }) => {
  return <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      ref={ref}
      {...props}
    />;
}
TableHead.displayName = "TableHead"

const TableCell = ({ className, ref, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { ref?: React.RefObject<HTMLTableCellElement | null> }) => {
  return <td
      className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      ref={ref}
      {...props}
    />;
}
TableCell.displayName = "TableCell"

const TableCaption = ({ className, ref, ...props }: React.HTMLAttributes<HTMLTableCaptionElement> & { ref?: React.RefObject<HTMLTableCaptionElement | null> }) => {
  return <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      ref={ref}
      {...props}
    />;
}
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
}
