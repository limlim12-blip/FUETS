import { DocumentManagementContainer } from "./course-documents-table"
import { UserSummaryCard } from "./user-summary-card"
import { useUserStore } from "@/src/stores/userStore"
import { Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export function DashboardContent() {
    const { role } = useUserStore()

    return (
        <div className="h-full overflow-hidden bg-background">
            <div className="px-4 pt-4 pb-2 lg:px-8 lg:pt-8 lg:pb-2 h-full">
                <div className="flex flex-col xl:grid xl:grid-cols-5 gap-4 xl:gap-8 h-full">
                    <div className="flex flex-col h-full min-h-0 xl:col-span-4 order-2 xl:order-1">
                        <DocumentManagementContainer />
                    </div>

                    <div className="flex flex-col xl:h-full min-h-0 xl:col-span-1 order-1 xl:order-2 shrink-0">
                        <div className="flex-none h-fit">
                            <UserSummaryCard />
                        </div>

                        {role === 'admin' && (
                            <div className="mt-4">
                                <Button className="w-full button-primary flex items-center justify-center py-6">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="font-semibold">New Document</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
