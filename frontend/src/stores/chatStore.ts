import { create } from "zustand"


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
    setCollapsedComponent: (updater: SidebarComponentState | ((prev: SidebarComponentState) => SidebarComponentState)) => void
    pauseThinking: () => void
}

export const UseChatStore = create<ChatStore>()(
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
    }),
)
