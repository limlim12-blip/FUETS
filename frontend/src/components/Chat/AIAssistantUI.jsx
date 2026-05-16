"use client"


import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Calendar, LayoutGrid, MoreHorizontal, } from "lucide-react"
import { LoadingScreen } from "@/src/components/Chat/loading-screen"
import Sidebar from "@/src/components/Chat/Sidebar"
import Header from "@/src/components/Chat/Header"
import ChatPane from "@/src/components/Chat/ChatPane"
import GhostIconButton from "@/src/components/Chat/GhostIconButton"
import { UseChatStore } from "@/src/stores/chatStore"
import { useChatActions } from "@/src/api/chats/useChats"
import { useMessageActions } from "@/src/api/chats/useMessages"


export default function AIAssistantUI() {
    // Store
    const {
        sidebarOpen,
        setSidebarOpen,
        selectedId,
        setSelectedId,
        collapsedComponent,
        setIsThinking,
        setCollapsedComponent,
        sidebarCollapsed,
        setSidebarCollapsed,
        isThinking,
        thinkingConvId,
        setThinkingConvId,
        pauseThinking,
    } = UseChatStore()
    //  Local State
    const {
        handleCreate: handleCreateChat,
        handleUpdate: handleUpdateChat,
        conversations = [],
        isCreating: isCreatingChat,
        isLoading: isLoadingChat,
        isUpdating: isUpdatingChat
    } = useChatActions()
    const {
        handleCreate: handleCreateMessage,
        isCreating: isCreatingMessage,
    } = useMessageActions(selectedId)
    const handleTogglePin = useCallback(async (id, newPinnedState) => {
        console.log("WHAT IS ID??", typeof id, id);
        if (isUpdatingChat) return;
        await handleUpdateChat({
            id: id,
            data: { pinned: newPinnedState }
        }).catch((error) => {
            console.error("Error updating conv", error);
        });
    }, [isUpdatingChat, handleUpdateChat]);


    const handleCreateNewChat = useCallback(async () => {
        if (isCreatingChat) return;
        await handleCreateChat().then((response) => {
            setSelectedId(response.id);
        }).catch((error) => {
            console.error("Error creating conv", error);
        });
    }, [isCreatingChat, handleCreateChat, setSelectedId]);

    const handleSendMessage = useCallback(async (selectedId, content) => {
        if (!selectedId) {
            console.error("No chat is selected!.");
            return;
        }

        if (isCreatingMessage?.isPending) return;

        try {
            setIsThinking(true);
            setThinkingConvId(selectedId);

            await handleCreateMessage(selectedId, { content: content });
            setIsThinking(false);
            setThinkingConvId(null);

        } catch (error) {
            setTimeout(() => {
                setIsThinking(false);
                setThinkingConvId(null);
            }, 2);
            console.error("Error sending message", error);
        }
    }, [handleCreateMessage]);

    const [isMounted, setIsMounted] = useState(false)
    const [query, setQuery] = useState("")
    const searchRef = useRef(null)
    const composerRef = useRef(null)

    // Effect
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const hasInitialized = useRef(false)
    useEffect(() => {
        if (!isLoadingChat && !hasInitialized.current) {
            if (conversations.length === 0) {
                hasInitialized.current = true;
                handleCreateNewChat();
            }
            else if (conversations.length > 0 && !selectedId) {
                hasInitialized.current = true;
                setSelectedId(conversations[0].id);
            }
        }
    }, [!isLoadingChat, conversations.length, isMounted, selectedId, handleCreateNewChat, setSelectedId]);
    // fileter
    // NOTE: What a mess
    const filtered = useMemo(() => {
        if (!query.trim()) return conversations
        const q = query.toLowerCase()
        return conversations.filter((c) =>
            c.title?.toLowerCase().includes(q) || c.preview?.toLowerCase().includes(q)
        )
    }, [conversations, query])
    const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    const recent = filtered
        .filter((c) => !c.pinned)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 10)

    const selected = conversations.find((c) => c.id === selectedId) || null

    if (!isMounted) {
        return <LoadingScreen />
    }

    return (
        <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">
                    <span className="inline-flex h-4 w-4 items-center justify-center">✱</span> AI Assistant
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <GhostIconButton label="Schedule">
                        <Calendar className="h-4 w-4" />
                    </GhostIconButton>
                    <GhostIconButton label="Apps">
                        <LayoutGrid className="h-4 w-4" />
                    </GhostIconButton>
                    <GhostIconButton label="More">
                        <MoreHorizontal className="h-4 w-4" />
                    </GhostIconButton>
                </div>
            </div>
            <div className="flex h-screen w-full">
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    collapsed={collapsedComponent}
                    setCollapsed={setCollapsedComponent}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    conversations={conversations}
                    pinned={pinned}
                    recent={recent}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                    togglePin={handleTogglePin}
                    query={query}
                    setQuery={setQuery}
                    searchRef={searchRef}
                    createNewChat={handleCreateNewChat}
                />
                <main className="relative flex min-w-0 flex-1 flex-col">
                    <Header createNewChat={handleCreateNewChat} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
                    <ChatPane
                        ref={composerRef}
                        conversation={selected}
                        onSend={(content) => selected && handleSendMessage(selected.id, content)}
                        isThinking={isThinking && thinkingConvId === selected?.id}
                        onPauseThinking={pauseThinking}
                    />
                </main>
            </div>
        </div >
    )
}
