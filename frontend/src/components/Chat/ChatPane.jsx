import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import { useStorageActions } from "@/src/api/storage/useStorage";
import { Virtuoso } from 'react-virtuoso'; // 🌟 USING THE FREE VERSION
import Message from "./Message";
import UniversalMediaView from "./pdfView";
import Composer from "./Composer";
import { timeAgo } from "../utils";
import { useMessageActions } from "@/src/api/chats/useMessages";
import { Sparkles, Bot } from "lucide-react";

const EmptyChatState = ({ onPromptClick }) => {
    const suggestions = [
        "Câu gì đấy nịnh anh",
        "Câu gì đấy hỏi về anh",
        "Câu gì đấy",
    ];

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Bot className="h-10 w-10 text-zinc-600 dark:text-zinc-400" />
            </div>

            <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                HOLE to FUET
            </h2>
            <p className="mb-8 max-w-sm text-zinc-500 dark:text-zinc-400">
                Start a new conversation or pick one of the suggestions below to begin autonomous research.
            </p>

            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {suggestions.map((text, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(text)}
                        className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 p-4 text-sm text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <Sparkles className="mb-2 h-4 w-4 text-zinc-400" />
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FloatingThinkingIndicator = ({ isThinking, onPause }) => {
    return (
        <div
            className={`absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none transition-all duration-300 ease-out ${isThinking ? "translate-y-0 opacity-100 visible" : "translate-y-4 opacity-0 invisible"
                }`}
        >
            <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-zinc-600 shadow-md backdrop-blur-md ring-1 ring-zinc-200/50 dark:bg-zinc-800/90 dark:text-zinc-300 dark:ring-zinc-700/50">
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 dark:bg-zinc-400" />
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 dark:bg-zinc-400 [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 dark:bg-zinc-400 [animation-delay:-0.3s]" />
                </div>
                <span>Thinking</span>
            </div>
        </div>
    );
};

const preprocessText = (text) => {
    if (!text || typeof text !== "string") return text;

    const sourceMap = new Map();
    let nextSourceNumber = 1;

    return text.replace(/\[Source:\s*([^\]]+)\]/g, (match, url) => {
        const source = url.trim();
        if (source.startsWith("reviews")) {
            return ""
        }
        let sourcePath = source.replace("r2://docs", "");

        let currentSourceNumber;
        if (sourceMap.has(sourcePath)) {
            currentSourceNumber = sourceMap.get(sourcePath);
        } else {
            currentSourceNumber = nextSourceNumber++;
            sourceMap.set(sourcePath, currentSourceNumber);
        }

        return `[${currentSourceNumber}](CITATION:${encodeURI(sourcePath)})`;
    });
};

const ItemContent = ({ data: m, context }) => {
    const processedContent = m.role === "user" ? m.content : preprocessText(m.content);

    return (
        <div className="w-full py-4 flex justify-center">
            <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-2 overflow-hidden">
                <Message role={m.role}>
                    {m.role === "user" ? (
                        <div className="whitespace-pre-wrap flow-root text-base sm:text-lg">
                            {m.content}
                        </div>
                    ) : (
                        <div className="text-zinc-800 dark:text-zinc-200 text-base sm:text-lg whitespace-normal break-words leading-normal">
                            <ReactMarkdown
                                urlTransform={(value) => value}
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="m-0 p-0">{children}</li>,
                                    a: ({ node, href, children, ...props }) => {
                                        if (href && href.startsWith("CITATION:")) {
                                            const sourcePath = decodeURI(href.replace("CITATION:", ""));
                                            return (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        context.setDocument(sourcePath);
                                                        context.SetIsOpenPDFview(true);
                                                    }}
                                                    title={sourcePath}
                                                    className="inline-flex items-center justify-center rounded-sm bg-zinc-200/60 px-[5px] py-0 mx-[2px] text-[10px] font-semibold text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors align-super"
                                                >
                                                    {children}
                                                </button>
                                            );
                                        }
                                        return (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" {...props}>
                                                {children}
                                            </a>
                                        );
                                    }
                                }}
                            >
                                {processedContent}
                            </ReactMarkdown>
                        </div>
                    )}
                </Message>
            </div>
        </div>
    );
};

const listComponents = {
    Header: ({ context }) => (
        <div className="pt-6 pb-2">
            <div className="h-[40px] flex items-center justify-center">
                {context.isLoadingHistory && (
                    <span className="text-sm text-zinc-500">Loading older messages…</span>
                )}
            </div>
        </div>
    ),
    EmptyPlaceholder: () => (
        <div className="flex h-full items-start pt-10">
            <div className="max-w-3xl w-full rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No messages yet. Say hello to start.
            </div>
        </div>
    ),
};

