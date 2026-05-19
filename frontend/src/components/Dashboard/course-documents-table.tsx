"use client"

import { VirtualizedDataTable } from "./virtualized-data-table"
import { DocumentView } from "./document-view"
import { RefreshCw } from "lucide-react"
import { useDocumentsStore } from "@/src/stores/documentStore"
import { useDocumentActions } from "@/src/api/documents/useDocuments"
import { DocumentPublic } from "@/src/api/model"
import { Button } from "../ui/button"


export function DocumentManagementContainer() {
    const {
        loading,
        lastSync,
        initialized,
        isDocumentViewOpen,
        setIsDocumentViewOpen,
        selectedDocument,
        setSelectedDocument
    } = useDocumentsStore()

    const {
        handleSync,
        handleDelete: handleDeleteDocument,
        isFetching,
        error,
    } = useDocumentActions({})

    // export interface Documentspublic {
    //     data: DocumentPublic[];
    //     count: number;
    //     page: number;
    //     page_size: number;
    //     total_pages: number;
    // }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this document?")) {
            await handleDeleteDocument(id)
        }
    }

    const handleRowClick = (document: DocumentPublic) => {
        setSelectedDocument(document as any)
        setIsDocumentViewOpen(true)
    }

    const handleCloseDocumentView = () => {
        setIsDocumentViewOpen(false)
        setSelectedDocument(null)
    }

    const handleEditDocument = (document: DocumentPublic) => {
    }

    const handleShareDocument = (document: DocumentPublic) => {
    }


    if (error) {
        return (
            <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-destructive">Error loading documents</h3>
                            <p className="text-sm text-destructive/80 mt-1">error</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleSync()}>
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col h-full w-full gap-4">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-medium text-foreground">Documents</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {lastSync && <span className="ml-2">• Last synced: {new Date(lastSync).toLocaleString()}</span>}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync()}
                        disabled={isFetching}
                        className="bg-card border-border text-foreground"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Syncing..." : "Sync"}
                    </Button>
                </div>

                {loading && !initialized ? (
                    <div className="flex items-center justify-center flex-1 bg-card border border-border rounded-lg">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading documents...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 min-h-0 w-full">
                        <VirtualizedDataTable
                            searchPlaceholder="Search documents..."
                            onRowClick={handleRowClick}
                        />
                    </div>
                )}
            </div>

            <DocumentView
                document={selectedDocument}
                isOpen={isDocumentViewOpen}
                onClose={handleCloseDocumentView}
                onEdit={handleEditDocument}
                onDelete={(id: string) => {
                    handleDelete(id)
                }}
                onShare={handleShareDocument}
            />
        </>
    )
}
