"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react"
import { cls } from "@/src/components/utils"

export default function ConversationRow({ data, active, onSelect, onTogglePin, onDelete, onRename }) {
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
        onTogglePin?.()
        setShowMenu(false)
    }

    const handleRename = (e) => {
        e.stopPropagation()
        const newName = prompt(`Rename chat "${data.title}" to:`, data.title)
        if (newName && newName.trim() && newName !== data.title) {
            onRename?.(data.id, newName.trim())
        }
        setShowMenu(false)
    }

    const handleDelete = (e) => {
        e.stopPropagation()
        if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
            onDelete?.(data.id)
        }
        setShowMenu(false)
    }

    return (
        <div className={cls("group relative", showMenu ? "z-50" : "z-0")}>
            <div
                role="button"
                tabIndex={0}
                onClick={onSelect}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect();
                    }
                }}
                className={cls(
                    "-mx-1 flex w-[calc(100%+8px)] items-center gap-2 rounded-lg px-2 py-2 text-left transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                    active
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                title={data.title}
            >
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {data.pinned && <Pin className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400" />}
                        <span className="truncate text-sm font-medium tracking-tight">{data.title}</span>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(prev => !prev);
                        }}
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
                            "absolute right-0 top-full mt-1 w-36 origin-top-right rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-[100]",
                            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            showMenu
                                ? "visible translate-y-0 scale-100 opacity-100"
                                : "invisible -translate-y-1 scale-95 opacity-0"
                        )}
                        style={{
                            willChange: "transform, opacity",
                            backfaceVisibility: "hidden"
                        }}
                    >
                        <button
                            onClick={handlePin}
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                        >
                            <Pin className={cls("h-3.5 w-3.5", data.pinned ? "fill-blue-500 text-blue-500" : "text-zinc-500")} />
                            {data.pinned ? "Unpin" : "Pin"}
                        </button>

                        <button
                            onClick={handleRename}
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                        >
                            <Edit3 className="h-3.5 w-3.5 text-zinc-500" />
                            Rename
                        </button>

                        <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

                        <button
                            onClick={handleDelete}
                            className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Tooltip Preview */}
            <div className="pointer-events-none absolute left-[calc(100%+6px)] top-1 hidden w-64 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 md:group-hover:block animate-in fade-in zoom-in-95 duration-200 z-[110]">
                <div className="line-clamp-6 whitespace-pre-wrap">{data.preview}</div>
            </div>
        </div>
    )
}
