import { create } from "zustand"
import { persist } from 'zustand/middleware'
import { INITIAL_CONVERSATIONS, } from "@/components/mockData"

const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
    editedAt?: string;
}
export interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
    messageCount: number;
    preview: string;
    pinned: boolean;
    messages: Message[];
}
export interface SidebarComponentState {
    pinned: boolean;
    recent: boolean;
}

interface ChatStore {
    sidebarOpen: boolean
    conversations: Conversation[]
    selectedId: string | null
    collapsedComponent: SidebarComponentState
    isThinking: boolean
    thinkingConvId: string | null
    sidebarCollapsed: boolean

    setSidebarOpen: (sidebarOpen: boolean) => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setConversations: () => Promise<void>
    setSelectedId: (id: string | null) => void
    setThinkingConvId: (convId: string | null) => void
    setIsThinking: (thinking: boolean) => void
    togglePin: (id: string) => void
    createNewChat: () => Promise<void>
    sendMessage: (convId: string, content: string) => Promise<void>
    resendMessage: (convId: string, messageId: string) => Promise<void>
    setCollapsedComponent: (updater: SidebarComponentState | ((prev: SidebarComponentState) => SidebarComponentState)) => void
    pauseThinking: () => void
}

export const UseChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            // state
            sidebarOpen: false,
            conversations: [],
            selectedId: null,
            collapsedComponent: { pinned: true, recent: false },
            isThinking: false,
            thinkingConvId: null,
            sidebarCollapsed: false,

            // action
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            setConversations: async () => {
                await sleep(2000);
                // const res = await fetch('/api/chats');
                // const conv = await res.json();
                set({ conversations: INITIAL_CONVERSATIONS })
            },
            setSelectedId: (selectedId) => set({ selectedId }),
            setThinkingConvId: (thinkingConvId) => set({ thinkingConvId }),
            setIsThinking: (isThinking) => set({ isThinking }),

            //NOTE: they say c++ look like shit
            setCollapsedComponent: (updater) => set((state) => ({
                collapsedComponent: typeof updater === 'function'
                    ? updater(state.collapsedComponent)
                    : { ...state.collapsedComponent, ...updater }
            })),

            createNewChat: async () => {
                //TODO:
                const tempId = `temp-${Date.now()}`;
                const tempChat: Conversation = {
                    id: tempId,
                    title: "New Chat",
                    updatedAt: new Date().toISOString(),
                    messageCount: 0,
                    preview: "",
                    pinned: false,
                    messages: [],
                };

                set((state) => ({
                    conversations: [tempChat, ...state.conversations],
                }));
                try {
                    // const res = await fetch('/api/chats', {
                    //     method: 'POST',
                    // });
                    // const Conv = await res.json();
                    await sleep(500);
                    const Conv: Conversation = {
                        id: `chat-${Math.random().toString(36).slice(2)}`,
                        title: "New Chat",
                        updatedAt: new Date().toISOString(),
                        messageCount: 0,
                        preview: "Say hello to start...",
                        pinned: false,
                        messages: [],
                    };


                    console.log("hi")

                    set((state) => ({
                        conversations: state.conversations.map(c =>
                            c?.id === tempId ? Conv : c
                        ),
                        selectedId: Conv.id
                    }));
                } catch (error) {
                    console.log("hi3")

                    set((state) => ({
                        conversations: state.conversations.filter(c => c.id !== tempId),
                        sidebarOpen: false,
                    }),
                    );
                }
            },

            sendMessage: async (convId, content) => {
                if (!content.trim()) return
                const now = new Date().toISOString()
                const userMsg: Message = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }
                set((state) => ({
                    //TODO: 
                    conversations: state.conversations.map((c) => {
                        if (c?.id !== convId) return c;
                        const msgs = [...(c.messages || []), userMsg];
                        return {
                            ...c,
                            messages: msgs,
                            updatedAt: now,
                            messageCount: msgs.length,
                            preview: content.slice(0, 80),
                        };
                    }),
                }));
                set({
                    isThinking: true,
                    thinkingConvId: convId
                })
                setTimeout(() => {
                    // Always clear thinking state and generate response for this specific conversation
                    set({
                        isThinking: true,
                        thinkingConvId: convId
                    })
                    set((state) => ({
                        //TODO: 
                        conversations: state.conversations.map((c) => {
                            if (c?.id !== convId) return c
                            const ack = `Got it — I'll help with that.`
                            const asstMsg: Message = {
                                id: Math.random().toString(36).slice(2),
                                role: "assistant",
                                content: ack,
                                createdAt: new Date().toISOString(),
                            }
                            const msgs = [...(c.messages || []), asstMsg]
                            return {
                                ...c,
                                messages: msgs,
                                updatedAt: new Date().toISOString(),
                                messageCount: msgs.length,
                                preview: asstMsg.content.slice(0, 80),
                            }
                        }),
                    }))
                    set({
                        isThinking: false,
                        thinkingConvId: null
                    })

                }, 2000)

            },
            resendMessage: async (convId, messageId) => {
                const state = get();
                const conv = state.conversations.find((c) => c.id === convId);
                if (!conv) return;
                const msg = conv.messages.find((m) => m.id === messageId)
                if (!msg) return
                set((state) => ({
                    conversations: state.conversations.map((c) => {
                        if (c.id !== convId) return c;
                        return {
                            ...c,
                            messages: c.messages.filter((m) => m.id !== messageId),
                        };
                    }),
                })),
                    await get().sendMessage(convId, msg.content);
            },
            pauseThinking: () => set({ isThinking: false, thinkingConvId: null }),
            setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
            togglePin: (id) => {
                set((state) => ({
                    conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
                }))
            }
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                conversations: state.conversations,
                sidebarOpen: state.sidebarOpen,
                selectedId: state.selectedId,
                sidebarCollapsed: state.sidebarCollapsed,
                collapsedComponent: state.collapsedComponent
            })
        }
    )
)
