import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table as TableType,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { ReactNode } from "react";

type DataTableOptions = {
  disablePagination: boolean;
  disableSelection: boolean;
  isLoading: boolean;
  totalCounts: number;
  manualPagination: boolean;
  setPagination: OnChangeFn<PaginationState>;
  pagination: PaginationState;
};

type DataTable<T = unknown> = {
  data: T[];
  columns: ColumnDef<T>[];
  header?: (value: TableType<T>) => ReactNode;
  options?: Partial<DataTableOptions>;
};

export function DataTable<T = unknown>({
  data,
  columns,
  header,
  options,
}: DataTable<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    onPaginationChange: options?.setPagination,
    onSortingChange: setSorting,
    rowCount: options?.totalCounts,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,

      pagination: options?.pagination ?? { pageIndex: 0, pageSize: 10 },
    },
  });

  const activePage = table?.getState()?.pagination?.pageIndex + 1;

  return (
    <div className="w-full">
      <div className="">
        {header && (
          <div className="flex items-center py-4">{header?.(table)}</div>
        )}
        <Table className=" border-separate border-spacing-y-3">
          <TableHeader className="bg-accent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="h-10" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length && !options?.isLoading ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="bg-white"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="p-2" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : options?.isLoading ? (
              [1, 2, 3, 4, 5].map((_, index) => (
                <TableRow key={index}>
                  {[1].map((_, index) => (
                    <TableCell
                      colSpan={columns.length}
                      className="h-10 text-center"
                    >
                      <Skeleton key={index} className="h-4 bg-slate-300" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-2 py-4">
        {!options?.disableSelection ? (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        ) : (
          <div></div>
        )}

        {!options?.disablePagination && (
          <Pagination className="justify-end pt-10 md:pt-0 lg:pt-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    table.previousPage();
                  }}
                />
              </PaginationItem>

              {createPageNumbers(
                table.getPageCount(),
                table.getState().pagination.pageIndex + 1
              ).map((page) =>
                typeof page === "string" ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={activePage === page}
                      onClick={() => table.setPageIndex(page - 1)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    table.nextPage();
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

const createPageNumbers = (totalPages: number, currentPage: number) => {
  const pageNumbers = [];
  const pageRangeDisplayed = 2; // Number of pages to display around the current page
  //  const breakPoint = 2; // When to show breaklines

  // Generate the page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // Always show the first page
      i === totalPages || // Always show the last page
      (i >= currentPage - pageRangeDisplayed &&
        i <= currentPage + pageRangeDisplayed) // Show pages around the current page
    ) {
      pageNumbers.push(i);
    } else if (
      (i === 2 || i === totalPages - 1) && // Show second and second last page if breakline exists
      pageNumbers[pageNumbers.length - 1] !== "..."
    ) {
      pageNumbers.push("...");
    }
  }

  return pageNumbers;
};
