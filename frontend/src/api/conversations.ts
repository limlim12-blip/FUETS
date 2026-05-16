import axios from 'axios';
export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
    preview: string;
    pinned: boolean;
    messages: Message[];
}

const api = axios.create({
    baseURL: 'https://example.com',
});

export let conv: Conversation[] = []
export const fetchCovs = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    return [...conv]
}

export const createCov = async () => {
    const result: Conversation = {
        id: `temp-${Date.now()}`,
        title: "New Chat",
        updatedAt: new Date().toISOString(),
        preview: "Say hello to start...",
        pinned: false,
        messages: [],
    };
    conv.unshift(result);
    return result

};

export const deleteCov = async (id: string) => {
    conv = conv.filter(c => c.id !== id);
    await fetch(`/api/covs/${id}`);
}

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

