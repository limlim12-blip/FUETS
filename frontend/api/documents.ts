// API service for fetching documents
import axios from 'axios';
export interface DocumentData {
    id: number
    name: string
    category: string
    lastModified: string
    size: string
    created: string
    type: "pdf" | "docx" | "xlsx" | "png" | "figma" | "md" | "csv"
    content?: string
    tags?: string[]
    version?: number
}


const api = axios.create({
    baseURL: 'https://example.com',
});

export const fetchDocs = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return dummyDocuments
}

export const createDoc = async () => {
    return ""
};


export const deleteDoc = async (id: number) => {
    await fetch(`/api/docs/${id}`);
}

const dummyDocuments: DocumentData[] = [
    {
        id: 1,
        name: "Project Proposal.pdf",
        category: "Business",
        lastModified: "2 hours ago",
        size: "2.4 MB",
        created: "2024-01-10",
        type: "pdf",
        content: "Project proposal content...",
        tags: ["business", "proposal"],
        version: 1,
    },
    {
        id: 2,
        name: "Marketing Strategy.docx",
        category: "Marketing",
        lastModified: "1 day ago",
        size: "1.8 MB",
        created: "2024-01-09",
        type: "docx",
        content: "Marketing strategy content...",
        tags: ["marketing", "strategy"],
        version: 2,
    },
    {
        id: 3,
        name: "Financial Report Q3.xlsx",
        category: "Finance",
        lastModified: "3 days ago",
        size: "3.2 MB",
        created: "2024-01-07",
        type: "xlsx",
        content: "Financial data...",
        tags: ["finance", "quarterly"],
        version: 1,
    },
    // Generate more dummy data
    ...Array.from({ length: 97 }, (_, i) => ({
        id: i + 4,
        name: `Document ${i + 4}.${["pdf", "docx", "xlsx", "png"][i % 4]}`,
        category: ["Business", "Marketing", "Finance", "Research", "Design", "Technical"][i % 6],
        lastModified: `${Math.floor(Math.random() * 30) + 1} days ago`,
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        created: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        type: ["pdf", "docx", "xlsx", "png", "figma", "md", "csv"][i % 7] as DocumentData["type"],
        content: `Content for document ${i + 4}`,
        tags: [`tag${i % 5}`, `category${i % 3}`],
        version: Math.floor(Math.random() * 5) + 1,
    })),
]

