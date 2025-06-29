"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, User, MapPin, Loader2 } from "lucide-react"
import { Calendar, type CalendarEvent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { classService, type ClassData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

interface ScheduleEvent extends CalendarEvent {
    data: ClassData
}

export default function SchedulePage() {
    const { user, userRole } = useAuth()
    const [classes, setClasses] = useState<ClassData[]>([])
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const loadSchedule = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            let classesData: ClassData[] = []

            // Get first and last day of current month for efficient querying
            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
            const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

            switch (userRole) {
                case "teacher":
                    classesData = await classService.getClassesByTeacher(user.uid)
                    break
                case "student":
                    // Get all classes and filter by enrollment
                    const allClasses = await classService.getAllClasses()
                    classesData = allClasses.filter((classItem) => classItem.enrolled_students?.includes(user.uid))
                    break
                case "admin":
                    classesData = await classService.getAllClasses()
                    break
                default:
                    classesData = []
            }

            // Filter classes by current month for better performance
            const monthClasses = classesData.filter((classItem) => {
                const classDate = new Date(classItem.start_time)
                return classDate >= firstDay && classDate <= lastDay
            })

            setClasses(classesData)

            // Convert classes to calendar events
            const calendarEvents: ScheduleEvent[] = monthClasses.map((classItem) => ({
                id: classItem.id!,
                title: classItem.class_title,
                start: new Date(classItem.start_time),
                end: new Date(classItem.end_time),
                color: getEventColor(classItem.class_status),
                data: classItem,
            }))

            setEvents(calendarEvents)
        } catch (error) {
            console.error("Error loading schedule:", error)
            setError("Failed to load schedule. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSchedule()
    }, [user, userRole, currentMonth])

    const getEventColor = (status: string) => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 border-green-200"
            case "completed":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "inactive":
                return "bg-gray-100 text-gray-800 border-gray-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDateTime = (date: Date) => {
        return date.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const isClassActive = (classData: ClassData) => {
        const now = new Date()
        const start = new Date(classData.start_time)
        const end = new Date(classData.end_time)
        return now >= start && now <= end
    }

    const isEnrolled = (classData: ClassData) => {
        return classData.enrolled_students?.includes(user?.uid || "") || false
    }

    const canJoinMeeting = (classData: ClassData) => {
        return userRole === "teacher" || userRole === "admin" || (userRole === "student" && isEnrolled(classData))
    }

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event as ScheduleEvent)
    }

    const handleDateClick = (date: Date) => {
        // Find events for the clicked date
        const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.start)
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            )
        })

        if (dayEvents.length > 0) {
            setSelectedEvent(dayEvents[0])
        }
    }

    const getPageTitle = () => {
        switch (userRole) {
            case "teacher":
                return "My Schedule"
            case "student":
                return "Class Schedule"
            case "admin":
                return "Platform Schedule"
            default:
                return "Schedule"
        }
    }

    const getPageSubtitle = () => {
        switch (userRole) {
            case "teacher":
                return "View and manage your teaching schedule"
            case "student":
                return "View your enrolled classes schedule"
            case "admin":
                return "Monitor all platform activities"
            default:
                return "Class schedule overview"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading schedule...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-8 mb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                    <p className="text-gray-600 mt-1">{getPageSubtitle()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{events.length} classes this month</span>
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Calendar events={events} onEventClick={handleEventClick} onDateClick={handleDateClick} className="w-full" />
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                    {selectedEvent ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{selectedEvent.data.class_title}</span>
                                    <Badge className={getStatusColor(selectedEvent.data.class_status)}>
                                        {selectedEvent.data.class_status}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isClassActive(selectedEvent.data) && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            <span className="text-red-800 font-medium text-sm">Live Now</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 mt-0.5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Teacher</p>
                                            <p className="text-sm text-gray-600">{selectedEvent.data.teacher_info.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Schedule</p>
                                            <p className="text-sm text-gray-600">{formatDateTime(selectedEvent.start)}</p>
                                            <p className="text-sm text-gray-600">Duration: {selectedEvent.data.duration}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.data.subject && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium">Subject</p>
                                                <p className="text-sm text-gray-600">{selectedEvent.data.subject}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.data.description && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Description</p>
                                            <p className="text-sm text-gray-600">{selectedEvent.data.description}</p>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 mt-0.5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Enrollment</p>
                                            <p className="text-sm text-gray-600">
                                                {selectedEvent.data.enrolled_students?.length || 0} / {selectedEvent.data.max_students} students
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {canJoinMeeting(selectedEvent.data) && (
                                    <Button
                                        onClick={() => window.open(selectedEvent.data.meeting_link, "_blank")}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    >
                                        Join Meeting
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">Click on a class to view details</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Today's Classes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Classes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const today = new Date()
                                const todayClasses = events.filter((event) => {
                                    const eventDate = new Date(event.start)
                                    return (
                                        eventDate.getDate() === today.getDate() &&
                                        eventDate.getMonth() === today.getMonth() &&
                                        eventDate.getFullYear() === today.getFullYear()
                                    )
                                })

                                if (todayClasses.length === 0) {
                                    return <p className="text-gray-600 text-sm text-center py-4">No classes scheduled for today</p>
                                }

                                return (
                                    <div className="space-y-3">
                                        {todayClasses.map((event) => (
                                            <div
                                                key={event.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{event.title}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {formatTime(event.start)} - {formatTime(event.end)}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(event.data.class_status)}>{event.data.class_status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
