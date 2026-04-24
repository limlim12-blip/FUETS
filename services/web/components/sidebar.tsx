"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Bell, BarChart3, Upload, ChevronLeft, Settings, Menu, ChevronRight } from "lucide-react"

interface SidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "notifications", icon: Bell, label: "Notifications" },
]

function SidebarContent({
    activeTab,
    onTabChange,
    isCollapsed,
    setIsCollapsed,
    isMobile = false,
}: {
    activeTab: string
    onTabChange: (tab: string) => void
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    isMobile?: boolean
}) {
    return (
        <div
            className={`bg-card transition-all duration-200 ${isMobile ? "w-full" : isCollapsed ? "w-16" : "w-64"} flex flex-col h-full border-r border-border`}
        >
            {/* Header */}
            <div className="p-4 lg:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 lg:w-4 lg:h-4 text-white">
                            <path
                                fill="currentColor"
                                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                            />
                        </svg>
                    </div>
                    {(!isCollapsed || isMobile) && <span className="font-medium text-foreground text-sm">DocuFlow</span>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 lg:px-3">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <TooltipProvider key={item.id}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start h-10 lg:h-9 ${isCollapsed && !isMobile ? "px-2" : "px-3"} ${activeTab === item.id
                                            ? "bg-secondary text-secondary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                            }`}
                                        onClick={() => onTabChange(item.id)}
                                    >
                                        <item.icon className="h-4 w-4 lg:h-4 lg:w-4 flex-shrink-0" />
                                        {(!isCollapsed || isMobile) && <span className="ml-3 text-sm font-normal">{item.label}</span>}
                                    </Button>
                                </TooltipTrigger>
                                {isCollapsed && !isMobile && (
                                    <TooltipContent side="right" className="bg-popover text-popover-foreground text-xs">
                                        <p>{item.label}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-2 lg:p-3 space-y-2">
                {/* Settings Button */}
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start h-10 lg:h-9 ${isCollapsed && !isMobile ? "px-2" : "px-3"} ${activeTab === "settings"
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    }`}
                                onClick={() => onTabChange("settings")}
                            >
                                <Settings className="h-4 w-4 flex-shrink-0" />
                                {(!isCollapsed || isMobile) && <span className="ml-3 text-sm font-normal">Settings</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && !isMobile && (
                            <TooltipContent side="right" className="bg-popover text-popover-foreground text-xs">
                                <p>Settings</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                {/* Upload Button */}
            </div>
        </div>
    )
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="fixed top-3 left-4 z-50 h-9 w-9 bg-card border border-border shadow-lg lg:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent
                            activeTab={activeTab}
                            onTabChange={(tab) => {
                                onTabChange(tab)
                                setIsMobileOpen(false)
                            }}
                            isCollapsed={false}
                            setIsCollapsed={() => { }}
                            isMobile={true}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative">
                <SidebarContent
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />

                {/* Collapse/Expand Buttons */}
                {isCollapsed && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsCollapsed(false)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 h-12 w-6 bg-card hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border shadow-sm transition-all duration-200 rounded-r-md rounded-l-none p-0 flex items-center justify-center"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                )}

                {!isCollapsed && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsCollapsed(true)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 h-12 w-6 bg-card hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border shadow-sm transition-all duration-200 rounded-r-md rounded-l-none p-0 flex items-center justify-center"
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </>
    )
}
