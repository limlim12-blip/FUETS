import { Conversation, Message } from "@/src/api/chats";
import { create } from "zustand"
import { persist } from 'zustand/middleware'


const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export interface SidebarComponentState {
    pinned: boolean;
    recent: boolean;
}

interface ChatStore {
    sidebarOpen: boolean
    selectedId: string | null
    collapsedComponent: SidebarComponentState
    isThinking: boolean
    thinkingConvId: string | null
    sidebarCollapsed: boolean

    setSidebarOpen: (sidebarOpen: boolean) => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setSelectedId: (id: string | null) => void
    setThinkingConvId: (convId: string | null) => void
    setIsThinking: (thinking: boolean) => void
    // togglePin: (id: string) => void
    setCollapsedComponent: (updater: SidebarComponentState | ((prev: SidebarComponentState) => SidebarComponentState)) => void
    pauseThinking: () => void
}

export const UseChatStore = create<ChatStore>()(
    persist(
        (set) => ({
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
            setSelectedId: (selectedId) => set({ selectedId }),
            setThinkingConvId: (thinkingConvId) => set({ thinkingConvId }),
            setIsThinking: (isThinking) => set({ isThinking }),

            //NOTE: they say c++ look like shit
            setCollapsedComponent: (updater) => set((state) => ({
                collapsedComponent: typeof updater === 'function'
                    ? updater(state.collapsedComponent)
                    : { ...state.collapsedComponent, ...updater }
            })),

            pauseThinking: () => set({ isThinking: false, thinkingConvId: null }),
            setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
            // togglePin: (id) => {
            //     set((state) => ({
            //         conversations: state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
            //     }))
            // }
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                selectedId: state.selectedId,
                sidebarCollapsed: state.sidebarCollapsed,
                collapsedComponent: state.collapsedComponent
            })
        }
    )
)
