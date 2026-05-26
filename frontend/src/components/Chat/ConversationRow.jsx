"use client"

import React from 'react';
import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react"
import { cls } from "@/src/components/utils"
import { useChatActions } from '@/src/api/chats/useChats';

export default function ConversationRow({ data, active, onSelect, togglePin, onDelete, onRename }) {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showMenu])

    const handlePin = (e) => {
        e.stopPropagation()
        togglePin?.(data.id, !data.pinned)
        setShowMenu(false)
    }

    const {
        handleUpdate: handleUpdateChat,
        isUpdating: isUpdatingChat,
        handleDelete: handleDeleteChat,
        isDeleting,
    } = useChatActions()
    const handleRename = async (e) => {
        e.stopPropagation()
        const newName = prompt(`Rename chat "${data.title}" to:`, data.title)
        if (newName && newName.trim() && newName !== data.title) {
            if (isUpdatingChat) return;
            await handleUpdateChat(data.id, { title: newName }).catch((error) => {
                console.error("Error updating conv", error);
            });
        }
        setShowMenu(false)
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
            try {
                await handleDeleteChat(data.id);
            } catch (error) {
                console.error("Error deleting message", error);
            }
        }
        setShowMenu(false)
    }

    return (
        <div className={cls("group relative flex items-center w-full", showMenu ? "z-50" : "z-0")}>
            <div
                role="button"
                tabIndex={0}
                onClick={onSelect}
                className={cls(
                    "flex-1 min-w-0 flex items-center gap-2 rounded-lg px-3 py-2 text-left transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                    active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100" : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                title={data.title}
            >
                <div className="flex items-center gap-2 min-w-0 w-53">
                    {data.pinned && <Pin className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400" />}
                    <span className="truncate text-sm font-medium tracking-tight flex-1 min-w-0">
                        {data.title}
                    </span>
                </div>
            </div>

            <div className="relative shrink-0 w-8 flex items-center justify-center" ref={menuRef}>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowMenu(prev => !prev); }}
                    className={cls(
                        "rounded-md p-1 text-zinc-500 transition-all hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60",
                        showMenu ? "opacity-100 bg-zinc-200/50 dark:bg-zinc-700/60" : "opacity-0 group-hover:opacity-100"
                    )}
                    aria-label="Chat options"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                <div
                    className={cls(
                        "absolute right-0 top-full mt-1 w-36 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50",
                        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        showMenu ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0"
                    )}
                >
                    <button onClick={handlePin} className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                        <Pin className={cls("h-3.5 w-3.5", data.pinned ? "fill-blue-500 text-blue-500" : "text-zinc-500")} />
                        {data.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={handleRename} className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                        <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
                        Rename
                    </button>
                    <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <button onClick={handleDelete} className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
