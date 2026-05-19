
"use client"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Loader2, LockIcon, AlertCircle } from "lucide-react"
import { useAuthActions } from "@/src/api/login/useLogin"
import { toast } from 'sonner'

export function SignUpForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setError] = useState(false)
    const router = useRouter()

    const { handleRegister } = useAuthActions()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(false)

        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            await handleRegister({ email: email, password: password })
            toast.success("Welcome aboard!", {
                description: "Your account is ready. Redirecting to login...",
                icon: "🎉",
            })
            router.push("/login")
        } catch (error) {
            console.error("Authentication error:", error)
            toast.error("Sign up failed", {
                description: "Please check your details and try again."
            })
            setError(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-black dark:text-white">
                    Email
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center w-4 h-4">
                        @
                    </span>
                    <Input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                        disabled={isLoading}
                        className={`pl-10 h-12 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring ${isError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-black dark:text-white">Password</label>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        className={`pl-10 h-12 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring ${isError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                </div>
            </div>
            {isError && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Invalid email or password. Please try again.</span>
                </div>
            )}
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing up..." : "Sign up"}
            </Button>
        </form>
    )
}
