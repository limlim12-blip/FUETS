import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/src/app/providers'
import "@/src/app/globals.css"
import { Toaster } from 'sonner'
import { Inter } from "next/font/google";
import { cn } from "@/src/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'v0 App',
    description: 'Created with v0',
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={cn("font-sans", inter.variable)}>
            <body className="font-sans antialiased">
                <Providers>
                    {children}
                    {process.env.NODE_ENV === 'production' && <Analytics />}
                    <Toaster richColors closeButton position="top-right" />
                </Providers>
            </body>
        </html>
    )
}