const ChatPane = forwardRef(function ChatPane(
    { conversation, onSend, onResendMessage, isThinking, onPauseThinking },
    ref
) {
    const composerRef = useRef(null);
    const virtuosoRef = useRef(null); // 🌟 Added ref for native Virtuoso scrolling
    const [isForceSnapping, setIsForceSnapping] = useState(false);
    const [document, setDocument] = useState("");
    const [isOpenPDFview, SetIsOpenPDFview] = useState(false);

    const handleClosePDFView = () => {
        SetIsOpenPDFview(false);
    };

    const {
        messages,
        messageCount,
        fetchOlderMessages,
        hasMoreHistory,
        isLoadingHistory,
        isLoading,
        error
    } = useMessageActions(conversation?.id ?? "");

    useImperativeHandle(ref, () => ({
        insertTemplate: (content) => composerRef.current?.insertTemplate(content),
        scrollToBottom: () => {
            virtuosoRef.current?.scrollToIndex({
                index: 'LAST',
                behavior: 'auto'
            });
        },
    }), []);

    const handleSend = useCallback(async (text) => {
        if (!text.trim()) return;
        setIsForceSnapping(true);

        try {
            await onSend?.(text);
        } finally {
            setTimeout(() => setIsForceSnapping(false), 150);
        }
    }, [onSend]);
    const hasInitialScrolled = useRef(false);

    React.useEffect(() => {
        hasInitialScrolled.current = false;
    }, [conversation?.id]);

    React.useEffect(() => {
        if (!isLoading && messages.length > 0 && !hasInitialScrolled.current) {
            // Đợi 50ms cho Markdown render xong xuôi chiều cao
            const timeoutId = setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: 'LAST',
                    align: 'end',
                    behavior: 'auto' // Cuộn tức thì, không tạo hiệu ứng mượt gây khó chịu lúc mới load
                });
                hasInitialScrolled.current = true;
            }, 50);
            return () => clearTimeout(timeoutId);
        }
    }, [messages, isLoading]);
    if (!conversation) return null;
    if (messages.length === 0 && isLoading) return <div className="p-4 text-center text-zinc-500">Loading messages…</div>;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-50/50">Failed to load chat.</div>;

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden relative">
            <div className="z-10 flex shrink-0 flex-col items-center justify-center w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pt-4 pb-2">
                <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center text-center">
                    <h1
                        className="max-w-[85%] sm:max-w-[70%] truncate text-lg sm:text-xl font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight"
                        title={conversation?.title || "New Chat"}
                    >
                        {conversation?.title || "New Chat"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            </span>
                            Active
                        </span>
                        <span>&middot;</span>
                        <span>{messageCount || 0} messages</span>
                    </div>
                </div>

                {/* Đường kẻ phân cách Gradient */}
                <div className="w-full max-w-6xl px-4 sm:px-6 mt-3">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {messages.length === 0 ? (
                    <EmptyChatState onPromptClick={handleSend} />
                ) : (
                    // 🌟 FREE VIRTUOSO IMPLEMENTATION
                    <Virtuoso
                        ref={virtuosoRef}
                        className="h-full w-full overscroll-y-none"
                        data={messages}

                        alignToBottom={true}
                        followOutput="auto"

                        startReached={() => {
                            if (hasMoreHistory && !isLoadingHistory && !isLoading) {
                                fetchOlderMessages();
                            }
                        }}
                        computeItemKey={(index, message) => message?.id || index}
                        context={{
                            isLoadingHistory,
                            SetIsOpenPDFview,
                            isOpenPDFview,
                            setDocument,
                            onResendMessage,
                            onPromptClick: handleSend,
                            title: conversation.title,
                            updatedAt: conversation.updatedAt,
                            count: messages.length || conversation.messageCount || 0,
                        }}
                        itemContent={(index, message, context) => (
                            <ItemContent data={message} context={context} />
                        )}
                        components={listComponents}
                    />
                )}

                <FloatingThinkingIndicator isThinking={isThinking} onPause={onPauseThinking} />
            </div>

            <Composer
                ref={composerRef}
                onSend={handleSend}
                busy={isThinking || isForceSnapping}
            />
            <UniversalMediaView
                document={document}
                isOpen={isOpenPDFview}
                onClose={handleClosePDFView}
            />
        </div>
    );
});

export default ChatPane;
