"use client"

import { useAuth } from "@/hooks/use-auth"
import { Menu, Bell, Search } from "lucide-react"

interface MobileHeaderProps {
    onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    const { user } = useAuth()

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">EduHub</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
