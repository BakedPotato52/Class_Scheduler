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
                href: `/classes`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Schedule",
                icon: Calendar,
                href: `/schedule`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Students",
                icon: Users,
                href: `/students`,
                visible: ["teacher", "admin"],
            },
            {
                label: "Teachers",
                icon: UserCheck,
                href: `/teachers`,
                visible: ["admin"],
            },
            {
                label: "Analytics",
                icon: Shield,
                href: `/analytics`,
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
                href: `/notifications`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Profile",
                icon: User,
                href: `/profile`,
                visible: ["student", "teacher", "admin"],
            },
            {
                label: "Settings",
                icon: Settings,
                href: `/settings`,
                visible: ["student", "teacher", "admin"],
            },
        ],
    },
]
