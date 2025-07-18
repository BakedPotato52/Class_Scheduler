"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Users, LinkIcon, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { classService, type ClassData, type TeacherInfo } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

interface CreateClassModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [minDateTime, setMinDateTime] = useState("")
    const [formData, setFormData] = useState({
        class_title: "",
        start_time: "",
        end_time: "",
        max_students: 30,
        meeting_link: "",
        class_status: "active" as const,
        duration: "",
    })

    useEffect(() => {
        // Set minimum datetime to current time
        const now = new Date()
        const currentDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        setMinDateTime(currentDateTime)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        // Validate times are not in the past using device time
        const now = new Date(Date.now())
        const startTime = new Date(formData.start_time)
        const endTime = new Date(formData.end_time)

        if (startTime < now) {
            alert("Start time cannot be in the past")
            return
        }

        if (endTime < now) {
            alert("End time cannot be in the past")
            return
        }

        if (endTime <= startTime) {
            alert("End time must be after start time")
            return
        }

        setLoading(true)
        try {
            // fetch teacher info
            const teacherInfo: TeacherInfo = {
                id: user.uid,
                name: user.name || "Unknown Teacher",
                email: user.email || "",
                subject: "",
            }

            const classData: Omit<ClassData, "id" | "created_at"> = {
                ...formData,
                teacher_id: user.uid,
                teacher_info: teacherInfo,
            }

            await classService.createClass(classData)
            onSuccess()
            onClose()

            // Reset form
            setFormData({
                class_title: "",
                start_time: "",
                end_time: "",
                max_students: 30,
                meeting_link: "",
                class_status: "active",
                duration: "",
            })
        } catch (error) {
            console.error("Error creating class:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // If start time is changed, update minimum end time
        if (field === "start_time" && typeof value === "string") {
            const startTime = new Date(value)
            if (formData.end_time) {
                const endTime = new Date(formData.end_time)
                if (endTime <= startTime) {
                    // Set end time to 1 hour after start time
                    const newEndTime = new Date(startTime.getTime() + 60 * 60 * 1000)
                    const endDateTime = new Date(newEndTime.getTime() - newEndTime.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    setFormData((prev) => ({ ...prev, end_time: endDateTime }))
                }
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Class</h2>
                                <p className="text-sm text-gray-600 mt-1">Set up your class details and schedule</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Class Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Class Title
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Advanced Mathematics"
                                    value={formData.class_title}
                                    onChange={(e) => handleInputChange("class_title", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Time Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time" className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Start Time
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        min={minDateTime}
                                        value={formData.start_time}
                                        onChange={(e) => handleInputChange("start_time", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time" className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        End Time
                                    </Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        min={formData.start_time || minDateTime}
                                        value={formData.end_time}
                                        onChange={(e) => handleInputChange("end_time", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Duration and Max Students */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        placeholder="e.g., 2 hours"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange("duration", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_students" className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Max Students
                                    </Label>
                                    <Input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.max_students}
                                        onChange={(e) => handleInputChange("max_students", Number.parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Meeting Link */}
                            <div className="space-y-2">
                                <Label htmlFor="meeting_link" className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Meeting Link
                                </Label>
                                <Input
                                    id="meeting_link"
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={formData.meeting_link}
                                    onChange={(e) => handleInputChange("meeting_link", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Class Status */}
                            <div className="space-y-2">
                                <Label>Class Status</Label>
                                <Select
                                    value={formData.class_status}
                                    onValueChange={(value) => handleInputChange("class_status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                >
                                    {loading ? "Creating..." : "Create Class"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
