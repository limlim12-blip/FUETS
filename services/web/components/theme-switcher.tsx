"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Sparkles, Palette } from "lucide-react"
import { useTheme } from "../contexts/theme-context"

const themeIcons = {
  light: Sun,
  dark: Moon,
  fancy: Sparkles,
}

const themeLabels = {
  light: "Light",
  dark: "Dark",
  fancy: "Fancy",
}

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const CurrentIcon = themeIcons[theme]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <div className="flex items-center gap-2 p-2 text-sm font-medium text-muted-foreground">
          <Palette className="h-4 w-4" />
          Choose Theme
        </div>
        {themes.map((themeName) => {
          const Icon = themeIcons[themeName]
          return (
            <DropdownMenuItem
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`flex items-center gap-2 ${
                theme === themeName ? "bg-secondary text-secondary-foreground" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {themeLabels[themeName]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
