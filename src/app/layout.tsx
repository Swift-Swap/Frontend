import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Nav from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import React from 'react'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SwiftSwap',
    description: 'SwiftSwap',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <main className="w-screen h-screen bg-background max-w-full overflow-x-hidden flex flex-col">
                        <Nav />
                        {children}
                        <Toaster />
                    </main>
                </Providers>
            </body>
        </html>
    )
}
