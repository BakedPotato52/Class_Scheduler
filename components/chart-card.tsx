import DashboardCard from "./dashboard-card"

interface ChartCardProps {
    title: string
    subtitle: string
    data: any[]
    type: "bar" | "line" | "donut"
    color: string
}

export default function ChartCard({ title, subtitle, data, type, color }: ChartCardProps) {
    const renderChart = () => {
        if (type === "bar") {
            const maxValue = Math.max(...data.map((d) => d.students || d.classes || d.completed || 0))

            return (
                <div className="flex items-end justify-between h-32 mt-4">
                    {data.map((item, index) => {
                        const height = ((item.students || item.classes || item.completed || 0) / maxValue) * 100
                        return (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-8 mx-1">
                                    <div
                                        className={`bg-gradient-to-t ${color === "blue"
                                            ? "from-blue-400 to-blue-600"
                                            : color === "green"
                                                ? "from-green-400 to-green-600"
                                                : "from-purple-400 to-purple-600"
                                            } rounded-t-md transition-all duration-300`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-600 mt-2">{item.day || item.month}</span>
                            </div>
                        )
                    })}
                </div>
            )
        }

        if (type === "donut") {
            return (
                <div className="flex items-center justify-center h-32 mt-4">
                    <div className="relative w-24 h-24">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
                        <div className="absolute inset-3   rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">100%</span>
                        </div>
                    </div>
                    <div className="ml-6 space-y-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className={`w-3 h-3 rounded-full mr-2 ${index === 0
                                        ? "bg-blue-500"
                                        : index === 1
                                            ? "bg-purple-500"
                                            : index === 2
                                                ? "bg-pink-500"
                                                : "bg-green-500"
                                        }`}
                                ></div>
                                <span className="text-sm text-gray-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return (
            <div className="h-32 bg-gray-100 rounded-lg mt-4 flex items-center justify-center text-gray-500">
                Chart placeholder
            </div>
        )
    }

    return (
        <DashboardCard title={title} subtitle={subtitle}>
            {renderChart()}
        </DashboardCard>
    )
}
