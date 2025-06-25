import { Home, BookOpen, Users, Calendar, Bell, Settings, UserCheck, Shield } from "lucide-react"

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
                href: `/dashboard/${role}`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Classes",
                icon: BookOpen,
                href: `/dashboard/classes`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Schedule",
                icon: Calendar,
                href: `/dashboard/schedule`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Students",
                icon: Users,
                href: `/dashboard/students`,
                visible: ["teacher", "admin"],
            },
            {
                label: "Teachers",
                icon: UserCheck,
                href: `/dashboard/teachers`,
                visible: ["admin"],
            },
            {
                label: "Analytics",
                icon: Shield,
                href: `/dashboard/analytics`,
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
                href: `/dashboard/notifications`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Settings",
                icon: Settings,
                href: `/dashboard/settings`,
                visible: ["student", "teacher", "admin"],
            },
        ],
    },
]
