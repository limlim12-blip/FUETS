import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { AuthForm } from "./auth-form"
import { SignUpForm } from "./signup-form"

export function AuthBasic() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-[450px]">
                <div className="w-full h-48 relative mb-4">
                    <Image
                        src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/to-the-moon-u5UJD9sRK8WkmaTY8HdEsNKjAQ9bjN.svg"
                        alt="To the moon illustration"
                        fill
                        className="object-cover"
                    />
                </div>
                <Card className="w-full border-0 shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-neutral-600 dark:text-neutral-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader> <CardContent className="space-y-6">
                        <AuthForm />

                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-1 text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Don't have an account?
                            </span>
                            <Link
                                href="/signup"
                                className="font-medium text-black-600 hover:underline dark:text-black-400"
                            >
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export function SignUpBasic() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-[450px]">
                <div className="w-full h-48 relative mb-4">
                    <Image
                        src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/to-the-moon-u5UJD9sRK8WkmaTY8HdEsNKjAQ9bjN.svg"
                        alt="To the moon illustration"
                        fill
                        className="object-cover"
                    />
                </div>
                <Card className="w-full border-0 shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-neutral-600 dark:text-neutral-400">
                            Enter your details below to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SignUpForm />

                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-1 text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Already have an account?
                            </span>
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
