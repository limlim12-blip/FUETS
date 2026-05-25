"use client"
import { useState } from "react"
import { useDocumentFileActions } from "@/src/api/documents/useDocumentFiles"

import {
    Download,
    Trash2,
    FileText,
    Edit2,
    Loader2
} from "lucide-react"
import { useStorageActions } from "@/src/api/storage/useStorage"
import { DocumentFilePublic } from "@/src/api/model"

export default function DocumentFileList({ documentId }: { documentId: string }) {
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
    const { handleDownload, } = useStorageActions()

    const {
        files,
        handleDelete: handleDeleteFile,
        handleUpdate: handleUpdateFile,
    } = useDocumentFileActions(documentId)

    const onDeleteFile = async (id: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            await handleDeleteFile(id)
        }
    }

    const onUpdateFile = async (e: DocumentFilePublic) => {
        const newName = prompt(`Rename document "${e.filename}" to:`, e.filename)
        if (newName && newName.trim() && newName !== e.filename) {
            await handleUpdateFile(e.id, { filename: newName }).catch((error) => {
                console.error("Error updating doc", error);
            });
        }
    }

    const onDownloadFile = async (id: string, url_obj: string) => {
        setDownloadingIds(prev => new Set(prev).add(id))

        try {
            await handleDownload(url_obj)
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    if (!files) return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading files...</div>
    if (files.length === 0) return <div className="p-4 text-center text-sm text-muted-foreground">No files attached to this document.</div>

    return (
        <div className="flex-1 space-y-3">
            {files.map((e) => {
                const isDownloading = downloadingIds.has(e.id)
                return (
                    <div
                        key={e.filename}
                        className="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] shrink-0"></div>
                            <FileText className="w-5 h-5 text-400 shrink-0" />
                            <span className="text-sm font-semibold text-foreground tracking-tight truncate">
                                {e.filename}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 z-10">
                            <button
                                onClick={() => onDownloadFile(e.id, e.url_obj)}
                                disabled={isDownloading}
                                className={`p-2 rounded-lg transition-all ${isDownloading
                                    ? "bg-indigo-500 text-white cursor-not-allowed"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-indigo-500 hover:text-white"
                                    }`}
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                            </button>

                            <button
                                onClick={() => onUpdateFile(e)}
                                className="p-2 rounded-lg bg-secondary/50 hover:bg-blue-500 hover:text-white text-muted-foreground transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDeleteFile(e.id)}
                                className="p-2 rounded-lg bg-secondary/50 hover:bg-red-500 hover:text-white text-muted-foreground transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent group-hover:border-indigo-500/30 transition-colors" />
                    </div>
                )
            })}
        </div>
    )
}
