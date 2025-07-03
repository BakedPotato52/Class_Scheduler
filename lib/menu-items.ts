import { useAuth } from "@/hooks/use-auth"
import { Home, BookOpen, Users, Calendar, Bell, Settings, UserCheck, Shield, User } from "lucide-react"

export type UserRole = "student" | "teacher" | "admin"

export type MenuItem = {
    label: string
    icon: any
    href: string
    visible: UserRole[]
}

export type MenuSection = {
    title: string
    items: MenuItem[]
}


export const getFilteredMenuItems = (role: UserRole): MenuSection[] => [
    {
        title: "Main",
        items: [
            {
                label: "Dashboard",
                icon: Home,
                href: `/${role}`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Classes",
                icon: BookOpen,
                href: `/${role}/classes`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Schedule",
                icon: Calendar,
                href: `/${role}/schedule`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Students",
                icon: Users,
                href: `/${role}/students`,
                visible: ["teacher", "admin"],
            },
            {
                label: "Analytics",
                icon: Shield,
                href: `/${role}/analytics`,
                visible: ["admin"],
            },
            {
                label: "Teachers",
                icon: UserCheck,
                href: `/${role}/teachers`,
                visible: ["admin"],
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                label: "Notifications",
                icon: Bell,
                href: `/${role}/notifications`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Profile",
                icon: User,
                href: `/${role}/profile`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Settings",
                icon: Settings,
                href: `/${role}/settings`,
                visible: ["student", "teacher", "admin"],
            },
        ],
    },
]
