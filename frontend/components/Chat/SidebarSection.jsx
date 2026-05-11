import React from "react";
import { ChevronDown } from "lucide-react";

export default function SidebarSection({ icon, title, children, collapsed, onToggle }) {
    return (
        <section className="relative z-10 flex w-full flex-col transition-colors hover:z-50 focus-within:z-50">

            <button
                onClick={onToggle}
                className="group sticky top-0 z-20 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-950/50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
                <span
                    className="flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                        transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        willChange: "transform"
                    }}
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </span>

                <span className="flex items-center gap-2">
                    <span className="opacity-70 transition-opacity group-hover:opacity-100">{icon}</span>
                    {title}
                </span>
            </button>

            <div
                className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                    gridTemplateRows: collapsed ? "0fr" : "1fr",
                    opacity: collapsed ? 0 : 1,
                    visibility: collapsed ? "hidden" : "visible",
                    marginTop: collapsed ? "0px" : "4px"
                }}
            >
                <div className={`min-h-0 ${collapsed ? "overflow-hidden" : "overflow-visible"}`}>
                    <div className="space-y-0.5 px-1 pb-4">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
