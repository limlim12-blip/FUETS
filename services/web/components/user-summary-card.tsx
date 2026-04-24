import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, FolderOpen, HardDrive } from "lucide-react"

export function UserSummaryCard() {
    return (
        <Card className="border-border bg-card shadow-theme-sm h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                        <AvatarFallback className="bg-secondary text-muted-foreground text-xs">JD</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-sm font-medium text-foreground">John Doe</CardTitle>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Documents</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">247</span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Active Projects</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-1 bg-secondary rounded-md">
                            <HardDrive className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Storage Used</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">2.4 GB</span>
                </div>
            </CardContent>
        </Card>
    )
}
