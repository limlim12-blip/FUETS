import { cls } from "@/src/components/utils"
import React from "react"
import { useUserActions } from '@/src/api/user/useUser';

export default function Message({ role, children }) {
    const isUser = role === "user"
    const { data } = useUserActions()

    return (
        <div
            className={cls(
                "flex w-full gap-3 my-6",
                isUser ? "justify-end flex-row" : "justify-start flex-row"
            )}
        >
            {!isUser && (
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    AI
                </div>
            )}

            <div
                className={cls(
                    "max-w-[85%] min-w-0 text-sm break-words whitespace-pre-wrap",
                    isUser
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-2xl px-4 py-2 shadow-sm"
                        : "text-zinc-900 dark:text-zinc-100 py-1"
                )}
            >
                {children}
            </div>

            {/* Avatar User */}
            {isUser && (
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    {data?.email.slice(0, 2)}
                </div>
            )}
        </div>
    )
}
