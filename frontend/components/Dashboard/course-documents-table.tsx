"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { VirtualizedDataTable } from "./virtualized-data-table"
import { DocumentView } from "./document-view"
import { useDeleteDocument, useDocuments } from "@/hooks/use-documents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, FileSpreadsheet, RefreshCw } from "lucide-react"
import { useDocumentsStore } from "@/stores/documents-store"
import type { DocumentData } from "@/api/documents"

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

export function DocumentManagementContainer() {
    // Zustand store
    const {
        loading,
        lastSync,
        initialized,
        isDocumentViewOpen,
        setIsDocumentViewOpen,
        selectedDocument,
        setSelectedDocument
    } = useDocumentsStore()

    const { data: documents = [], isFetching, error, refetch } = useDocuments();
    const deleteDoc = useDeleteDocument();
    // Document view state

    const handleSync = () => {
        refetch(); // TanStack Query's built-in way to force a sync
    }

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this document?")) {
            deleteDoc.mutate(id)
        }
    }

    const handleRowClick = (document: DocumentData) => {
        setSelectedDocument(document)
        setIsDocumentViewOpen(true)
    }

    const handleCloseDocumentView = () => {
        setIsDocumentViewOpen(false)
        setSelectedDocument(null)
    }

    const handleEditDocument = (document: DocumentData) => {
        console.log("Edit document:", document)
        // Implement edit functionality
    }

    const handleShareDocument = (document: DocumentData) => {
        console.log("Share document:", document)
        // Implement share functionality
    }

    const columns: ColumnDef<DocumentData>[] = [
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
            accessorKey: "size",
            header: () => <div className="w-20 text-right">Size</div>,
            size: 80,
            cell: ({ row }) => <div className="w-20 text-right text-muted-foreground">{row.getValue("size")}</div>,
        },
    ]

    if (error) {
        return (
            <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-destructive">Error loading documents</h3>
                            <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-foreground">Documents</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {documents.length} documents loaded
                            {lastSync && <span className="ml-2">• Last synced: {new Date(lastSync).toLocaleString()}</span>}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={isFetching}
                        className="bg-card border-border text-foreground"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Syncing..." : "Sync"}
                    </Button>
                </div>

                {loading && !initialized ? (
                    <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading documents...</p>
                        </div>
                    </div>
                ) : (
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
                )}
            </div>

            {/* Document View Modal */}
            <DocumentView
                document={selectedDocument}
                isOpen={isDocumentViewOpen}
                onClose={handleCloseDocumentView}
                onEdit={handleEditDocument}
                onDelete={handleDelete}
                onShare={handleShareDocument}
            />
        </>
    )
}
