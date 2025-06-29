"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import MobileHeader from "@/components/mobile-header"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Desktop Sidebar */}
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-md"></div>}>
                <Sidebar />
            </Suspense>




            {/* Main Content */}
            <main className="w-full max-sm:w-full bg-background overflow-scroll-y flex flex-col">
                {/* Mobile Header */}
                <MobileHeader />
                <div className="max-w-7xl mx-auto dark:text-white">{children}</div>
            </main>
        </div>
    )
}
