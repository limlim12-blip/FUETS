"use client"

import React, { useState } from "react"
import { Filter, Plus } from "lucide-react"

import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchPlaceholder?: string
    pageSize?: number
    enableSearch?: boolean
    enableSorting?: boolean
    enablePagination?: boolean
    onRowClick?: (row: TData) => void
}

export function VirtualizedDataTable<TData, TValue>({
    columns,
    data,
    searchPlaceholder = "Search...",
    pageSize = 10,
    enableSearch = true,
    enableSorting = true,
    enablePagination = true,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    })

    const tableContainerRef = React.useRef<HTMLDivElement>(null)

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

    // Add state for scroll synchronization - replace the existing scroll state
    const [scrollLeft, setScrollLeft] = useState(0)
    const headerScrollRef = React.useRef<HTMLDivElement>(null)

    // Improved scroll handler with immediate synchronization
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft

        // Immediate state update
        setScrollLeft(scrollLeft)

        // Direct DOM manipulation for instant sync
        if (headerScrollRef.current) {
            headerScrollRef.current.scrollLeft = scrollLeft
        }
    }

    // Add scroll handler for header (in case user scrolls header directly)
    const handleHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft

        setScrollLeft(scrollLeft)

        // Sync body scroll
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollLeft = scrollLeft
        }
    }

    // Add this helper function at the top of the component, after the state declarations
    const getColumnWidths = () => {
        const headerGroup = table.getHeaderGroups()[0]
        if (!headerGroup) return {}

        const widths: Record<string, number> = {}
        headerGroup.headers.forEach((header, index) => {
            // Calculate width based on content or use a default
            const minWidth = 120 // minimum column width
            const headerText =
                typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : `Column ${index}`

            // Estimate width based on header text length and content
            let estimatedWidth = Math.max(minWidth, headerText.length * 8 + 32)

            // Adjust for specific columns
            if (header.id === "actions") estimatedWidth = 100
            if (header.id === "status" || header.id === "priority" || header.id === "type") estimatedWidth = 120
            if (header.id === "assignees") estimatedWidth = 150
            if (header.id === "name") estimatedWidth = 250
            if (header.id === "estimate") estimatedWidth = 200

            widths[header.id] = estimatedWidth
        })

        return widths
    }

    const columnWidths = getColumnWidths()

    // Replace the entire table JSX section with this:
    return (
        <div className="space-y-4">
            {/* Search - keep as is */}
            {enableSearch && (
                <div className="flex items-center space-x-2">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" className="flex-1 sm:flex-none bg-card border-border text-foreground">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border border-border bg-card overflow-hidden">
                {/* Fixed Header with Synchronized Column Widths */}
                <div
                    ref={headerScrollRef}
                    data-header-scroll
                    className="bg-muted border-b border-border overflow-auto"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        overflowY: "hidden",
                    }}
                    onScroll={handleHeaderScroll}
                >
                    <div>
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
                                                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                                                style={{ width: `${columnWidths[header.id]}px` }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`flex items-center space-x-2 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""
                                                            }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <span className="truncate">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                        </span>
                                                        {enableSorting && header.column.getCanSort() && (
                                                            <div className="flex flex-col flex-shrink-0">
                                                                {header.column.getIsSorted() === "desc" ? (
                                                                    <ArrowDown className="h-4 w-4" />
                                                                ) : header.column.getIsSorted() === "asc" ? (
                                                                    <ArrowUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ArrowUpDown className="h-4 w-4" />
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
                </div>

                {/* Scrollable Body with Matching Column Widths */}
                <div
                    ref={tableContainerRef}
                    className="h-[548px] overflow-auto"
                    style={{
                        contain: "strict",
                    }}
                    onScroll={handleScroll}
                >
                    <div style={{ height: `${totalSize}px` }}>
                        <table className="w-full caption-bottom text-sm" style={{ tableLayout: "fixed" }}>
                            <colgroup>
                                {table.getHeaderGroups()[0]?.headers.map((header) => (
                                    <col key={header.id} style={{ width: `${columnWidths[header.id]}px` }} />
                                ))}
                            </colgroup>
                            <tbody>
                                {paddingTop > 0 && (
                                    <tr>
                                        <td style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
                                    </tr>
                                )}
                                {virtualRows.map((virtualRow) => {
                                    const row = rows[virtualRow.index]
                                    return (
                                        <tr
                                            key={row.id}
                                            data-index={virtualRow.index}
                                            ref={(node) => rowVirtualizer.measureElement(node)}
                                            className={`border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${onRowClick ? "cursor-pointer" : ""
                                                }`}
                                            onClick={() => onRowClick?.(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                                                    style={{ width: `${columnWidths[cell.column.id]}px` }}
                                                >
                                                    <div className="truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                                {paddingBottom > 0 && (
                                    <tr>
                                        <td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination - keep as is */}
            {enablePagination && (
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length,
                        )}{" "}
                        of {table.getFilteredRowModel().rows.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
