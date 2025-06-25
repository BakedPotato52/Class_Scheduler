"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Users, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardCard from "@/components/dashboard-card"
import StatsCard from "@/components/stats-card"
import CreateClassModal from "@/components/modals/create-class-modal"
import { classService, type ClassData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

export default function TeacherDashboard() {
    const { user } = useAuth()
    const [classes, setClasses] = useState<ClassData[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const loadClasses = async () => {
        if (!user) return

        try {
            const teacherClasses = await classService.getClassesByTeacher(user.uid)
            setClasses(teacherClasses)
        } catch (error) {
            console.error("Error loading classes:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClasses()
    }, [user])

    const activeClasses = classes.filter((c) => c.class_status === "active")
    const completedClasses = classes.filter((c) => c.class_status === "completed")
    const totalStudents = classes.reduce((sum, c) => sum + (c.enrolled_students?.length || 0), 0)

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your classes and track student progress</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Class
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatsCard
                    title="Total Classes"
                    value={classes.length.toString()}
                    icon={Calendar}
                    color="blue"
                    change="All time"
                />
                <StatsCard
                    title="Active Classes"
                    value={activeClasses.length.toString()}
                    icon={Clock}
                    color="green"
                    change="Currently running"
                />
                <StatsCard
                    title="Total Students"
                    value={totalStudents.toString()}
                    icon={Users}
                    color="purple"
                    change="Across all classes"
                />
                <StatsCard
                    title="Completed"
                    value={completedClasses.length.toString()}
                    icon={Calendar}
                    color="yellow"
                    change="Finished classes"
                />
            </div>

            {/* Classes List */}
            <DashboardCard title="Your Classes" subtitle="Manage and monitor your classes">
                {classes.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                        <p className="text-gray-600 mb-4">Create your first class to get started</p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Class
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {classes.map((classItem) => (
                            <div
                                key={classItem.id}
                                className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{classItem.class_title}</h3>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.class_status)}`}
                                            >
                                                {classItem.class_status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Start: {formatDateTime(classItem.start_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>End: {formatDateTime(classItem.end_time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {classItem.enrolled_students?.length || 0}/{classItem.max_students} students
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Duration: {classItem.duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(classItem.meeting_link, "_blank")}
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Join Meeting
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardCard>

            {/* Create Class Modal */}
            <CreateClassModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={loadClasses} />
        </div>
    )
}
