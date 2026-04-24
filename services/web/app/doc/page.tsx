"use client"
import SettingsPopover from "@/components/SettingsPopover"


import Link from "next/link"
import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { DashboardContent } from "@/components/dashboard-content"
import { SettingsContent } from "@/components/settings-content"
import { ThemeProvider } from "@/contexts/theme-context"
import { BarChart3, FileText, Bell, Settings, AngryIcon } from "lucide-react"
import { useUserStore } from "@/stores/users-store"

const getViewInfo = (activeTab: string) => {
    switch (activeTab) {
        case "dashboard":
            return { title: "Dashboard", icon: BarChart3 }
        case "documents":
            return { title: "Documents", icon: FileText }
        case "settings":
            return { title: "Settings", icon: Settings }
        default:
            return { title: "Dashboard", icon: BarChart3 }
    }
}

function AdminDashboardContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("dashboard")
    const { role, setRole } = useUserStore()

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

                        {/* 1. CỤM BÊN TRÁI: Icon + Title + Chat Button */}
                        <div className="flex items-center space-x-4 pl-12 lg:pl-0">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-md flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary-foreground" />
                            </div>
                            <h1 className="text-xl lg:text-2xl font-medium text-foreground">
                                {viewInfo.title}
                            </h1>
                            <Link
                                href="/"
                                className="flex items-center gap-2.5 rounded-full bg-[#f8bc78] px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-[#f8bc78]/30 transition-all hover:bg-[#f6a94d] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8bc78] dark:text-zinc-950"
                            >
                                <AngryIcon className="h-4 w-4" />
                                Chat
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="text-xs bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 border-none outline-none"
                            >
                                <option value="student">REMEMBER TO DELETE THIS</option>
                                <option value="admin">Admin View</option>
                            </select>
                            <SettingsPopover>...</SettingsPopover>
                        </div>

                        <div className="flex items-center">
                            <SettingsPopover>
                                <button className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                                            JD
                                        </div>
                                        <div className="hidden sm:block min-w-0 text-left">
                                            <div className="truncate text-sm font-semibold">John Doe</div>
                                            <div className="truncate text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                Pro workspace
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
                    {activeTab === "settings" && <SettingsContent />}
                </main>
            </div>
        </div >
    )
}

export default function AdminDashboard() {
    return (
        <ThemeProvider>
            <AdminDashboardContent />
        </ThemeProvider>
    )
}
