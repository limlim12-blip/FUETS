import { Card, CardContent } from "@/src/components/ui/card"
import { FileText, FolderOpen, HardDrive } from "lucide-react"
import { useStorageActions } from "@/src/api/storage/useStorage"
import { useCourseActions } from "@/src/api/courses/useCoures"
import { useDocumentFileActions } from "@/src/api/documents/useDocumentFiles"
export function UserSummaryCard() {
    const { BucketUsage } = useStorageActions()
    const { Courses } = useCourseActions({ limit: 9999 }) || undefined
    const course_count = Courses.length
    const {
        totalCount: obj_count,
    } = useDocumentFileActions()
    // const obj_count = BucketUsage.data?.result["objectCount"] || "undefined"
    const size = (BucketUsage.data?.result["payloadSize"] / (1024 * 1024 * 1024)).toFixed(2) || "undefined"

    return (
        <Card className="border-border bg-card shadow-theme-sm h-full flex flex-col">
            <div className="px-6 pb-4 pt-2 border-t border-border/50">
            </div>

            <CardContent className="space-y-3 pt-4 flex-1">
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Document files</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{obj_count}</span>
                </div>

                {/* Active Courses */}
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Active courses</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{course_count}</span>
                </div>

                {/* Storage Used */}
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <HardDrive className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Storage Used</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{size} GB</span>
                </div>
            </CardContent>
        </Card>
    )
}
