"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FileText } from "lucide-react"
import {
    PanelLeftClose,
    PanelLeftOpen,
    SearchIcon,
    Plus,
    Star,
    Clock,
    Settings,
    Asterisk,
} from "lucide-react"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import SearchModal from "./SearchModal"
import SettingsPopover from "./SettingsPopover"
import { cls } from "./utils"
import { useState, useEffect } from "react"

export default function Sidebar({
    open = false,
    onClose = () => { },
    collapsed = { pinned: true, recent: false },
    setCollapsed = () => { },
    sidebarCollapsed = false,
    setSidebarCollapsed = () => { },
    conversations = [],
    pinned = [],
    recent = [],
    selectedId = null,
    onSelect = () => { },
    togglePin = () => { },
    query = "",
    setQuery = () => { },
    searchRef = null,
    createNewChat = () => { },
}) {
    const [showSearchModal, setShowSearchModal] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSearchClick = () => setShowSearchModal(true)
    const handleNewChatClick = () => createNewChat()

    // Prevent hydration errors
    if (!mounted) return null

    if (sidebarCollapsed) {
        return (
            <>
                <motion.aside
                    initial={{ width: 100 }}
                    animate={{ width: 64 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                            aria-label="Open sidebar"
                            title="Open sidebar"
                        >
                            <PanelLeftOpen className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col items-center gap-2 pt-4">
                        <button
                            onClick={handleNewChatClick}
                            className="rounded-xl p-2.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800 transition-colors"
                            title="New Chat"
                        >
                            <Plus className="h-5 w-5" />
                        </button>

                        <button
                            onClick={handleSearchClick}
                            className="rounded-xl p-2.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800 transition-colors"
                            title="Search chats"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                        <div className="px-3 pt-2">
                            <Link
                                href="/doc"
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                            >
                                <FileText className="h-5 w-5" /> Go to Docs
                            </Link>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col items-center gap-2 pb-4">
                        <SettingsPopover>
                            <button
                                className="rounded-xl p-2.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800 transition-colors"
                                title="Settings"
                            >
                                <Settings className="h-5 w-5" />
                            </button>
                        </SettingsPopover>
                    </div>
                </motion.aside>

                <SearchModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    conversations={conversations}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    togglePin={togglePin}
                    createNewChat={createNewChat}
                />
            </>
        )
    }

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 md:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {true && (
                    <motion.aside
                        key="sidebar"
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        exit={{ x: -340 }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className={cls(
                            "z-50 flex h-full w-64 lg:w-72 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
                            "fixed inset-y-0 left-0 md:static md:translate-x-0",
                        )}
                    >
                        <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm dark:from-zinc-200 dark:to-zinc-300 dark:text-zinc-900">
                                    <Asterisk className="h-4 w-4" />
                                </div>
                                <div className="text-sm font-semibold tracking-tight">AI Assistant</div>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                                <button
                                    onClick={() => setSidebarCollapsed(true)}
                                    className="hidden md:block rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                                    aria-label="Close sidebar"
                                    title="Close sidebar"
                                >
                                    <PanelLeftClose className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={onClose}
                                    className="md:hidden rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                                    aria-label="Close sidebar"
                                >
                                    <PanelLeftClose className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="px-3 pt-3">
                            <label htmlFor="search" className="sr-only">
                                Search conversations
                            </label>
                            <div className="relative">
                                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    id="search"
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search…"
                                    onClick={() => setShowSearchModal(true)}
                                    onFocus={() => setShowSearchModal(true)}
                                    className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                                />
                            </div>
                        </div>

                        <div className="px-3 pt-3">
                            <button
                                onClick={createNewChat}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900"
                                title="New Chat (⌘N)"
                            >
                                <Plus className="h-4 w-4" /> Start New Chat
                            </button>
                        </div>
                        <div className="px-3 pt-2">
                            <Link
                                href="/doc"
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                            >
                                <FileText className="h-4 w-4" /> Go to Docs
                            </Link>
                        </div>
                        <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
                            <SidebarSection
                                icon={<Star className="h-4 w-4" />}
                                title="PINNED CHATS"
                                collapsed={collapsed.pinned}
                                onToggle={() => setCollapsed((s) => ({ ...s, pinned: !s.pinned }))}
                            >
                                {pinned.length === 0 ? (
                                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                        Pin important threads for quick access.
                                    </div>
                                ) : (
                                    pinned.map((c) => (
                                        <ConversationRow
                                            key={c.id}
                                            data={c}
                                            active={c.id === selectedId}
                                            onSelect={() => onSelect(c.id)}
                                            onTogglePin={() => togglePin(c.id)}
                                        />
                                    ))
                                )}
                            </SidebarSection>
                            <SidebarSection
                                icon={<Clock className="h-4 w-4" />}
                                title="RECENT"
                                collapsed={collapsed.recent}
                                onToggle={() => setCollapsed((s) => ({ ...s, recent: !s.recent }))}
                            >
                                {recent.length === 0 ? (
                                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                        No conversations yet. Start a new one!
                                    </div>
                                ) : (
                                    recent.map((c) => (
                                        <ConversationRow
                                            key={c.id}
                                            data={c}
                                            active={c.id === selectedId}
                                            onSelect={() => onSelect(c.id)}
                                            onTogglePin={() => togglePin(c.id)}
                                            showMeta
                                        />
                                    ))
                                )}
                            </SidebarSection>
                        </nav>
                        <div className="mt-auto border-t border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
                            <SettingsPopover>
                                <button className="w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <div className="flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                                            JD
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">John Doe</div>
                                            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">Pro workspace</div>
                                        </div>
                                    </div>
                                </button>
                            </SettingsPopover>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <SearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                conversations={conversations}
                selectedId={selectedId}
                onSelect={onSelect}
                togglePin={togglePin}
                createNewChat={createNewChat}
            />
        </>
    )
}
