"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { 
  ChevronDown, 
  Download, 
  Search, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  placeholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  placeholder = "بحث...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
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
    },
  });

  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const headers = columns
      .filter((col: any) => typeof col.header === "string")
      .map((col: any) => col.header as string);
    
    const rows = data.map((row: any) => 
      columns
        .filter((col: any) => typeof col.header === "string")
        .map((col: any) => row[col.accessorKey as string] || "")
    );
    
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");
      
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4 rtl" dir="rtl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm group">
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder={placeholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="pr-10 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="destructive" size="sm" className="rounded-xl gap-2 h-10 animate-in fade-in zoom-in duration-300">
              <Trash2 className="h-4 w-4" />
              <span>حذف ({Object.keys(rowSelection).length})</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="rounded-xl gap-2 h-10 bg-white border-slate-200"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span className="hidden md:inline">تصدير CSV</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="sm" className="rounded-xl gap-2 h-10 bg-white border-slate-200">
                الأعمدة <ChevronDown className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="rounded-xl">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column: any) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200">
                {headerGroup.headers.map((header: any) => {
                  return (
                    <TableHead key={header.id} className="text-right font-black text-slate-500 uppercase text-xs py-4">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Search className="h-12 w-12 opacity-20" />
                    <p className="font-bold text-lg">لا توجد نتائج مطابقة</p>
                    <p className="text-sm">حاول البحث باستخدام كلمات أخرى</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-slate-500 font-medium">
          تم اختيار {table.getFilteredSelectedRowModel().rows.length} من{" "}
          {table.getFilteredRowModel().rows.length} صف(وف)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg h-9 w-9 p-0 bg-white border-slate-200 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
             <span className="text-xs font-bold text-slate-700">صفحة {table.getState().pagination.pageIndex + 1}</span>
             <span className="text-xs text-slate-400">من {table.getPageCount()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg h-9 w-9 p-0 bg-white border-slate-200 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}