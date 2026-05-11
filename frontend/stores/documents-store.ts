import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { DocumentData } from "@/api/documents"
// documents: DocumentData[]
// loading: boolean
// error: string | null
// lastSync: string | null
// initialized: boolean
// syncInProgress: boolean
//
// // Actions
// setDocuments: (documents: DocumentData[]) => void
// setLoading: (loading: boolean) => void
// setError: (error: string | null) => void
// clearError: () => void
// setLastSync: (lastSync: string | null) => void
// setInitialized: (initialized: boolean) => void
// setSyncInProgress: (syncInProgress: boolean) => void
//
// // Async Actions
// initializeFromIndexedDB: () => Promise<void>
// syncWithAPI: () => Promise<void>
// updateDocument: (id: number, updates: Partial<DocumentData>) => Promise<void>
// deleteDocument: (id: number) => Promise<void>
// createDocument: (document: Omit<DocumentData, "id">) => Promise<void>
//
// // Selectors
// getDocumentsByCategory: (category: string) => DocumentData[]
// getDocumentsByStatus: (status: "Published" | "Draft") => DocumentData[]
// getDocumentsByOwner: (owner: string) => DocumentData[]
interface DocumentsState {
    // State
    loading: boolean,
    lastSync: string | null
    initialized: boolean | null
    selectedDocument: DocumentData
    isDocumentViewOpen: boolean
    // Actions
    setLastSync: (lastSync: string | null) => void
    setInitialized: (initialized: boolean) => void
    setLoading: (loading: boolean) => void
    setSelectedDocument: (selectedDocument: DocumentData | null) => void
    setIsDocumentViewOpen: (isDocumentViewOpen: boolean) => void

}

export const useDocumentsStore = create<DocumentsState>()(
    devtools(
        (set) => ({
            // Initial State
            loading: false,
            lastSync: null,
            initialized: false,
            selectedDocument: null,
            isDocumentViewOpen: false,
            // Basic Actions
            setLastSync: (lastSync) => set({ lastSync }),
            setInitialized: (initialized) => set({ initialized }),
            setLoading: (loading) => set({ loading }),
            setSelectedDocument: (selectedDocument) => set({ selectedDocument }),
            setIsDocumentViewOpen: (isDocumentViewOpen) => set({ isDocumentViewOpen })

        }),
        {
            name: "documents-store",
        },
    ),
)
