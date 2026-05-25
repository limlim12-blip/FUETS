"use client"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import DocumentFileList from "@/src/components/Dashboard/document-view-filelist"
import { useDocumentActions } from "@/src/api/documents/useDocuments"
import { useStorageActions } from "@/src/api/storage/useStorage"
import { getFileIcon } from "@/src/components/Dashboard/virtualized-data-table"

import {
    Download,
    Share2,
    Trash2,
    FileText,
    ImageIcon,
    FileSpreadsheet,
    Calendar,
    Tag,
    Plus,
    Eye,
    Settings,
    ExternalLink,
    Loader2,
} from "lucide-react"
import { DocumentPublic } from "@/src/api/model"
import { toast } from "sonner"

interface DocumentViewProps {
    document: DocumentPublic | null
    isOpen: boolean
    onClose: () => void
}


export function DocumentView({ document, isOpen, onClose }: DocumentViewProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [isDownloading, setIsDownloading] = useState(false)

    const {
        handleDelete: handleDeleteDocument,
        handleUpdate: handleUpdateDocument,
    } = useDocumentActions({})

    const { handleDownload } = useStorageActions()

    const onCreateFile = async () => {
        // Trigger file creation logic
    }

    if (!document) return null

    const onDeleteDocument = async () => {
        if (confirm("Are you sure you want to delete this document?")) {
            try {
                await handleDeleteDocument(document.id)
                toast.success("DELETE FILE SUCCESFULLY!!", {
                    description: "DELELELELELELTLETELTETE",
                    icon: "🎉",
                })
            }
            catch (error) {
                toast.error("DELETE FILE FAILED SUCCESFULLY!!", {
                    description: "DELELELELELELTLETELTETE",
                    icon: "🎉",
                })
            }
        }
    }

    const onEditDocument = async () => {
        const newName = prompt(`Rename document "${document.title}" to:`, document.title)
        if (newName && newName.trim() && newName !== document.title) {
            await handleUpdateDocument(document.id, { title: newName }).catch((error) => {
                console.error("Error updating doc", error);
            });
        }
    }

    const onDownloadDocument = async () => {
        setIsDownloading(true)
        try {
            await handleDownload(`documents/${document.title}`);
        } finally {
            setIsDownloading(false)
        }
    }
    const onShareDocument = () => { }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 bg-background">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <SheetHeader className="px-6 py-4 border-b border-border bg-card">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                            <div className="p-3 bg-secondary rounded-lg flex-shrink-0 mt-1">
                                {getFileIcon(document.id)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <SheetTitle className="text-xl font-semibold text-foreground whitespace-normal break-words text-left">
                                    {document.title}
                                </SheetTitle>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 mt-4">
                            <Button
                                size="sm"
                                className="button-primary"
                                onClick={onDownloadDocument}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                {isDownloading ? "Downloading..." : "Download"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={onShareDocument}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm" onClick={onEditDocument}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDeleteDocument}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <div className="px-6 py-2 border-b border-border bg-card">
                                <TabsList className="flex w-full bg-muted">
                                    <TabsTrigger
                                        value="overview"
                                        className="flex-1 w-full flex items-center justify-center text-xs sm:text-sm"
                                    >
                                        <Eye className="mr-1 sm:mr-2 h-4 w-4" />
                                        <span>Overview</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <TabsContent value="overview" className="h-full m-0">
                                    <ScrollArea className="h-full px-6 py-4">
                                        <div className="space-y-6">
                                            {/* Document Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium text-foreground">Document Information</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-3">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">Created</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {document.created_at
                                                                        ? document.created_at.split('T')[0].split('-').reverse().join('-')
                                                                        : "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">Version</p>
                                                                <p className="text-sm text-muted-foreground">v{document.version || 1}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium text-foreground">Tags & Categories</h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                                                {document.category || "Uncategorized"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Description/Content */}
                                            <div>
                                                <h3 className="text-lg font-medium text-foreground mb-3">Description</h3>
                                                <div className="bg-muted/50 rounded-lg p-4">
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {document.content || "No description available for this document."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Recent Activity (Files List) */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-medium text-foreground">Attached Files</h3>
                                                    <button
                                                        onClick={onCreateFile}
                                                        className="p-2 rounded-lg bg-secondary/50 hover:bg-green-500 hover:text-white text-muted-foreground transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                                                        <DocumentFileList
                                                            documentId={document.id}
                                                            handleDownload={handleDownload}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
