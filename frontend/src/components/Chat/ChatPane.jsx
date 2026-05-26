import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import { useStorageActions } from "@/src/api/storage/useStorage"
import { VirtuosoMessageList, VirtuosoMessageListLicense } from '@virtuoso.dev/message-list';
import Message from "./Message";
import PdfView from "./pdfView";
import Composer from "./Composer"; import { timeAgo } from "../utils";
import { useMessageActions } from "@/src/api/chats/useMessages";
import { Sparkles, Bot } from "lucide-react";

const SCROLL_SNAP_BOTTOM = {
    type: 'auto-scroll-to-bottom',
    autoScroll: ({ atBottom, scrollInProgress }) => ({
        index: 'LAST',
        align: 'end',
        offset: 24,
        behavior: atBottom || scrollInProgress ? 'smooth' : 'auto',
    }),
};
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
        let sourcePath = source.replace("r2://docs/", "");

        let currentSourceNumber;
        if (sourceMap.has(sourcePath)) {
            currentSourceNumber = sourceMap.get(sourcePath);
        } else {
            currentSourceNumber = nextSourceNumber++;
            sourceMap.set(sourcePath, currentSourceNumber);
        }

        // BÍ QUYẾT LÀ ĐÂY: Dùng encodeURI để bọc đường link lại
        // Nó sẽ biến dấu cách thành %20, ngoặc thành %28, %29... giúp Markdown không bị lỗi
        return `[${currentSourceNumber}](CITATION:${encodeURI(sourcePath)})`;
    });
};

const ItemContent = ({ data: m, context }) => {
    const processedContent = m.role === "user" ? m.content : preprocessText(m.content);

    return (
        <div className="w-full py-4 flex flex-col gap-2 overflow-hidden">
            <Message role={m.role}>
                {m.role === "user" ? (
                    <div className="whitespace-pre-wrap flow-root">
                        {m.content}
                    </div>
                ) : (
                    <div className="text-zinc-800 dark:text-zinc-200 text-sm whitespace-normal break-words leading-normal">
                        <ReactMarkdown
                            urlTransform={(value) => value}

                            components={{
                                // Ép thẻ <p> chỉ cách nhau một chút xíu (mb-2)
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                // Ép danh sách <ul> và <ol> lề trái 20px (pl-5)
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                                // Xóa toàn bộ margin thừa của <li>
                                li: ({ children }) => <li className="m-0 p-0">{children}</li>,
                                a: ({ node, href, children, ...props }) => {
                                    if (href && href.startsWith("CITATION:")) {
                                        const sourcePath = decodeURI(href.replace("CITATION:", ""));
                                        return (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
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
    );
};

const listComponents = {
    Header: ({ context }) => (
        <div className="pt-6 pb-2">
            <div className="mb-2 max-w-3xl">
                <span className="block leading-[1.05] font-sans text-2xl sm:text-3xl">
                    {context.title}
                </span>
            </div>
            <div className="mb-4 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
                Updated {timeAgo(context.updatedAt)} · {context.count} messages
            </div>
            <div className="h-[40px] flex items-center justify-center">
                {context.isLoadingHistory && (
                    <span className="text-sm text-zinc-500">Loading older messages…</span>
                )}
            </div>
        </div>
    ),
    Footer: () => <div className="h-6" />,
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
    const [isForceSnapping, setIsForceSnapping] = useState(false);
    const [document, setDocument] = useState("");
    const [isOpenPDFview, SetIsOpenPDFview] = useState(false);

    const handleClosePDFView = () => {
        SetIsOpenPDFview(false)
        setDocument(null)
    }
    const {
        messages,
        fetchOlderMessages,
        hasMoreHistory,
        isLoadingHistory,
        isLoading,
        error
    } = useMessageActions(conversation?.id ?? "");

    // Only force scroll when the user actively sends a message
    const scrollModifier = useMemo(() => {
        if (isForceSnapping) return SCROLL_SNAP_BOTTOM;
        return undefined;
    }, [isForceSnapping]);

    useImperativeHandle(ref, () => ({
        insertTemplate: (content) => composerRef.current?.insertTemplate(content),
        scrollToBottom: () => {
            setIsForceSnapping(true);
            setTimeout(() => setIsForceSnapping(false), 150);
        },
    }), []);

    const handleScroll = useCallback((location) => {
        if (location.listOffset > -80 && hasMoreHistory && !isLoadingHistory && !isLoading) {
            fetchOlderMessages();
        }
    }, [hasMoreHistory, isLoadingHistory, isLoading, fetchOlderMessages]);

    const handleSend = useCallback(async (text) => {
        if (!text.trim()) return;
        setIsForceSnapping(true);

        try {
            await onSend?.(text);
        } finally {
            setTimeout(() => setIsForceSnapping(false), 150);
        }
    }, [onSend]);

    if (!conversation) return null;
    if (messages.length === 0 && isLoading) return <div className="p-4 text-center text-zinc-500">Loading messages…</div>;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-50/50">Failed to load chat.</div>;

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden relative">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {messages.length === 0 ? (
                    <EmptyChatState onPromptClick={handleSend} />
                ) : (
                    <VirtuosoMessageListLicense licenseKey={""}>
                        <VirtuosoMessageList
                            className="h-full w-full px-4 sm:px-8 lg:px-12"
                            data={{ data: messages, scrollModifier }}
                            onScroll={handleScroll}
                            initialLocation={{ index: 'LAST', align: 'end' }}

                            computeItemKey={({ data }) => data.id}

                            ItemContent={ItemContent}
                            components={listComponents}
                            context={{
                                isLoadingHistory,
                                SetIsOpenPDFview,
                                isOpenPDFview,
                                onResendMessage,
                                onPromptClick: handleSend,
                                title: conversation.title,
                                updatedAt: conversation.updatedAt,
                                count: messages.length || conversation.messageCount || 0,
                            }}
                        />
                    </VirtuosoMessageListLicense>
                )}

                <FloatingThinkingIndicator isThinking={isThinking} onPause={onPauseThinking} />
            </div>

            <Composer
                ref={composerRef}
                onSend={handleSend}
                busy={isThinking || isForceSnapping}
            />
            <PdfView
                document={"documents/Đề thi Toán học rời rạc đề số 1 kỳ 2 năm học 2022-2023 – UET/gdrive_file_3019ac94ccff46e8a1235ee1f5ac0698.pdf"}
                isOpen={isOpenPDFview}
                onClose={handleClosePDFView}
            />
        </div>
    );
});

export default ChatPane;
