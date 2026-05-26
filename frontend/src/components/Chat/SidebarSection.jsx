import React from "react";
import { ChevronDown } from "lucide-react";


export default function SidebarSection({ icon, title, children, collapsed, onToggle }) {
    return (
        <section className="relative flex w-full flex-col transition-colors">
            <button
                onClick={onToggle}
                className="sticky top-0 z-10 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wider bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
                <span
                    className="flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0"
                    style={{
                        transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        willChange: "transform"
                    }}
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </span>

                <span className="flex items-center gap-2 min-w-0 flex-1 text-left">
                    <span className="opacity-100 shrink-0">{icon}</span>
                    <span className="truncate" title={title}>
                        {title}
                    </span>
                </span>
            </button>

            <div
                className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                    gridTemplateRows: collapsed ? "0fr" : "1fr",
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
