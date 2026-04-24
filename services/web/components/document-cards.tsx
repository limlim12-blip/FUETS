import { Card, CardContent } from "@/components/ui/card"
import { FileText, ImageIcon, FileSpreadsheet, Presentation } from "lucide-react"

const recentUploads = [
  { id: 1, name: "Project Brief.pdf", type: "pdf", uploadDate: "Today" },
  { id: 2, name: "Logo Design.png", type: "image", uploadDate: "Yesterday" },
  { id: 3, name: "Budget.xlsx", type: "spreadsheet", uploadDate: "2 days ago" },
  { id: 4, name: "Presentation.pptx", type: "presentation", uploadDate: "3 days ago" },
  { id: 5, name: "Contract.pdf", type: "pdf", uploadDate: "1 week ago" },
  { id: 6, name: "Mockup.png", type: "image", uploadDate: "1 week ago" },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-6 w-6 text-muted-foreground" />
    case "image":
      return <ImageIcon className="h-6 w-6 text-muted-foreground" />
    case "spreadsheet":
      return <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
    case "presentation":
      return <Presentation className="h-6 w-6 text-muted-foreground" />
    default:
      return <FileText className="h-6 w-6 text-muted-foreground" />
  }
}

export function DocumentCards() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Recent Uploads</h3>
        <div className="grid grid-cols-2 gap-3">
          {recentUploads.map((doc) => (
            <Card key={doc.id} className="hover:shadow-theme-md transition-all cursor-pointer border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary rounded-md">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{doc.uploadDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
