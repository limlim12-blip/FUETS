"use client"

import { VirtualizedTable } from "./virtualized-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar } from "lucide-react"

const documentTasks = [
  {
    id: 1,
    name: "Employee Onboarding Document",
    description: "Information about employees",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Document",
    typeColor: "bg-blue-100 text-blue-800",
    assignees: [
      { name: "John Doe", avatar: "/placeholder.svg?height=24&width=24", initials: "JD" },
      { name: "Jane Smith", avatar: "/placeholder.svg?height=24&width=24", initials: "JS" },
    ],
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-800",
    status: "To-do",
  },
  {
    id: 2,
    name: "Business Cards",
    description: "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Design",
    typeColor: "bg-purple-100 text-purple-800",
    assignees: [{ name: "Mike Johnson", avatar: "/placeholder.svg?height=24&width=24", initials: "MJ" }],
    priority: "High",
    priorityColor: "bg-red-100 text-red-800",
    status: "To-do",
  },
  {
    id: 3,
    name: "Can I make request for all screens",
    description: "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Wireframe",
    typeColor: "bg-green-100 text-green-800",
    assignees: [
      { name: "Sarah Wilson", avatar: "/placeholder.svg?height=24&width=24", initials: "SW" },
      { name: "Alex Chen", avatar: "/placeholder.svg?height=24&width=24", initials: "AC" },
    ],
    priority: "Low",
    priorityColor: "bg-gray-100 text-gray-800",
    status: "To-do",
  },
  {
    id: 4,
    name: "Sport Admin help",
    description: "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Document",
    typeColor: "bg-blue-100 text-blue-800",
    assignees: [{ name: "Tom Brown", avatar: "/placeholder.svg?height=24&width=24", initials: "TB" }],
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-800",
    status: "To-do",
  },
  {
    id: 5,
    name: "Task Name",
    description: "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Video Ads",
    typeColor: "bg-orange-100 text-orange-800",
    assignees: [{ name: "Lisa Davis", avatar: "/placeholder.svg?height=24&width=24", initials: "LD" }],
    priority: "High",
    priorityColor: "bg-red-100 text-red-800",
    status: "In Progress",
  },
  {
    id: 6,
    name: "Sport Admin help",
    description: "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: "Public Ads",
    typeColor: "bg-pink-100 text-pink-800",
    assignees: [
      { name: "Chris Lee", avatar: "/placeholder.svg?height=24&width=24", initials: "CL" },
      { name: "Emma White", avatar: "/placeholder.svg?height=24&width=24", initials: "EW" },
    ],
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-800",
    status: "In Progress",
  },
  // Add more sample data
  ...Array.from({ length: 30 }, (_, i) => ({
    id: i + 7,
    name: `Task ${i + 7}`,
    description: Math.random() > 0.5 ? "Sample description" : "-",
    estimate: "Feb 14, 2024 - Feb 1, 2024",
    type: ["Document", "Design", "Wireframe", "Video Ads", "Public Ads"][i % 5],
    typeColor: [
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800",
      "bg-green-100 text-green-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ][i % 5],
    assignees: [{ name: "User " + (i + 1), avatar: "/placeholder.svg?height=24&width=24", initials: "U" + (i + 1) }],
    priority: ["High", "Medium", "Low"][i % 3],
    priorityColor: ["bg-red-100 text-red-800", "bg-yellow-100 text-yellow-800", "bg-gray-100 text-gray-800"][i % 3],
    status: ["To-do", "In Progress", "In Review"][i % 3],
  })),
]

export function DocumentsViewTable() {
  const columns = [
    {
      key: "name",
      title: "Task Name",
      width: 250,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-foreground text-sm">{value}</div>
          {row.description !== "-" && <div className="text-xs text-muted-foreground mt-1">{row.description}</div>}
        </div>
      ),
    },
    {
      key: "estimate",
      title: "Estimates",
      width: 200,
      render: (value: string) => (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
      width: 120,
      render: (value: string, row: any) => <Badge className={`text-xs ${row.typeColor}`}>{value}</Badge>,
    },
    {
      key: "assignees",
      title: "People",
      width: 150,
      render: (value: any[]) => (
        <div className="flex items-center space-x-1">
          {value.map((assignee: any, index: number) => (
            <Avatar key={index} className="h-6 w-6 border border-background">
              <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      width: 120,
      render: (value: string, row: any) => <Badge className={`text-xs ${row.priorityColor}`}>{value}</Badge>,
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: 80,
      align: "center" as const,
      render: (value: any, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem className="text-sm text-foreground hover:bg-secondary/50">Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-foreground hover:bg-secondary/50">Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-foreground hover:bg-secondary/50">Move to</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-destructive hover:bg-destructive/10">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const handleRowClick = (row: any) => {
    console.log("Task clicked:", row)
  }

  return (
    <VirtualizedTable
      data={documentTasks}
      columns={columns}
      pageSize={12}
      searchable={true}
      onRowClick={handleRowClick}
      className="shadow-theme-sm"
    />
  )
}
