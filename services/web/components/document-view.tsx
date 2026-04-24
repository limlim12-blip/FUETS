"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  X,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Calendar,
  User,
  Tag,
  Clock,
  Eye,
  MessageSquare,
  History,
  Settings,
  ExternalLink,
} from "lucide-react"
import type { DocumentData } from "../lib/indexeddb"

interface DocumentViewProps {
  document: DocumentData | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (document: DocumentData) => void
  onDelete?: (id: number) => void
  onShare?: (document: DocumentData) => void
}

const getFileIcon = (type: string, size: "sm" | "md" | "lg" = "md") => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const iconProps = { className: sizeClasses[size] }

  switch (type) {
    case "pdf":
    case "docx":
    case "md":
      return <FileText {...iconProps} className={`${sizeClasses[size]} text-blue-600`} />
    case "xlsx":
    case "csv":
      return <FileSpreadsheet {...iconProps} className={`${sizeClasses[size]} text-green-600`} />
    case "png":
    case "figma":
      return <ImageIcon {...iconProps} className={`${sizeClasses[size]} text-purple-600`} />
    default:
      return <FileText {...iconProps} className={`${sizeClasses[size]} text-gray-600`} />
  }
}

const mockVersionHistory = [
  {
    version: 3,
    date: "2024-01-12 14:30",
    author: "John Doe",
    changes: "Updated financial projections and added Q4 analysis",
    size: "2.4 MB",
  },
  {
    version: 2,
    date: "2024-01-10 09:15",
    author: "Jane Smith",
    changes: "Revised executive summary and methodology section",
    size: "2.2 MB",
  },
  {
    version: 1,
    date: "2024-01-08 16:45",
    author: "John Doe",
    changes: "Initial document creation",
    size: "1.8 MB",
  },
]

const mockComments = [
  {
    id: 1,
    author: "Sarah Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    date: "2 hours ago",
    comment: "Great work on the financial analysis section. The projections look realistic.",
  },
  {
    id: 2,
    author: "Mike Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    date: "1 day ago",
    comment: "Could we add more details about the market research methodology?",
  },
  {
    id: 3,
    author: "Alex Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    date: "2 days ago",
    comment: "The executive summary is well written and concise.",
  },
]

export function DocumentView({ document, isOpen, onClose, onEdit, onDelete, onShare }: DocumentViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!document) return null

  const handleEdit = () => {
    onEdit?.(document)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      onDelete?.(document.id)
      onClose()
    }
  }

  const handleShare = () => {
    onShare?.(document)
  }

  const handleDownload = () => {
    // Simulate download
    console.log("Downloading document:", document.name)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 bg-background">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="p-3 bg-secondary rounded-lg flex-shrink-0">{getFileIcon(document.type, "lg")}</div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl font-semibold text-foreground truncate">{document.name}</SheetTitle>
                  <SheetDescription className="text-muted-foreground mt-1">
                    {document.category} • {document.size} • Modified {document.lastModified}
                  </SheetDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge
                      variant={document.status === "Published" ? "default" : "secondary"}
                      className={
                        document.status === "Published"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {document.status}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{document.owner}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-4">
              <Button size="sm" className="button-primary">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 py-2 border-b border-border bg-card">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs sm:text-sm">
                    <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs sm:text-sm">
                    <History className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">History</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Comments</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full m-0">
                  <ScrollArea className="h-full px-6 py-4">
                    <div className="space-y-6">
                      {/* Document Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground">Document Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Created</p>
                                <p className="text-sm text-muted-foreground">{document.created}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Last Modified</p>
                                <p className="text-sm text-muted-foreground">{document.lastModified}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Owner</p>
                                <p className="text-sm text-muted-foreground">{document.owner}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Version</p>
                                <p className="text-sm text-muted-foreground">v{document.version || 1}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground">Tags & Categories</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Category</p>
                              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                {document.category}
                              </Badge>
                            </div>
                            {document.tags && document.tags.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                  {document.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Description/Content */}
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-3">Description</h3>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">
                            {document.content || "No description available for this document."}
                          </p>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-3">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">Document was last modified</p>
                              <p className="text-xs text-muted-foreground">{document.lastModified}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">Status changed to {document.status}</p>
                              <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="preview" className="h-full m-0">
                  <div className="h-full flex items-center justify-center bg-muted/20">
                    <div className="text-center space-y-4">
                      {getFileIcon(document.type, "lg")}
                      <div>
                        <h3 className="text-lg font-medium text-foreground">Document Preview</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Preview functionality would be implemented here
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          File type: {document.type.toUpperCase()} • Size: {document.size}
                        </p>
                      </div>
                      <Button onClick={handleDownload} className="button-primary">
                        <Download className="h-4 w-4 mr-2" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="h-full m-0">
                  <ScrollArea className="h-full px-6 py-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">Version History</h3>
                      <div className="space-y-4">
                        {mockVersionHistory.map((version) => (
                          <div key={version.version} className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline">v{version.version}</Badge>
                                <span className="text-sm font-medium text-foreground">{version.author}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">{version.size}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{version.changes}</p>
                            <p className="text-xs text-muted-foreground">{version.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="comments" className="h-full m-0">
                  <ScrollArea className="h-full px-6 py-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">Comments & Feedback</h3>
                      <div className="space-y-4">
                        {mockComments.map((comment) => (
                          <div key={comment.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                  {comment.author
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
