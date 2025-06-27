"use client"

import { useState } from "react"
import { Calendar, Clock, Users, ExternalLink, MapPin, User, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ClassData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

interface ClassCardProps {
    classData: ClassData
    onEnroll?: (classId: string) => void
    onUnenroll?: (classId: string) => void
    onEdit?: (classData: ClassData) => void
    onDelete?: (classId: string) => void
    isEnrolled?: boolean
    isLoading?: boolean
}

export function ClassCard({
    classData,
    onEnroll,
    onUnenroll,
    onEdit,
    onDelete,
    isEnrolled = false,
    isLoading = false,
}: ClassCardProps) {
    const { user, userRole } = useAuth()
    const [actionLoading, setActionLoading] = useState(false)

    const formatDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
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

    const isClassActive = () => {
        const now = new Date()
        const start = new Date(classData.start_time)
        const end = new Date(classData.end_time)
        return now >= start && now <= end
    }

    const canEnroll = () => {
        return (
            userRole === "student" &&
            !isEnrolled &&
            classData.class_status === "active" &&
            (classData.enrolled_students?.length || 0) < classData.max_students
        )
    }

    const canUnenroll = () => {
        return userRole === "student" && isEnrolled
    }

    const canEdit = () => {
        return userRole === "teacher" && classData.teacher_id === user?.uid
    }

    const canDelete = () => {
        return (userRole === "teacher" && classData.teacher_id === user?.uid) || userRole === "admin"
    }

    const handleAction = async (action: () => Promise<void> | void) => {
        setActionLoading(true)
        try {
            await action()
        } catch (error) {
            console.error("Action failed:", error)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{classData.class_title}</h3>
                            <Badge className={getStatusColor(classData.class_status)}>{classData.class_status}</Badge>
                            {isClassActive() && (
                                <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">Live Now</Badge>
                            )}
                        </div>
                        {classData.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{classData.description}</p>
                        )}
                    </div>

                    {(canEdit() || canDelete()) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canEdit() && <DropdownMenuItem onClick={() => onEdit?.(classData)}>Edit Class</DropdownMenuItem>}
                                {canDelete() && (
                                    <DropdownMenuItem onClick={() => onDelete?.(classData.id!)} className="text-red-600">
                                        Delete Class
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Teacher Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                        <span className="font-medium">Teacher:</span> {classData.teacher_info.name}
                    </span>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Start: {formatDateTime(classData.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>End: {formatDateTime(classData.end_time)}</span>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                            {classData.enrolled_students?.length || 0}/{classData.max_students} students
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Duration: {classData.duration}</span>
                    </div>
                </div>

                {classData.subject && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Subject: {classData.subject}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3">
                <div className="flex gap-2 w-full">
                    {/* Join Meeting Button */}
                    {(isEnrolled || userRole === "teacher" || userRole === "admin") && (
                        <Button
                            size="sm"
                            onClick={() => window.open(classData.meeting_link, "_blank")}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Join Meeting
                        </Button>
                    )}

                    {/* Enrollment Actions */}
                    {canEnroll() && (
                        <Button
                            size="sm"
                            onClick={() => handleAction(() => onEnroll?.(classData.id!))}
                            disabled={actionLoading || isLoading}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                            {actionLoading ? "Enrolling..." : "Enroll Now"}
                        </Button>
                    )}

                    {canUnenroll() && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(() => onUnenroll?.(classData.id!))}
                            disabled={actionLoading || isLoading}
                        >
                            {actionLoading ? "Unenrolling..." : "Unenroll"}
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
