import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/src/app/providers'
import "@/src/app/globals.css"
import { Toaster } from 'sonner'
import { Inter } from "next/font/google";
import { cn } from "@/src/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'FUET',
    description: 'FUET',
    icons: {
        icon: '/original-839a9a2a679b62ec44f80405f24cca70.webp',
        apple: '/original-839a9a2a679b62ec44f80405f24cca70.webp',
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
