"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
            <div className="hidden lg:block">
                <Sidebar />
            </div>



            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden">
                    <MobileHeader />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    )
}
