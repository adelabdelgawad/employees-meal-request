'use client'

import { ColumnDef } from '@tanstack/react-table'

interface DataTableProps<TData> {
  data: TData[]
}

export function DataTable<TData>({ data }: DataTableProps<TData>) {
  // Implement your table using @tanstack/react-table
  return (
    <div className="rounded-md border">
      {/* Table implementation */}
    </div>
  )
}