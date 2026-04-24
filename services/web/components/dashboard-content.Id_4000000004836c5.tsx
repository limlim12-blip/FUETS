import { DocumentsTableRedux } from "./documents-table-redux"
import { UserSummaryCard } from "./user-summary-card"
import { useUserStore } from "@/stores/users-store"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"



export function DashboardContent() {
    const { role } = useUserStore()

    return (
        <div className="h-full overflow-hidden bg-background">
            <div className="p-4 lg:p-8 h-full">
                {role === 'admin' ? (
                    <div className="h-full">
                        <div className="hidden xl:grid xl:grid-cols-5 xl:gap-8 h-full">
                            <div className="flex flex-col h-full min-h-0 xl:col-span-4">
                                <DocumentsTableRedux />
                            </div>

                            <div className="flex flex-col h-full min-h-0 xl:col-span-1">
                                <div className="flex-none h-fit">
                                    <UserSummaryCard />
                                </div>

                                <div className="mt-4">
                                    <Button className="w-full button-primary flex items-center justify-center py-6">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="font-semibold">New Document</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full">
                        <div className="hidden xl:grid xl:grid-cols-5 xl:gap-8 h-full">
                            <div className="flex flex-col h-full min-h-0 xl:col-span-4">
                                <DocumentsTableRedux />
                            </div>
                            <div className="flex flex-col h-full min-h-0 xl:col-span-1">
                                <div className="flex-none h-fit">
                                    <UserSummaryCard />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
