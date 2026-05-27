"use client"
import SettingsPopover from "@/src/components/SettingsPopover"

import Link from "next/link"
import { useState, useEffect } from "react"
import { LoadingScreen } from "@/src/components/Dashboard/loading-screen"
import { DashboardContent } from "@/src/components/Dashboard/dashboard-content"
import { BarChart3, FileText, AngryIcon, SquareDashedKanban } from "lucide-react"
import { useUserActions } from "@/src/api/user/useUser"

const getViewInfo = (activeTab: string) => {
    switch (activeTab) {
        case "dashboard":
            return { title: "Dashboard", icon: BarChart3 }
        case "documents":
            return { title: "Documents", icon: FileText }
        default:
            return { title: "Dashboard", icon: BarChart3 }
    }
}

function AdminDashboardContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("dashboard")
    const { data } = useUserActions()

    const name = data?.email.split("@")[0];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <LoadingScreen />
    }

    const viewInfo = getViewInfo(activeTab)
    const Icon = viewInfo.icon
    return (
        <div className="flex h-screen bg-background overflow-hidden">

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-card border-b border-border px-4 lg:px-8 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center space-x-4 pl-12 lg:pl-0">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-md flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl lg:text-2xl font-medium text-foreground">
                                {viewInfo.title}
                            </h1>
                            <Link
                                href="/chat"
                                className="flex items-center gap-2.5 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:bg-zinc-900 dark:text-white"
                            >
                                <AngryIcon className="h-4 w-4" />
                                Chat
                            </Link>
                            <Link
                                href="/review"
                                className="flex items-center gap-2.5 rounded-full bg-gradient-to-b from-white to-zinc-50 px-5 py-2 text-sm font-semibold text-zinc-900 border border-zinc-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:from-zinc-900 dark:to-zinc-950 dark:text-white dark:border-zinc-800"
                            >
                                Reviews
                                <SquareDashedKanban className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                            </Link>

                        </div>

                        <div className="flex items-center">
                            <SettingsPopover>
                                <button className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                                            {data?.email.slice(0, 2)}
                                        </div>
                                        <div className="hidden sm:block min-w-0 text-left">
                                            <div className="truncate text-sm font-semibold">{name}</div>
                                            <div className="truncate text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400">
                                                Document space
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </SettingsPopover>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-hidden">
                    {activeTab === "dashboard" && <DashboardContent />}
                    {activeTab === "documents" && <DashboardContent />}
                    {/* {activeTab === "settings" && <SettingsContent />} */}
                </main>
            </div>
        </div >
    )
}

export default function AdminDashboard() {
    return (
        <AdminDashboardContent />
    )
}
