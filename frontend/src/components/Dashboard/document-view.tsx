"use client"
import { useRef, useState } from "react"
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
    Calendar,
    Plus,
    UploadCloud,
    X,
    FileText,
    Eye,
    Settings,
    ExternalLink,
    Loader2,
} from "lucide-react"
import { DocumentPublic } from "@/src/api/model"
import { toast } from "sonner"
import { useDocumentFileActions } from "@/src/api/documents/useDocumentFiles"
import { useUserStore } from "@/src/stores/userStore"

interface DocumentViewProps {
    document: DocumentPublic | null
    isOpen: boolean
    onClose: () => void
}


export function DocumentView({ document, isOpen, onClose }: DocumentViewProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const { handleCreate: createDoc } = useDocumentFileActions(document?.id)
    const { role } = useUserStore()
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const processFiles = (newFiles: File[]) => {
        const updatedFiles = [...selectedFiles];

        newFiles.forEach((file) => {
            let fileName = file.name;
            let nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            let ext = fileName.substring(fileName.lastIndexOf('.'));

            if (fileName.lastIndexOf('.') === -1) {
                nameWithoutExt = fileName;
                ext = "";
            }

            let counter = 1;
            let uniqueName = fileName;

            while (updatedFiles.some((f) => f.name === uniqueName)) {
                uniqueName = `${nameWithoutExt}(${counter})${ext}`;
                counter++;
            }

            const renamedFile = new File([file], uniqueName, { type: file.type });

            if (file.size === 0 && !file.type) {
                toast.error("Folder not allowed!", {
                    icon: "🎉",
                })
            } else {
                updatedFiles.push(renamedFile);
            }
        });

        setSelectedFiles(updatedFiles);
    };
    const removeFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.items) {
            let hasFolder = false;
            const validFiles: File[] = [];

            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                const item = e.dataTransfer.items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry();
                    if (entry && entry.isDirectory) {
                        hasFolder = true;
                    } else {
                        const file = item.getAsFile();
                        if (file) validFiles.push(file);
                    }
                }
            }
            if (hasFolder) {
                toast.error("Folder not allowed!", { icon: "🎉" });
            }
            if (validFiles.length > 0) {
                processFiles(validFiles);
            }

        }
    };


    const handleSubmit = async () => {
        if (selectedFiles.length < 1) {
            toast.error("Vui lòng chọn ít nhất 1 file!");
            return;
        }

        try {
            await createDoc(
                document?.id,
                { files: selectedFiles } as any
            );

            setSelectedFiles([]);


            toast.success("Upload thành công!");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            console.log(fileInputRef)

        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo document.");
            console.error(error);
        }
    };

    const {
        handleDelete: handleDeleteDocument,
        handleUpdate: handleUpdateDocument,
    } = useDocumentActions({})

    const { handleDownload } = useStorageActions()


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
            await handleDownload(`documents/${document.obj_title}`);
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

                                            <div
                                                className="relative"
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-medium text-foreground">Attached Files</h3>

                                                    {role === 'admin' && (
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="p-2 rounded-lg bg-secondary/50 hover:bg-green-500 hover:text-white text-muted-foreground transition-all"
                                                        >
                                                            <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                className="hidden"
                                                                onChange={handleFileChange}
                                                                multiple
                                                            />


                                                            <Plus className="w-4 h-4" />
                                                        </button>)}
                                                </div>

                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between mb-2 px-1">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                                Tài liệu chờ tải lên ({selectedFiles.length})
                                                            </span>
                                                            <Button
                                                                className="h-7 px-3 text-xs bg-black text-white hover:bg-zinc-800 transition-all font-semibold rounded"
                                                                onClick={handleSubmit}
                                                            >
                                                                SUBMIT
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {selectedFiles.map((file, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="group flex items-center justify-between p-2.5 border border-zinc-200/60 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                                                                            <FileText className="h-4 w-4" />
                                                                        </div>

                                                                        <div className="flex flex-col overflow-hidden">
                                                                            <span
                                                                                className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
                                                                                title={file.name}
                                                                            >
                                                                                {file.name}
                                                                            </span>
                                                                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                                                                {file.size > 1024 * 1024
                                                                                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                                                                    : `${(file.size / 1024).toFixed(1)} KB`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeFile(index)}
                                                                        className="p-1.5 rounded-md text-zinc-400 opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-500 transition-all focus:outline-none"
                                                                        type="button"
                                                                        title="Xóa file"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* The List of Files */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                                                        <DocumentFileList
                                                            documentId={document.id}
                                                            handleDownload={handleDownload}
                                                        />
                                                    </div>
                                                </div>

                                                {isDragging && (
                                                    <div
                                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center 
                       border-2 border-dashed border-yellow-500 bg-yellow-50/90 
                       text-yellow-600 rounded-lg backdrop-blur-sm transition-all"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <UploadCloud className="w-8 h-8 mb-2 animate-bounce" />
                                                        <p className="font-medium text-sm">Drop files here to upload</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </SheetContent >
        </Sheet >
    )
}
