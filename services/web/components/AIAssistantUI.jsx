"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, LayoutGrid, MoreHorizontal, FileText } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ChatPane from "@/components/ChatPane"
import GhostIconButton from "@/components/GhostIconButton"
import { INITIAL_CONVERSATIONS, } from "@/components/mockData"

export default function AIAssistantUI() {
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS)
    const [selectedId, setSelectedId] = useState(null)
    const [query, setQuery] = useState("")
    const searchRef = useRef(null)
    const [isThinking, setIsThinking] = useState(false)
    const [thinkingConvId, setThinkingConvId] = useState(null)
    const [collapsed, setCollapsed] = useState(() => {
        try {
            const raw = localStorage.getItem("sidebar-collapsed")
            return raw ? JSON.parse(raw) : { pinned: true, recent: false }
        } catch {
            return { pinned: true, recent: false, }
        }
    })

    // reload page -> create a new chat
    useEffect(() => {
        if (!selectedId) {
            createNewChat()
        }
    }, [])

    // maybe set default sidebar to collapse?
    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
        } catch { }
    }, [collapsed])

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem("sidebar-collapsed-state")
            return saved ? JSON.parse(saved) : false
        } catch {
            return false
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed-state", JSON.stringify(sidebarCollapsed))
        } catch { }
    }, [sidebarCollapsed])


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
    }, [sidebarOpen, conversations])

    useEffect(() => {
        if (!selectedId && conversations.length > 0) {
            createNewChat()
        }
    }, [])

    const filtered = useMemo(() => {
        if (!query.trim()) return conversations
        const q = query.toLowerCase()
        return conversations.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
    }, [conversations, query])




    const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

    const recent = filtered
        .filter((c) => !c.pinned)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 10)


    function togglePin(id) {
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
    }

    function createNewChat() {
        const id = Math.random().toString(36).slice(2)
        const item = {
            id,
            title: "New Chat",
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            preview: "Say hello to start...",
            pinned: false,
            messages: [], // Ensure messages array is empty for new chats
        }
        setConversations((prev) => [item, ...prev])
        setSelectedId(id)
        setSidebarOpen(false)
    }


    function sendMessage(convId, content) {
        if (!content.trim()) return
        const now = new Date().toISOString()
        const userMsg = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }

        setConversations((prev) =>
            prev.map((c) => {
                if (c.id !== convId) return c
                const msgs = [...(c.messages || []), userMsg]
                return {
                    ...c,
                    messages: msgs,
                    updatedAt: now,
                    messageCount: msgs.length,
                    preview: content.slice(0, 80),
                }
            }),
        )

        setIsThinking(true)
        setThinkingConvId(convId)

        const currentConvId = convId
        setTimeout(() => {
            // Always clear thinking state and generate response for this specific conversation
            setIsThinking(false)
            setThinkingConvId(null)
            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== currentConvId) return c
                    const ack = `Got it — I'll help with that.`
                    const asstMsg = {
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
            )
        }, 2000)
    }

    function editMessage(convId, messageId, newContent) {
        const now = new Date().toISOString()
        setConversations((prev) =>
            prev.map((c) => {
                if (c.id !== convId) return c
                const msgs = (c.messages || []).map((m) =>
                    m.id === messageId ? { ...m, content: newContent, editedAt: now } : m,
                )
                return {
                    ...c,
                    messages: msgs,
                    preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
                }
            }),
        )
    }

    function resendMessage(convId, messageId) {
        const conv = conversations.find((c) => c.id === convId)
        const msg = conv?.messages?.find((m) => m.id === messageId)
        if (!msg) return
        sendMessage(convId, msg.content)
    }

    function pauseThinking() {
        setIsThinking(false)
        setThinkingConvId(null)
    }


    const composerRef = useRef(null)
    const selected = conversations.find((c) => c.id === selectedId) || null

    // Loading screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 10)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
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
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
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
