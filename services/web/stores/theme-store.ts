import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

type Theme = "light" | "dark" | "fancy"

interface ThemeState {
    theme: Theme
    themes: Theme[]
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
    devtools(
        persist(
            (set) => ({
                theme: "light",
                themes: ["light", "dark", "fancy"],
                setTheme: (theme) => {
                    set({ theme })

                    // Apply theme to document
                    document.documentElement.setAttribute("data-theme", theme)

                    // Add transition for smooth theme switching
                    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease"

                    // Dispatch custom event for theme change
                    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme } }))

                    // Clean up transition after animation
                    setTimeout(() => {
                        document.documentElement.style.transition = ""
                    }, 300)

                    console.log(`Theme changed to: ${theme}`)
                },
            }),
            {
                name: "docuflow-theme",
                partialize: (state) => ({ theme: state.theme }),
            },
        ),
        {
            name: "theme-store",
        },
    ),
)
