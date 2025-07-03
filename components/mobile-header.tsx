"use client"

import { useAuth } from "@/hooks/use-auth"
import { Menu, Bell, Search, GraduationCap, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"


export default function MobileHeader() {
    const { user } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success("Logged out successfully")
            router.push("/")
        } catch (error) {
            console.error("Logout error", error)
        }
    }

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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-8 h-8 rounded-full flex items-center justify-center">
                                <Avatar className="flex-shrink-0">
                                    <AvatarImage src={user?.avatar || '/'} />
                                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-red-400 text-white">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="gap-4">
                            <DropdownMenuItem>
                                <ThemeToggle />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    )
}
