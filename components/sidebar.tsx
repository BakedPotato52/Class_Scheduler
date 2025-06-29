"use client"

import { useState, useEffect, use } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { getFilteredMenuItems, type UserRole } from "@/lib/menu-items"
import { type LucideIcon, MoreHorizontal, LogOut, GraduationCap, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, useProfile } from "@/hooks/use-auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

export default function Sidebar() {
    const [open, setOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, userRole } = useAuth()
    const { profile } = useProfile()



    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    if (!user) return null

    const role = userRole as UserRole
    const menuItems = getFilteredMenuItems(role)
    const visibleItems = menuItems.flatMap(section =>
        section.items.filter(item => item.visible.includes(role))
    )

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success("Logged out successfully")
            router.push("/")
        } catch (error) {
            console.error("Logout error", error)
        }
    }

    const renderMenuItem = (item: typeof visibleItems[0], index: number) => {
        const Icon = item.icon as LucideIcon
        const isActive = pathname === item.href

        return (
            <li key={item.label} className={index >= 4 ? "lg:hidden" : ""}>
                <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted dark:hover:bg-muted"
                        }`}
                    aria-label={item.label}
                    onClick={() => setOpen(false)}
                >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                </Link>
            </li>
        )
    }

    return (
        <>
            {/* Mobile Header */}
            {/* <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 shadow-sm">
                <div className="flex items-center justify-between h-full px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xl bg-clip-text text-transparent">
                            ClassEs
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <GraduationCap className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt={user.name || ""} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header> */}

            {/* Overlay */}
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
                                    {section.items.filter((item) => item.visible.includes(role)).map((item) => renderMenuItem(item, 0))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden sticky top-0 md:flex flex-col w-64 h-screen bg-background border-r z-20 shadow-lg">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-xl bg-clip-text text-transparent">
                                ClassEs
                            </span>
                        </Link>
                        <nav>
                            {menuItems.map(section => (
                                <div key={section.title} className="mb-6">
                                    <h2 className="text-sm font-semibold text-gray-500 mb-2 px-4">{section.title}</h2>
                                    <ul className="space-y-1">
                                        {section.items
                                            .filter(item => item.visible.includes(role))
                                            .map((item, index) => renderMenuItem(item, index))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-6 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={profile?.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{role}</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Bottom Navigation */}
            <nav
                className="md:hidden min-w-screen fixed bottom-0 left-0 right-0 bg-background border-t z-20"
                aria-label="Mobile Bottom Navigation"
            >
                <ul className="flex justify-around items-center h-16">
                    {visibleItems.slice(0, 3).map((item, index) => {
                        const IconComponent = item.icon as LucideIcon
                        const isActive = pathname === item.href
                        return (
                            <li key={item.label} className="flex-1">
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center h-full ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    aria-label={item.label}
                                >
                                    <IconComponent className="h-5 w-5" />
                                    <span className="text-xs mt-1 max-w-[90%] truncate">{item.label.split(" ")[0]}</span>
                                </Link>
                            </li>
                        )
                    })}
                    {visibleItems.length > 3 && (
                        <li className="flex-1">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        aria-label="More options"
                                        className="h-full w-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                        <span className="text-xs mt-1">More</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[70vh] pt-10">
                                    <nav aria-label="More Navigation Options">
                                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {visibleItems.slice(4).map((item, index) => renderMenuItem(item, index + 4))}
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
