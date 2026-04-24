import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { DocumentData } from "../lib/indexeddb"
import { indexedDBManager } from "../lib/indexeddb"
import { documentsAPI } from "../lib/api"

interface DocumentsState {
    // State
    documents: DocumentData[]
    loading: boolean
    error: string | null
    lastSync: string | null
    initialized: boolean
    syncInProgress: boolean

    // Actions
    setDocuments: (documents: DocumentData[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
    setLastSync: (lastSync: string | null) => void
    setInitialized: (initialized: boolean) => void
    setSyncInProgress: (syncInProgress: boolean) => void

    // Async Actions
    initializeFromIndexedDB: () => Promise<void>
    syncWithAPI: () => Promise<void>
    updateDocument: (id: number, updates: Partial<DocumentData>) => Promise<void>
    deleteDocument: (id: number) => Promise<void>
    createDocument: (document: Omit<DocumentData, "id">) => Promise<void>

    // Selectors
    getDocumentsByCategory: (category: string) => DocumentData[]
    getDocumentsByStatus: (status: "Published" | "Draft") => DocumentData[]
    getDocumentsByOwner: (owner: string) => DocumentData[]
}

export const useDocumentsStore = create<DocumentsState>()(
    devtools(
        (set, get) => ({
            // Initial State
            documents: [],
            loading: false,
            error: null,
            lastSync: null,
            initialized: false,
            syncInProgress: false,

            // Basic Actions
            setDocuments: (documents) => set({ documents }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
            setLastSync: (lastSync) => set({ lastSync }),
            setInitialized: (initialized) => set({ initialized }),
            setSyncInProgress: (syncInProgress) => set({ syncInProgress }),

            // Async Actions
            initializeFromIndexedDB: async () => {
                try {
                    set({ loading: true, error: null })

                    await indexedDBManager.init()
                    const documents = await indexedDBManager.getDocuments()
                    const lastSync = await indexedDBManager.getMetadata("lastSync")

                    set({
                        documents,
                        lastSync,
                        loading: false,
                        initialized: true,
                    })
                } catch (error) {
                    console.error("Failed to initialize from IndexedDB:", error)
                    set({
                        error: "Failed to load local data",
                        loading: false,
                        initialized: true,
                    })
                }
            },

            syncWithAPI: async () => {
                try {
                    set({ syncInProgress: true, error: null })

                    const documents = await documentsAPI.fetchDocuments()
                    await indexedDBManager.saveDocuments(documents)
                    const lastSync = new Date().toISOString()

                    set({
                        documents,
                        lastSync,
                        syncInProgress: false,
                    })
                } catch (error) {
                    console.error("Failed to sync with API:", error)
                    set({
                        error: "Failed to sync with server",
                        syncInProgress: false,
                    })
                }
            },

            updateDocument: async (id, updates) => {
                try {
                    set({ loading: true })

                    const updatedDocument = await documentsAPI.updateDocument(id, updates)

                    // Update IndexedDB
                    const { documents } = get()
                    const allDocuments = documents.map((doc) => (doc.id === id ? updatedDocument : doc))
                    await indexedDBManager.saveDocuments(allDocuments)

                    set({
                        documents: allDocuments,
                        loading: false,
                    })
                } catch (error) {
                    console.error("Failed to update document:", error)
                    set({
                        error: "Failed to update document",
                        loading: false,
                    })
                }
            },

            deleteDocument: async (id) => {
                try {
                    await documentsAPI.deleteDocument(id)

                    // Update IndexedDB
                    const { documents } = get()
                    const allDocuments = documents.filter((doc) => doc.id !== id)
                    await indexedDBManager.saveDocuments(allDocuments)

                    set({ documents: allDocuments })
                } catch (error) {
                    console.error("Failed to delete document:", error)
                    set({ error: "Failed to delete document" })
                }
            },

            createDocument: async (document) => {
                try {
                    const newDocument = await documentsAPI.createDocument(document)

                    // Update IndexedDB
                    const { documents } = get()
                    const allDocuments = [...documents, newDocument]
                    await indexedDBManager.saveDocuments(allDocuments)

                    set({ documents: allDocuments })
                } catch (error) {
                    console.error("Failed to create document:", error)
                    set({ error: "Failed to create document" })
                }
            },

            // Selectors
            getDocumentsByCategory: (category) => {
                const { documents } = get()
                return documents.filter((doc) => doc.category === category)
            },

            getDocumentsByStatus: (status) => {
                const { documents } = get()
                return documents.filter((doc) => doc.status === status)
            },

            getDocumentsByOwner: (owner) => {
                const { documents } = get()
                return documents.filter((doc) => doc.owner === owner)
            },
        }),
        {
            name: "documents-store",
        },
    ),
)
