"use client"
import type { ColumnDef } from "@tanstack/react-table"

import { FileText, ImageIcon, FileSpreadsheet, RefreshCw } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"

import React, { useEffect, useState } from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useDocumentActions } from "@/src/api/documents/useDocuments"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react"
import { DocumentPublic } from "@/src/api/model"

interface DataTableProps<TData> {
    searchPlaceholder?: string
    onRowClick?: (row: TData) => void
}

export function VirtualizedDataTable<TData>({
    searchPlaceholder = "Search...",
    onRowClick,
}: DataTableProps<TData>) {

    const columns: ColumnDef<DocumentPublic>[] = [
        {
            accessorKey: "title",
            header: () => <div className="w-full text-left">Document Name</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex items-center space-x-3 w-full overflow-hidden">
                        <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
                        <p className="font-medium text-foreground truncate">
                            {row.getValue("title")}
                        </p>
                    </div>
                );
            }
        },
        {
            accessorKey: "category",
            header: () => <div className="w-max whitespace-nowrap">Category</div>,
            cell: ({ row }) => (
                <div className="w-max whitespace-nowrap">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {row.getValue("category")}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: () => <div className="w-max whitespace-nowrap">Created</div>,
            cell: ({ row }) => (
                <div className="w-max text-muted-foreground whitespace-nowrap">
                    {row.getValue("created_at")
                        ? new Date(row.getValue("created_at")).toLocaleDateString()
                        : "N/A"
                    }
                </div>
            ),
        },
    ]

    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const {
        documents: data,
        totalPages,
        totalCount
    } = useDocumentActions({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter ? globalFilter : undefined,
        sort_by: sorting[0] ? sorting[0].id : undefined,
        order: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined
    })

    const table = useReactTable({
        data,
        columns,
        pageCount: totalPages,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination
        },

        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    })
    const tableContainerRef = React.useRef<HTMLDivElement>(null)
    const headerScrollRef = React.useRef<HTMLDivElement>(null)

    const { rows } = table.getRowModel()

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 60,
        overscan: 10,
    })

    const virtualRows = rowVirtualizer.getVirtualItems()
    const totalSize = rowVirtualizer.getTotalSize()

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
    const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (headerScrollRef.current) {
            headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
        }
    }

    const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft
        }
    }

    const getColumnWidths = () => {
        const headerGroup = table.getHeaderGroups()[0]
        if (!headerGroup) return {}

        const widths: Record<string, string> = {}
        headerGroup.headers.forEach((header) => {
            if (header.id === "title") {
                widths[header.id] = "100%"
            }
            else if (header.id === "category") {
                widths[header.id] = "300"
            }
            else if (header.id === "created_at") {
                widths[header.id] = "300"
            }
            else {
                widths[header.id] = "150"
            }
        })

        return widths
    }

    const columnWidths = getColumnWidths()

    return (
        <div className="flex flex-col h-full w-full gap-4" >

            {(
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                    <div className="relative w-full sm:max-w-sm shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-9 w-full bg-card"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto bg-card">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                            <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-meium">
                                TODO
                            </span>

                        </Button>
                    </div>
                </div>
            )}

            < div className="flex flex-col flex-1 min-h-0 rounded-md border bg-card shadow-sm overflow-hidden" >

                <div
                    ref={headerScrollRef}
                    className="overflow-x-auto bg-muted/40 border-b hide-scrollbar"
                    onScroll={handleHeaderScroll}
                >
                    <table className="w-full caption-bottom text-sm" style={{ tableLayout: "fixed" }}>
                        <colgroup>
                            {table.getHeaderGroups()[0]?.headers.map((header) => (
                                <col key={header.id} style={{ width: `${columnWidths[header.id]}px` }} />
                            ))}
                        </colgroup>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground whitespace-nowrap"
                                            style={{ width: `${columnWidths[header.id]}px` }}
                                        >
                                            {!header.isPlaceholder && (
                                                <div
                                                    className={`flex items-center gap-2 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""
                                                        }`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <span className="truncate">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </span>

                                                    {header.column.getCanSort() && (
                                                        <div className="shrink-0 text-muted-foreground/70">
                                                            {{
                                                                asc: <ArrowUp className="h-3.5 w-3.5" />,
                                                                desc: <ArrowDown className="h-3.5 w-3.5" />,
                                                            }[header.column.getIsSorted() as string] ?? (
                                                                    <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                    </table>
                </div>

                <div
                    ref={tableContainerRef}
                    className="flex-1 overflow-auto relative"
                    onScroll={handleScroll}
                >
                    {rows.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <Search className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">No results found</p>
                            <p className="text-xs opacity-70">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div style={{ height: `${totalSize}px`, position: "relative" }}>
                            <table className="w-full caption-bottom text-sm absolute top-0 left-0" style={{ tableLayout: "fixed" }}>
                                <colgroup>
                                    {table.getHeaderGroups()[0]?.headers.map((header) => (
                                        <col key={header.id} style={{ width: `${columnWidths[header.id]}px` }} />
                                    ))}
                                </colgroup>
                                <tbody>
                                    {paddingTop > 0 && (
                                        <tr><td style={{ height: `${paddingTop}px` }} colSpan={columns.length} /></tr>
                                    )}

                                    {virtualRows.map((virtualRow) => {
                                        const row = rows[virtualRow.index]
                                        return (
                                            <tr
                                                key={row.id}
                                                data-index={virtualRow.index}
                                                ref={(node) => rowVirtualizer.measureElement(node)}
                                                className={`border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted ${onRowClick ? "cursor-pointer" : ""
                                                    }`}
                                                onClick={() => onRowClick?.(row.original)}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="p-4 align-middle"
                                                        style={{ width: `${columnWidths[cell.column.id]}px` }}
                                                    >
                                                        <div className="truncate">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}

                                    {paddingBottom > 0 && (
                                        <tr><td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} /></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div >

            {
                rows.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 w-full shrink-0">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                ((table.getState().pagination.pageIndex) * table.getState().pagination.pageSize + table.getFilteredRowModel().rows.length)
                            )}</span> of <span className="font-medium text-foreground">{totalCount}</span> entries
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>

                            <div className="text-sm font-medium px-2">
                                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
