"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { RefreshCw, Square } from "lucide-react"
import Message from "./Message"
import Composer from "./Composer"
import { timeAgo } from "../utils"

function ThinkingMessage({ onPause }) {
    return (
        <Message role="assistant">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                </div>
                <span className="text-sm text-zinc-500">AI is thinking...</span>
                <button
                    onClick={onPause}
                    className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                    <Square className="h-3 w-3" /> Pause
                </button>
            </div>
        </Message>
    )
}

const ChatPane = forwardRef(function ChatPane(
    { conversation, onSend, onResendMessage, isThinking, onPauseThinking },
    ref,
) {
    const [busy, setBusy] = useState(false)
    const composerRef = useRef(null)

    useImperativeHandle(
        ref,
        () => ({
            insertTemplate: (templateContent) => {
                composerRef.current?.insertTemplate(templateContent)
            },
        }),
        [],
    )

    if (!conversation) return null

    const messages = Array.isArray(conversation.messages) ? conversation.messages : []
    const count = messages.length || conversation.messageCount || 0

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
                <div className="mb-2 max-w-3xl">
                    <span className="block leading-[1.05] font-sans text-2xl sm:text-3xl">{conversation.title}</span>
                </div>
                <div className="mb-4 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
                    Updated {timeAgo(conversation.updatedAt)} · {count} messages
                </div>


                {messages.length === 0 ? (
                    <div className="max-w-3xl rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                        No messages yet. Say hello to start.
                    </div>
                ) : (
                    <>
                        {messages.map((m) => (
                            <div key={m.id} className="space-y-2">
                                <Message role={m.role}>
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                    {m.role === "user" && (
                                        <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                                            <button
                                                className="inline-flex items-center gap-1 hover:underline"
                                                onClick={() => onResendMessage?.(m.id)}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" /> Resend
                                            </button>
                                        </div>
                                    )}
                                </Message>
                            </div>
                        ))}
                        {isThinking && <ThinkingMessage onPause={onPauseThinking} />}
                    </>
                )}
            </div>

            <Composer
                ref={composerRef}
                onSend={async (text) => {
                    if (!text.trim()) return
                    setBusy(true)
                    await onSend?.(text)
                    setBusy(false)
                }}
                busy={busy}
            />
        </div>
    )
})

export default ChatPane
