import DashboardCard from "@/components/dashboard-card"
import ChartCard from "@/components/chart-card"
import TransactionCard from "@/components/transaction-card"
import StatsCard from "@/components/stats-card"
import { BookOpen, Calendar, Clock, Trophy } from "lucide-react"

export default function StudentDashboard() {
  const upcomingClasses = [
    { id: 1, title: "Mathematics 101", time: "10:00 AM", instructor: "Dr. Johnson", type: "upcoming" },
    { id: 2, title: "Physics Lab", time: "2:00 PM", instructor: "Prof. Williams", type: "upcoming" },
    { id: 3, title: "Chemistry", time: "4:00 PM", instructor: "Dr. Brown", type: "completed" },
  ]

  const weeklyProgress = [
    { day: "Mon", classes: 3, completed: 3 },
    { day: "Tue", classes: 2, completed: 2 },
    { day: "Wed", classes: 4, completed: 3 },
    { day: "Thu", classes: 3, completed: 2 },
    { day: "Fri", classes: 2, completed: 1 },
    { day: "Sat", classes: 1, completed: 0 },
    { day: "Sun", classes: 0, completed: 0 },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, Emily! Ready to learn today?</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search classes..."
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard title="Enrolled Classes" value="12" icon={BookOpen} color="blue" change="+2 this month" />
        <StatsCard title="Completed Classes" value="8" icon={Trophy} color="green" change="67% completion rate" />
        <StatsCard title="Upcoming Classes" value="4" icon={Calendar} color="yellow" change="This week" />
        <StatsCard title="Study Hours" value="24" icon={Clock} color="purple" change="This month" />
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard
          title="Weekly Progress"
          subtitle="Classes attended this week"
          data={weeklyProgress}
          type="bar"
          color="blue"
        />
        <ChartCard
          title="Subject Performance"
          subtitle="Your performance by subject"
          data={[
            { name: "Mathematics", value: 85 },
            { name: "Physics", value: 92 },
            { name: "Chemistry", value: 78 },
            { name: "Biology", value: 88 },
          ]}
          type="donut"
          color="multi"
        />
      </div>

      {/* Upcoming Classes and Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <DashboardCard title="Upcoming Classes" subtitle="Your schedule for today">
            <div className="space-y-3 sm:space-y-4">
              {upcomingClasses.map((classItem) => (
                <TransactionCard
                  key={classItem.id}
                  title={classItem.title}
                  subtitle={classItem.instructor}
                  time={classItem.time}
                  type={classItem.type}
                  amount=""
                />
              ))}
            </div>
          </DashboardCard>
        </div>

        <div>
          <DashboardCard title="Quick Actions" subtitle="What would you like to do?">
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="font-medium text-sm sm:text-base">Join Live Class</div>
                <div className="text-xs sm:text-sm opacity-90">Mathematics 101 starts in 10 min</div>
              </button>
              <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <div className="font-medium text-gray-900 text-sm sm:text-base">View Assignments</div>
                <div className="text-xs sm:text-sm text-gray-600">3 pending submissions</div>
              </button>
              <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <div className="font-medium text-gray-900 text-sm sm:text-base">Study Materials</div>
                <div className="text-xs sm:text-sm text-gray-600">Download resources</div>
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
