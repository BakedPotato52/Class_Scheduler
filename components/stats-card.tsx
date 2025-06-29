import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string
    icon: LucideIcon
    color: "blue" | "green" | "yellow" | "purple"
    change?: string
}

const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-500 to-orange-600",
    purple: "from-purple-500 to-pink-600",
}

export default function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
    return (
        <div className=" hover:shadow-lg rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium dark:text-white text-gray-600 truncate">{title}</p>
                    <p className="text-lg sm:text-2xl font-bold dark:text-white text-gray-900 mt-1">{value}</p>
                    {change && <p className="text-xs sm:text-sm dark:text-white text-gray-500 mt-1 truncate">{change}</p>}
                </div>
                <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}
                >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
        </div>
    )
}
