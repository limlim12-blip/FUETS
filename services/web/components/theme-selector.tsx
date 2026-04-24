"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Sparkles, Check } from "lucide-react"
import { useTheme } from "../contexts/theme-context"

const themeOptions = [
  {
    id: "light",
    name: "Light",
    description: "Clean and minimal light theme",
    icon: Sun,
    preview: "bg-white border-gray-200",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Professional dark theme",
    icon: Moon,
    preview: "bg-slate-900 border-slate-700",
  },
  {
    id: "fancy",
    name: "Fancy",
    description: "Vibrant gradients and glass effects",
    icon: Sparkles,
    preview: "bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400",
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as "light" | "dark" | "fancy")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Theme Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">Choose your preferred theme for the application</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = theme === option.id

          return (
            <div
              key={option.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-secondary/50 shadow-theme-sm"
                  : "border-border hover:border-primary/50 hover:bg-secondary/25"
              }`}
              onClick={() => handleThemeChange(option.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-8 rounded border-2 ${option.preview} shadow-sm`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-foreground" />
                    <h3 className="font-medium text-foreground">{option.name}</h3>
                    {isSelected && (
                      <div className="ml-auto flex items-center space-x-1">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary font-medium">Active</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />}
            </div>
          )
        })}

        {/* Current theme indicator */}
        <div className="mt-6 p-3 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm text-foreground font-medium">
              Current theme: <span className="capitalize">{theme}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Theme changes are applied instantly across the entire application
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
