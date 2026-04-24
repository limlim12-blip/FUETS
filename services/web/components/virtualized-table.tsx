"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

interface Column {
  key: string
  title: string
  width: number
  align?: "left" | "center" | "right"
  render?: (value: any, row: any) => React.ReactNode
}

interface VirtualizedTableProps {
  data: any[]
  columns: Column[]
  rowHeight?: number
  pageSize?: number
  searchable?: boolean
  onRowClick?: (row: any) => void
  className?: string
}

export function VirtualizedTable({
  data,
  columns,
  rowHeight = 60,
  pageSize = 10,
  searchable = true,
  onRowClick,
  className = "",
}: VirtualizedTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    return data.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [data, searchQuery])

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Calculate total table width
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0)

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Draw table on canvas
  const drawTable = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set canvas size
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set font
    ctx.font = "14px Inter, sans-serif"
    ctx.textBaseline = "middle"

    // Draw header
    const headerHeight = 50
    ctx.fillStyle = "hsl(var(--muted))"
    ctx.fillRect(0, 0, rect.width, headerHeight)

    // Draw header border
    ctx.strokeStyle = "hsl(var(--border))"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, headerHeight)
    ctx.lineTo(rect.width, headerHeight)
    ctx.stroke()

    // Draw header text
    ctx.fillStyle = "hsl(var(--muted-foreground))"
    ctx.font = "12px Inter, sans-serif"
    let xOffset = 16
    columns.forEach((column) => {
      ctx.fillText(column.title.toUpperCase(), xOffset, headerHeight / 2)
      xOffset += column.width
    })

    // Draw rows
    ctx.font = "14px Inter, sans-serif"
    paginatedData.forEach((row, index) => {
      const y = headerHeight + index * rowHeight
      const isHovered = hoveredRow === index
      const isSelected = selectedRow === index

      // Row background
      if (isSelected) {
        ctx.fillStyle = "hsl(var(--accent))"
        ctx.fillRect(0, y, rect.width, rowHeight)
      } else if (isHovered) {
        ctx.fillStyle = "hsl(var(--muted) / 0.5)"
        ctx.fillRect(0, y, rect.width, rowHeight)
      }

      // Row border
      ctx.strokeStyle = "hsl(var(--border))"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y + rowHeight)
      ctx.lineTo(rect.width, y + rowHeight)
      ctx.stroke()

      // Cell content
      ctx.fillStyle = "hsl(var(--foreground))"
      xOffset = 16
      columns.forEach((column) => {
        const value = row[column.key]
        let displayValue = String(value || "")

        // Truncate long text
        const maxWidth = column.width - 32
        const metrics = ctx.measureText(displayValue)
        if (metrics.width > maxWidth) {
          while (ctx.measureText(displayValue + "...").width > maxWidth && displayValue.length > 0) {
            displayValue = displayValue.slice(0, -1)
          }
          displayValue += "..."
        }

        const textY = y + rowHeight / 2
        if (column.align === "center") {
          ctx.textAlign = "center"
          ctx.fillText(displayValue, xOffset + column.width / 2, textY)
        } else if (column.align === "right") {
          ctx.textAlign = "right"
          ctx.fillText(displayValue, xOffset + column.width - 16, textY)
        } else {
          ctx.textAlign = "left"
          ctx.fillText(displayValue, xOffset, textY)
        }

        xOffset += column.width
      })
    })

    // Draw column separators
    ctx.strokeStyle = "hsl(var(--border))"
    ctx.lineWidth = 1
    xOffset = 0
    columns.forEach((column, index) => {
      if (index > 0) {
        ctx.beginPath()
        ctx.moveTo(xOffset, 0)
        ctx.lineTo(xOffset, rect.height)
        ctx.stroke()
      }
      xOffset += column.width
    })
  }, [columns, paginatedData, rowHeight, hoveredRow, selectedRow])

  // Redraw when data changes
  useEffect(() => {
    drawTable()
  }, [drawTable])

  // Handle mouse events
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const y = e.clientY - rect.top
      const headerHeight = 50

      if (y > headerHeight) {
        const rowIndex = Math.floor((y - headerHeight) / rowHeight)
        if (rowIndex >= 0 && rowIndex < paginatedData.length) {
          setHoveredRow(rowIndex)
        } else {
          setHoveredRow(null)
        }
      } else {
        setHoveredRow(null)
      }
    },
    [paginatedData.length, rowHeight],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredRow(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const y = e.clientY - rect.top
      const headerHeight = 50

      if (y > headerHeight) {
        const rowIndex = Math.floor((y - headerHeight) / rowHeight)
        if (rowIndex >= 0 && rowIndex < paginatedData.length) {
          setSelectedRow(rowIndex)
          onRowClick?.(paginatedData[rowIndex])
        }
      }
    },
    [paginatedData, rowHeight, onRowClick],
  )

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Table Canvas */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: Math.max(400, (paginatedData.length + 1) * rowHeight + 50) }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
