"use client"

import { useState, useEffect } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { TrendingUp, Users, BookOpen, Calendar, Activity, Download, Filter, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { adminService, classService, userDataService } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

interface AnalyticsData {
    totalUsers: number
    totalClasses: number
    totalEnrollments: number
    activeClasses: number
    completedClasses: number
    userGrowth: Array<{ month: string; students: number; teachers: number }>
    classStatusDistribution: Array<{ name: string; value: number; color: string }>
    enrollmentTrends: Array<{ date: string; enrollments: number }>
    topTeachers: Array<{ name: string; classes: number; students: number }>
    departmentStats: Array<{ department: string; teachers: number; classes: number }>
}

export default function AnalyticsPage() {
    const { userRole } = useAuth()
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState("30d")

    const loadAnalytics = async () => {
        setLoading(true)
        setError(null)

        try {
            // Get basic stats
            const dashboardStats = await adminService.getDashboardStats()

            // Get all data for detailed analytics
            const [allClasses, allUsers] = await Promise.all([
                classService.getAllClasses(),
                userDataService.getAllUsersData(),
            ])

            const students = allUsers.filter((u) => u.role === "student")
            const teachers = allUsers.filter((u) => u.role === "teacher")

            // Calculate total enrollments
            const totalEnrollments = allClasses.reduce((sum, classItem) => {
                return sum + (classItem.enrolled_students?.length || 0)
            }, 0)

            // Generate mock user growth data (in real app, this would come from historical data)
            const userGrowth = generateUserGrowthData(students, teachers)

            // Class status distribution
            const classStatusDistribution = [
                {
                    name: "Active",
                    value: allClasses.filter((c) => c.class_status === "active").length,
                    color: "#10B981",
                },
                {
                    name: "Completed",
                    value: allClasses.filter((c) => c.class_status === "completed").length,
                    color: "#3B82F6",
                },
                {
                    name: "Inactive",
                    value: allClasses.filter((c) => c.class_status === "inactive").length,
                    color: "#6B7280",
                },
            ]

            // Generate enrollment trends (mock data)
            const enrollmentTrends = generateEnrollmentTrends()

            // Top teachers by student count
            const teacherStats = teachers
                .map((teacher) => {
                    const teacherClasses = allClasses.filter((c) => c.teacher_id === teacher.id)
                    const totalStudents = teacherClasses.reduce((sum, c) => sum + (c.enrolled_students?.length || 0), 0)

                    return {
                        name: teacher.name,
                        classes: teacherClasses.length,
                        students: totalStudents,
                    }
                })
                .sort((a, b) => b.students - a.students)
                .slice(0, 5)

            // Department statistics
            const departmentStats = generateDepartmentStats(teachers, allClasses)

            const analyticsData: AnalyticsData = {
                totalUsers: allUsers.length,
                totalClasses: allClasses.length,
                totalEnrollments,
                activeClasses: dashboardStats.activeClasses,
                completedClasses: dashboardStats.completedClasses,
                userGrowth,
                classStatusDistribution,
                enrollmentTrends,
                topTeachers: teacherStats,
                departmentStats,
            }

            setAnalytics(analyticsData)
        } catch (error) {
            console.error("Error loading analytics:", error)
            setError("Failed to load analytics data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userRole === "admin") {
            loadAnalytics()
        }
    }, [userRole, timeRange])

    // Helper functions for generating mock data
    const generateUserGrowthData = (students: any[], teachers: any[]) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        return months.map((month, index) => ({
            month,
            students: Math.floor(students.length * (0.3 + index * 0.15)),
            teachers: Math.floor(teachers.length * (0.2 + index * 0.15)),
        }))
    }

    const generateEnrollmentTrends = () => {
        const days = 30
        const data = []
        for (let i = days; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            data.push({
                date: date.toLocaleDateString(),
                enrollments: Math.floor(Math.random() * 20) + 5,
            })
        }
        return data
    }

    const generateDepartmentStats = (teachers: any[], classes: any[]) => {
        const departments = [...new Set(teachers.map((t) => t.department).filter(Boolean))]

        return departments.map((dept) => {
            const deptTeachers = teachers.filter((t) => t.department === dept)
            const deptClasses = classes.filter((c) => deptTeachers.some((t) => t.id === c.teacher_id))

            return {
                department: dept as string,
                teachers: deptTeachers.length,
                classes: deptClasses.length,
            }
        })
    }

    const handleExportData = () => {
        // In a real app, this would generate and download a CSV/Excel file
        alert("Export functionality would be implemented here")
    }

    if (userRole !== "admin") {
        return (
            <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">You don't have permission to view analytics.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        )
    }

    if (error || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
                    <p className="text-gray-600">{error || "Failed to load analytics data"}</p>
                    <Button onClick={loadAnalytics} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Activity className="h-8 w-8" />
                        Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Platform insights and performance metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleExportData} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +12% from last month
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalClasses}</p>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +8% from last month
                                </p>
                            </div>
                            <BookOpen className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalEnrollments}</p>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +15% from last month
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.activeClasses}</p>
                                <p className="text-xs text-blue-600 flex items-center mt-1">
                                    <Activity className="w-3 h-3 mr-1" />
                                    Currently running
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics.totalClasses > 0
                                        ? Math.round((analytics.completedClasses / analytics.totalClasses) * 100)
                                        : 0}
                                    %
                                </p>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +5% from last month
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-indigo-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="Students" />
                                <Line type="monotone" dataKey="teachers" stroke="#10B981" strokeWidth={2} name="Teachers" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Class Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Class Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.classStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {analytics.classStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Enrollment Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.enrollmentTrends.slice(-7)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="enrollments" fill="#8B5CF6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.departmentStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="teachers" fill="#F59E0B" name="Teachers" />
                                <Bar dataKey="classes" fill="#EF4444" name="Classes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Teachers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.topTeachers.map((teacher, index) => (
                            <div key={teacher.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-blue-100 text-blue-800">#{index + 1}</Badge>
                                    <div>
                                        <p className="font-medium text-gray-900">{teacher.name}</p>
                                        <p className="text-sm text-gray-600">{teacher.classes} classes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{teacher.students}</p>
                                    <p className="text-sm text-gray-600">students</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
