"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus } from "lucide-react"
import { DocumentsTableRedux } from "./documents-table-redux"

const viewTabs = [
    { id: "kanban", label: "Kanban" },
    { id: "timeline", label: "Timeline" },
    { id: "list", label: "List" },
]

export function DocumentsView() {
    const [activeTab, setActiveTab] = useState("list")
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="p-4 lg:p-8">
                {/* Navigation Tabs */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-6 lg:space-x-8 overflow-x-auto">
                        {viewTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full sm:w-48 lg:w-64 bg-input border-border"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1 sm:flex-none bg-card border-border text-foreground">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                {activeTab === "list" && (
                    <div className="space-y-4">
                        <DocumentsTableRedux />
                    </div>
                )}

                {/* Placeholder for other views */}
                {activeTab !== "list" && (
                    <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {viewTabs.find((t) => t.id === activeTab)?.label} View
                            </h3>
                            <p className="text-muted-foreground">This view is coming soon...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
