"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { VirtualizedDataTable } from "./virtualized-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, FileText, ImageIcon, FileSpreadsheet } from "lucide-react"

interface Document {
    id: number
    name: string
    category: string
    lastModified: string
    size: string
    created: string
    type: "pdf" | "docx" | "xlsx" | "png" | "figma" | "md" | "csv"
}

const documents: Document[] = [
    {
        id: 1,
        name: "Project Proposal.pdf",
        category: "Business",
        lastModified: "2 hours ago",
        size: "2.4 MB",
        created: "2024-01-10",
        type: "pdf",
    },
    {
        id: 2,
        name: "Marketing Strategy.docx",
        category: "Marketing",
        lastModified: "1 day ago",

        size: "1.8 MB",
        created: "2024-01-09",
        type: "docx",
    },
    {
        id: 3,
        name: "Financial Report Q3.xlsx",
        category: "Finance",
        lastModified: "3 days ago",

        size: "3.2 MB",
        created: "2024-01-07",
        type: "xlsx",
    },
    {
        id: 4,
        name: "User Research.pdf",
        category: "Research",
        lastModified: "1 week ago",

        size: "5.1 MB",
        created: "2023-12-03",
        type: "pdf",
    },
    {
        id: 5,
        name: "Design System.figma",
        category: "Design",
        lastModified: "2 weeks ago",
        size: "12.3 MB",
        created: "2023-12-28",
        type: "figma",
    },
    // Generate more sample data for testing virtualization
    ...Array.from({ length: 95 }, (_, i) => ({
        id: i + 6,
        name: `Document ${i + 6}.${["pdf", "docx", "xlsx", "png"][i % 4]}`,
        category: ["Business", "Marketing", "Finance", "Research", "Design", "Technical"][i % 6],
        lastModified: `${Math.floor(Math.random() * 30) + 1} days ago`,
        owner: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Alex Chen", "David Kim"][i % 6],
        status: (Math.random() > 0.5 ? "Published" : "Draft") as "Published" | "Draft",
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        created: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        type: ["pdf", "docx", "xlsx", "png", "figma", "md", "csv"][i % 7] as Document["type"],
    })),
]

const getFileIcon = (type: string) => {
    switch (type) {
        case "pdf":
        case "docx":
        case "md":
            return <FileText className="h-4 w-4 text-blue-600" />
        case "xlsx":
        case "csv":
            return <FileSpreadsheet className="h-4 w-4 text-green-600" />
        case "png":
        case "figma":
            return <ImageIcon className="h-4 w-4 text-purple-600" />
        default:
            return <FileText className="h-4 w-4 text-gray-600" />
    }
}

export function DocumentsTable() {
    const columns: ColumnDef<Document>[] = [
        {
            accessorKey: "name",
            header: "Document Name",
            cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    {getFileIcon(row.original.type)}
                    <span className="font-medium text-foreground">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {row.getValue("category")}
                </Badge>
            ),
        },
        {
            accessorKey: "created",
            header: "Created",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("created")}</div>,
        },
        {
            accessorKey: "lastModified",
            header: "Last Modified",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("lastModified")}</div>,
        },
        {
            accessorKey: "size",
            header: () => <div className="w-20 text-right">Size</div>,
            size: 80,
            cell: ({ row }) => <div className="w-20 text-right text-muted-foreground">{row.getValue("size")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant={status === "Published" ? "default" : "secondary"}
                        className={
                            status === "Published" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "Actions",
            size: 50,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="text-sm text-foreground hover:bg-secondary/50">
                            <Eye className="mr-3 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm text-foreground hover:bg-secondary/50">
                            <Edit className="mr-3 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const handleRowClick = (document: Document) => {
        console.log("Document clicked:", document)
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-medium text-foreground">Recent Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your documents with advanced table features and virtualization
                </p>
            </div>

            <VirtualizedDataTable
                columns={columns}
                data={documents}
                searchPlaceholder="Search documents..."
                pageSize={15}
                enableSearch={true}
                enableSorting={true}
                enablePagination={true}
                onRowClick={handleRowClick}
            />
        </div>
    )
}
