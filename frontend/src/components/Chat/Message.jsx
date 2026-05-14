import { cls } from "@/src/components/utils"

export default function Message({ role, children }) {
    const isUser = role === "user"
    if (!isUser) {
        return (
            <div className={cls("flex gap-3 max-w-3xl", isUser ? "justify-end ml-auto" : "justify-start")}>
                <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                    AI
                </div>
                <div
                    className={cls(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
                    )}
                >
                    {children}
                </div>
            </div >
            //TODO: ADD REFERENCES
        )
    }
    return (
        <div className={cls("flex gap-3 max-w-3xl", isUser ? "justify-end ml-auto" : "justify-start")}>
            <div
                className={cls(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                )}
            >
                {children}
            </div>
            <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                JD
            </div>
        </div>
    )
}
