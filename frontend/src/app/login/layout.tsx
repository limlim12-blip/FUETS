import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: 'Login',
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
        <div className="font-sans antialiased">
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
        </div>
    )
}
