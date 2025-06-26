"use client"

import { useAuth } from "@/hooks/use-auth"
import { Menu, Bell, Search, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function MobileHeader() {
    const { user } = useAuth()

    return (
        <header className="sticky md:hidden top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

            <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex-1 max-w-md ">
                    <Link href="/" className="flex items-center gap-2 ">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xl bg-clip-text text-transparent">
                            ClassEs
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            </nav>
        </header>
    )
}
