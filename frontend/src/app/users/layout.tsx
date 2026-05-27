import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'USERS',
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
        </div>
    )
}
