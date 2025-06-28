"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Menu, Bell, Search, GraduationCap, Loader2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { UserProfile } from "@/lib/firebase-admin"
import { profileService } from "@/lib/firebase-admin"
import { toast } from "sonner"

export default function MobileHeader() {
    const { user, userRole } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadProfile = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            let userProfile = await profileService.getUserProfile(user.uid)

            // Create profile if it doesn't exist
            if (!userProfile) {
                const newProfile: UserProfile = {
                    id: user.uid,
                    name: user.name || user.email?.split("@")[0] || "User",
                    email: user.email || "",
                    role: userRole as "student" | "teacher" | "admin",
                    joined_at: new Date() as any,
                }

                await profileService.createUserProfile(newProfile)
                userProfile = newProfile
            }

            setProfile(userProfile)

        } catch {
            setError("Failed to load profile. Please try again.")
            toast.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    useEffect(() => {
        loadProfile()
    }, [user, userRole])

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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <Avatar className="flex-shrink-0">
                            <AvatarImage src={profile?.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-pink-400 to-red-400 text-white">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </nav>
        </header>
    )
}
