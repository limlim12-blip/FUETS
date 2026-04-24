import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Package } from "lucide-react"

export function AboutSection() {
  const appInfo = {
    name: "DocuFlow",
    version: "2.1.0",
    releaseDate: "January 2025",
    team: "LASS",
    description: "A modern document management system built for productivity and collaboration.",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">About DocuFlow</CardTitle>
        <p className="text-sm text-muted-foreground">{appInfo.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* App Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary rounded-md">
                <Package className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Application Name</p>
                <p className="text-xs text-muted-foreground">Product identifier</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono">
              {appInfo.name}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary rounded-md">
                <Package className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Version</p>
                <p className="text-xs text-muted-foreground">Current release version</p>
              </div>
            </div>
            <Badge variant="default" className="font-mono">
              v{appInfo.version}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary rounded-md">
                <Calendar className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Release Date</p>
                <p className="text-xs text-muted-foreground">Latest version release</p>
              </div>
            </div>
            <Badge variant="outline">{appInfo.releaseDate}</Badge>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary rounded-md">
                <Users className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Development Team</p>
                <p className="text-xs text-muted-foreground">Created and maintained by</p>
              </div>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {appInfo.team}
            </Badge>
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-4 border-t border-border">
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">System Information</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Build:</span>
                <span className="ml-2 font-mono text-foreground">2025.01.12</span>
              </div>
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <span className="ml-2 font-mono text-foreground">Production</span>
              </div>
              <div>
                <span className="text-muted-foreground">Platform:</span>
                <span className="ml-2 font-mono text-foreground">Web</span>
              </div>
              <div>
                <span className="text-muted-foreground">License:</span>
                <span className="ml-2 font-mono text-foreground">MIT</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
