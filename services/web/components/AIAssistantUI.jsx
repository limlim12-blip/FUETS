"use client"


import React, { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, LayoutGrid, MoreHorizontal, FileText } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ChatPane from "@/components/ChatPane"
import GhostIconButton from "@/components/GhostIconButton"
import { INITIAL_CONVERSATIONS, } from "@/components/mockData"
import { UseChatStore } from "@/stores/chat-store"

export default function AIAssistantUI() {
    // Store
    const {
        sidebarOpen,
        setSidebarOpen,
        conversations,
        selectedId,
        setSelectedId,
        collapsedComponent,
        setCollapsedComponent,
        sidebarCollapsed,
        setSidebarCollapsed,
        isThinking,
        thinkingConvId,
        createNewChat,
        sendMessage,
        resendMessage,
        pauseThinking,
        togglePin
    } = UseChatStore()
    //  Local State
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
        if (isMounted && !hasInitialized.current && !selectedId && conversations.length === 0) {
            hasInitialized.current = true;
            createNewChat();
        }
    }, [isMounted, createNewChat])
    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
                e.preventDefault()
                createNewChat()
            }
            if (!e.metaKey && !e.ctrlKey && e.key === "/") {
                const tag = document.activeElement?.tagName?.toLowerCase()
                if (tag !== "input" && tag !== "textarea") {
                    e.preventDefault()
                    searchRef.current?.focus()
                }
            }
            if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [sidebarOpen, createNewChat, setSidebarOpen])

    // fileter
    // TODO: What a mess
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
                    createNewChat={createNewChat}
                />
                <main className="relative flex min-w-0 flex-1 flex-col">
                    <Header createNewChat={createNewChat} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
                    <ChatPane
                        ref={composerRef}
                        conversation={selected}
                        onSend={(content) => selected && sendMessage(selected.id, content)}
                        onEditMessage={(messageId, newContent) => selected && editMessage(selected.id, messageId, newContent)}
                        onResendMessage={(messageId) => selected && resendMessage(selected.id, messageId)}
                        isThinking={isThinking && thinkingConvId === selected?.id}
                        onPauseThinking={pauseThinking}
                    />
                </main>
            </div>
        </div >
    )
}
