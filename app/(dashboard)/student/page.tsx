"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, ExternalLink, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardCard from "@/components/dashboard-card"
import StatsCard from "@/components/stats-card"
import { classService, studentService, type ClassData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  const loadClasses = async () => {
    try {
      const activeClasses = await classService.getActiveClasses()
      setClasses(activeClasses)
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const handleEnroll = async (classId: string) => {
    if (!user || !classId) return

    setEnrolling(classId)
    try {
      await studentService.enrollInClass(user.uid, classId)
      await loadClasses() // Refresh the classes
    } catch (error) {
      console.error("Error enrolling in class:", error)
    } finally {
      setEnrolling(null)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString()
  }

  const isEnrolled = (classItem: ClassData) => {
    return classItem.enrolled_students?.includes(user?.uid || "") || false
  }

  const availableClasses = classes.filter((c) => !isEnrolled(c))
  const enrolledClasses = classes.filter((c) => isEnrolled(c))

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Discover and join classes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Available Classes"
          value={availableClasses.length.toString()}
          icon={BookOpen}
          color="blue"
          change="Ready to join"
        />
        <StatsCard
          title="Enrolled Classes"
          value={enrolledClasses.length.toString()}
          icon={Calendar}
          color="green"
          change="Your classes"
        />
        <StatsCard
          title="Total Classes"
          value={classes.length.toString()}
          icon={Users}
          color="purple"
          change="Platform wide"
        />
        <StatsCard
          title="Active Now"
          value={classes
            .filter((c) => {
              const now = new Date()
              const start = new Date(c.start_time)
              const end = new Date(c.end_time)
              return now >= start && now <= end
            })
            .length.toString()}
          icon={Clock}
          color="yellow"
          change="Live classes"
        />
      </div>

      {/* Enrolled Classes */}
      {enrolledClasses.length > 0 && (
        <DashboardCard title="Your Enrolled Classes" subtitle="Classes you've joined">
          <div className="space-y-4">
            {enrolledClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                isEnrolled={true}
                onEnroll={() => { }}
                enrolling={false}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Available Classes */}
      <DashboardCard title="Available Classes" subtitle="Discover new classes to join">
        {availableClasses.length === 0 ? (
          <div className="text-center py-12 sm:mb-[64px]">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No available classes</h3>
            <p className="text-gray-600">Check back later for new classes</p>
          </div>
        ) : (
          <div className="space-y-4 sm:mb-[64px]">
            {availableClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                isEnrolled={false}
                onEnroll={() => handleEnroll(classItem.id!)}
                enrolling={enrolling === classItem.id}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

interface ClassCardProps {
  classItem: ClassData
  isEnrolled: boolean
  onEnroll: () => void
  enrolling: boolean
  formatDateTime: (date: string) => string
}

function ClassCard({ classItem, isEnrolled, onEnroll, enrolling, formatDateTime }: ClassCardProps) {
  const isClassActive = () => {
    const now = new Date()
    const start = new Date(classItem.start_time)
    const end = new Date(classItem.end_time)
    return now >= start && now <= end
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{classItem.class_title}</h3>
            {isClassActive() && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Live Now</span>
            )}
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Teacher:</span> {classItem.teacher_info.name}
            </p>
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
          {isEnrolled ? (
            <Button
              size="sm"
              onClick={() => window.open(classItem.meeting_link, "_blank")}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <ExternalLink className="w-4 h-4" />
              Join Meeting
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onEnroll}
              disabled={enrolling || (classItem.enrolled_students?.length || 0) >= classItem.max_students}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
