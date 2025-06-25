"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"
import DashboardCard from "@/components/dashboard-card"
import StatsCard from "@/components/stats-card"
import { adminService, classService } from "@/lib/firebase-admin"

interface DashboardStats {
  totalTeachers: number
  activeTeachers: number
  totalClasses: number
  activeClasses: number
  totalStudents: number
  completedClasses: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    completedClasses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentClasses, setRecentClasses] = useState<any[]>([])

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, classes] = await Promise.all([
        adminService.getDashboardStats(),
        classService.getAllClasses(),
      ])

      setStats(dashboardStats)
      setRecentClasses(classes.slice(0, 5)) // Get 5 most recent classes
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor and manage your educational platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers.toString()}
          icon={Users}
          color="blue"
          change={`${stats.activeTeachers} currently teaching`}
        />
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses.toString()}
          icon={BookOpen}
          color="green"
          change={`${stats.activeClasses} active now`}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          icon={GraduationCap}
          color="purple"
          change="Platform users"
        />
        <StatsCard
          title="Completed Classes"
          value={stats.completedClasses.toString()}
          icon={TrendingUp}
          color="yellow"
          change="All time"
        />
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <DashboardCard title="Recent Classes" subtitle="Latest classes created on the platform">
            {recentClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No classes created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{classItem.class_title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.class_status)}`}
                        >
                          {classItem.class_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Teacher: {classItem.teacher_info.name}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(classItem.start_time)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {classItem.enrolled_students?.length || 0}/{classItem.max_students}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div>
          <DashboardCard title="Platform Health" subtitle="System status overview">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-green-900 text-sm sm:text-base">Active Teachers</div>
                  <div className="text-xs sm:text-sm text-green-600">
                    {stats.activeTeachers} of {stats.totalTeachers} teachers
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-blue-900 text-sm sm:text-base">Active Classes</div>
                  <div className="text-xs sm:text-sm text-blue-600">{stats.activeClasses} classes running</div>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-purple-900 text-sm sm:text-base">Student Engagement</div>
                  <div className="text-xs sm:text-sm text-purple-600">
                    {((stats.totalStudents / Math.max(stats.totalClasses, 1)) * 100).toFixed(0)}% avg enrollment
                  </div>
                </div>
                <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-yellow-900 text-sm sm:text-base">Completion Rate</div>
                  <div className="text-xs sm:text-sm text-yellow-600">
                    {((stats.completedClasses / Math.max(stats.totalClasses, 1)) * 100).toFixed(0)}% classes completed
                  </div>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
