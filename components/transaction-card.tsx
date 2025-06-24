interface TransactionCardProps {
    title: string
    subtitle: string
    time: string
    type: string
    amount: string
}

export default function TransactionCard({ title, subtitle, time, type, amount }: TransactionCardProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case "upcoming":
                return "bg-blue-100 text-blue-800"
            case "completed":
                return "bg-green-100 text-green-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            case "user":
                return "bg-purple-100 text-purple-800"
            case "class":
                return "bg-yellow-100 text-yellow-800"
            case "enrollment":
                return "bg-indigo-100 text-indigo-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "upcoming":
                return "🕒"
            case "completed":
                return "✅"
            case "cancelled":
                return "❌"
            case "user":
                return "👤"
            case "class":
                return "📚"
            case "enrollment":
                return "🎓"
            default:
                return "📋"
        }
    }

    return (
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center min-w-0 flex-1">
                <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg flex-shrink-0 ${getTypeColor(type)}`}
                >
                    {getTypeIcon(type)}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{subtitle}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{time}</p>
                {amount && <p className="text-xs sm:text-sm text-gray-600">{amount}</p>}
            </div>
        </div>
    )
}
