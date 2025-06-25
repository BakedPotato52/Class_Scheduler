"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { getFilteredMenuItems, type UserRole } from "@/lib/menu-items"
import { type LucideIcon, MoreHorizontal, LogOut, GraduationCap, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ResponsiveSidebarProps {
    className?: string
}

export default function Sidebar({ className }: ResponsiveSidebarProps) {
    const [open, setOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { user, userRole } = useAuth()
    const Router = useRouter()

    useEffect(() => {
        // Close mobile menu when path changes
        setIsMobileMenuOpen(false)
    }, [pathname])

    if (!user) {
        return null
    }

    const role = userRole as UserRole
    const menuItems = getFilteredMenuItems(role)
    const visibleItems = menuItems.flatMap((section) => section.items.filter((item) => item.visible.includes(role)))

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success("Successfully logged out")
            Router.push("/")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const renderMenuItem = (item: (typeof visibleItems)[0], index: number, isMobile = false) => {
        const IconComponent = item.icon as LucideIcon
        const isActive = pathname === item.href

        return (
            <li key={item.label} className={index >= 4 && !isMobile ? "lg:hidden" : ""}>
                <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    aria-label={item.label}
                    onClick={() => {
                        setOpen(false)
                        setIsMobileMenuOpen(false)
                    }}
                >
                    <IconComponent className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium truncate">{item.label}</span>
                </Link>
            </li>
        )
    }

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 shadow-sm">
                <div className="flex items-center justify-between h-full px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xl bg-clip-text text-transparent">
                            EduHub
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                                {user.email?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r z-20 transform transition-transform duration-200 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-4 overflow-y-auto h-full">
                    <nav aria-label="Mobile Navigation">
                        {menuItems.map((section) => (
                            <div key={section.title} className="mb-6">
                                <h2 className="text-sm font-semibold text-gray-500 mb-2 px-4">{section.title}</h2>
                                <ul className="space-y-1">
                                    {section.items
                                        .filter((item) => item.visible.includes(role))
                                        .map((item, index) => renderMenuItem(item, index, true))}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Mobile User Section */}
                    <div className="mt-auto pt-4 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {user.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{user.email?.split("@")[0]}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-gray-600 hover:text-gray-900"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden sticky top-0 md:flex flex-col w-64 h-screen bg-white border-r shadow-sm">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2 mb-8" aria-label="EduHub Home">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xl bg-clip-text text-transparent">
                                EduHub
                            </span>
                        </Link>

                        <nav aria-label="Main Navigation" className="overflow-y-auto">
                            {menuItems.map((section) => (
                                <div key={section.title} className="mb-6">
                                    <h2 className="text-sm font-semibold text-gray-500 mb-2 px-4">{section.title}</h2>
                                    <ul className="space-y-1">
                                        {section.items
                                            .filter((item) => item.visible.includes(role))
                                            .map((item, index) => renderMenuItem(item, index))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Desktop User Section */}
                    <div className="mt-auto p-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src="/placeholder.svg" alt={user.email || ""} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {user.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{user.email?.split("@")[0]}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-gray-600 hover:text-gray-900"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-20 shadow-lg"
                aria-label="Mobile Bottom Navigation"
            >
                <ul className="flex justify-around items-center h-16">
                    {visibleItems.slice(0, 4).map((item, index) => {
                        const IconComponent = item.icon as LucideIcon
                        const isActive = pathname === item.href
                        return (
                            <li key={item.label} className="flex-1">
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center h-full transition-colors ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    aria-label={item.label}
                                >
                                    <IconComponent className="h-5 w-5" />
                                    <span className="text-xs mt-1 max-w-[90%] truncate">{item.label.split(" ")[0]}</span>
                                </Link>
                            </li>
                        )
                    })}
                    {visibleItems.length > 4 && (
                        <li className="flex-1">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        aria-label="More options"
                                        className="h-full w-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                        <span className="text-xs mt-1">More</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[70vh] pt-10">
                                    <nav aria-label="More Navigation Options">
                                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {visibleItems.slice(4).map((item, index) => renderMenuItem(item, index + 4, true))}
                                        </ul>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    )
}
