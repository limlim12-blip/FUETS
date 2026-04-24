"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex items-center space-x-2 lg:space-x-3 flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 lg:pl-10 h-8 lg:h-9 bg-input border-border text-sm placeholder:text-muted-foreground focus:bg-card input"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:h-9 lg:w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 flex-shrink-0"
      >
        <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Button>
    </div>
  )
}
