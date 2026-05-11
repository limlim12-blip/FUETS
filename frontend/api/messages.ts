import axios from 'axios';
import { conv } from './conversations';
export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
}

const api = axios.create({
    baseURL: 'https://example.com',
});

export const fetchMessages = async (convId: string) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    const target = conv.find(c => c.id === convId);
    return target ? target.messages : [];
}

export const createMessage = async ({ convId, content }: { convId: string, content: string }) => {
    const target = conv.find(c => c.id === convId);
    if (!target) throw new Error("Conversation not found");

    const result: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: content,
        createdAt: new Date().toISOString(),
    };
    target.messages.push(result);
    return result


};

export const deleteMessage = async (id: string) => {
    await fetch(`/api/covs/${id}`);
}


