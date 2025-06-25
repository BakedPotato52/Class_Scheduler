"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    BookOpen,
    Users,
    Calendar,
    Bell,
    Settings,
    GraduationCap,
    UserCheck,
    Shield,
    LogOut,
    X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"

const navigation = [
    { name: "Student Dashboard", href: "/student", icon: GraduationCap, roles: ["student"] },
    { name: "Teacher Dashboard", href: "/teacher", icon: UserCheck, roles: ["teacher"] },
    { name: "Admin Dashboard", href: "/admin", icon: Shield, roles: ["admin"] },
    { name: "Overview", href: "/overview", icon: Home, roles: ["student", "teacher", "admin"] },
    { name: "Classes", href: "/classes", icon: BookOpen, roles: ["student", "teacher", "admin"] },
    { name: "Schedule", href: "/schedule", icon: Calendar, roles: ["student", "teacher", "admin"] },
    { name: "Students", href: "/students", icon: Users, roles: ["teacher", "admin"] },
    { name: "Notifications", href: "/notifications", icon: Bell, roles: ["student", "teacher", "admin"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["student", "teacher", "admin"] },
]

interface SidebarProps {
    onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname()
    const { user, userRole } = useAuth()
    const Router = useRouter()

    const filteredNavigation = navigation.filter((item) => userRole && item.roles.includes(userRole))

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success("Successfully logged out")
            Router.push("/")
        } catch (error) {
            toast.error("Failed to logout")
        }
    }

    return (
        <div className="w-64 bg-white shadow-lg rounded-r-3xl m-4 mr-0 flex flex-col h-[calc(100vh-2rem)]">
            {/* Mobile Close Button */}
            {onClose && (
                <div className="flex justify-end p-4 lg:hidden">
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            )}

            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-800">ClassEs</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile and Logout */}
            <div className="p-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{user?.name?.split("@")[0]}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
