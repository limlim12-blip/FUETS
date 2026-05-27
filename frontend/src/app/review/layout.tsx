import type { Metadata } from 'next'

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
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
