import { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export default function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
      <div className="flex-1 whitespace-nowrap text-sm text-muted-foreground">
        {table.getRowModel().rows.length} row(s)
      </div>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="h-8 w-[4.5rem] bg-gray-100 border border-gray-300 rounded px-2 flex items-center justify-between text-sm">
              {table.getState().pagination.pageSize}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              className="bg-white border border-gray-300 rounded shadow-md"
              side="top"
            >
              {pageSizeOptions.map((pageSize) => (
                <DropdownMenu.Item
                  key={pageSize}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onSelect={() => {
                    table.setPageSize(pageSize);
                    table.setPageIndex(0);
                  }}
                >
                  {pageSize}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div className="flex items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <button
            aria-label="Go to first page"
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon />
          </button>
          <button
            aria-label="Go to previous page"
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </button>
          <button
            aria-label="Go to next page"
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </button>
          <button
            aria-label="Go to last page"
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
