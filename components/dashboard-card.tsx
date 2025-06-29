import type React from "react"

interface DashboardCardProps {
    title: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export default function DashboardCard({ title, subtitle, children, className = "" }: DashboardCardProps) {
    return (
        <div className={`  rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}>
            <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold dark:text-white text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs sm:text-sm dark:text-white text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {children}
        </div>
    )
}
