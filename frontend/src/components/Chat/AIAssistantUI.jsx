"use client"


import React, { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, LayoutGrid, MoreHorizontal, FileText } from "lucide-react"
import { LoadingScreen } from "@/src/components/Chat/loading-screen"
import Sidebar from "@/src/components/Chat/Sidebar"
import Header from "@/src/components/Chat/Header"
import ChatPane from "@/src/components/Chat/ChatPane"
import GhostIconButton from "@/src/components/Chat/GhostIconButton"
import { UseChatStore } from "@/src/stores/chatStore"
import { useCovs, useCreateCov } from "@/src/hooks/useConv"
import { useMessages, useCreateMessages, useUpdateMessage } from "@/src/hooks/useMessages"
import { Conversation } from '@/src/api/conversations';


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
        togglePin
    } = UseChatStore()
    //  Local State
    const { data: conversations = [], isFetched } = useCovs();
    const createCovMutation = useCreateCov();
    const handleCreateNewChat = () => {
        if (createCovMutation.isPending) return;
        createCovMutation.mutate(undefined, {
            onSuccess: (NewChat) => {
                setSelectedId(NewChat.id);
            },
            onError: (error) => {
                console.error("Error creating conv", error);
            }
        });
    };

    const createMessageMutation = useCreateMessages();
    const handleSendMessage = (selectedId, content) => {
        if (createMessageMutation.isPending) return;
        createMessageMutation.mutate({
            convId: selectedId,
            content: content
        }, {
            onSuccess: () => {
                setIsThinking(true)
                setThinkingConvId(selectedId)
            },
            onError: (error) => {
                setTimeout(() => {
                    setIsThinking(false)
                    setThinkingConvId(null)
                }, 2)
                console.error("Error sending message", error);
            }
        });
    }
    const handleResendMessage = (selectedId, msgId) => {
        const msg = selected.messages.find((c) => c.id === msgId)
        if (isThinking) {
            //TODO: turn this error print to a popup or a smth like that
            console.error("could not resend while thinking. Please stop the current action first");
            return
        }
        handleSendMessage(selectedId, msg.content)
    }

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
        if (isFetched && !hasInitialized.current) {
            if (conversations.length === 0) {
                hasInitialized.current = true;
                handleCreateNewChat();
            }
            else if (conversations.length > 0 && !selectedId) {
                hasInitialized.current = true;
            }
        }
    }, [isFetched, conversations.length, isMounted]);
    // fileter
    // NOTE: What a mess
    const filtered = useMemo(() => {
        if (!query.trim()) return conversations
        const q = query.toLowerCase()
        return conversations.filter((c) =>
            c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
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
                    togglePin={togglePin}
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
                        onResendMessage={(messageId) => selected && handleResendMessage(selected.id, messageId)}
                        isThinking={isThinking && thinkingConvId === selected?.id}
                        onPauseThinking={pauseThinking}
                    />
                </main>
            </div>
        </div >
    )
}
