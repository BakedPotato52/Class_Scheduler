"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, Filter, Loader2, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { NotificationItem } from "./notification-items"
import { notificationService, type NotificationData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<NotificationData[]>([])
    const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Filters
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const loadNotifications = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            const notificationsData = await notificationService.getNotificationsByUser(user.uid)
            setNotifications(notificationsData)
            setFilteredNotifications(notificationsData)
        } catch (error) {
            console.error("Error loading notifications:", error)
            setError("Failed to load notifications. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [user])

    // Filter notifications
    useEffect(() => {
        let filtered = notifications

        if (typeFilter !== "all") {
            filtered = filtered.filter((notification) => notification.type === typeFilter)
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((notification) => {
                return statusFilter === "read" ? notification.read : !notification.read
            })
        }

        setFilteredNotifications(filtered)
    }, [notifications, typeFilter, statusFilter])

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId)
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, read: true } : notification,
                ),
            )
        } catch (error) {
            console.error("Error marking notification as read:", error)
            setError("Failed to mark notification as read.")
        }
    }

    const handleMarkAllAsRead = async () => {
        if (!user) return

        setActionLoading(true)
        try {
            await notificationService.markAllAsRead(user.uid)
            setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
            setError("Failed to mark all notifications as read.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId)
            setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
        } catch (error) {
            console.error("Error deleting notification:", error)
            setError("Failed to delete notification.")
        }
    }

    const handleAction = (url: string) => {
        if (url.startsWith("/")) {
            router.push(url)
        } else {
            window.open(url, "_blank")
        }
    }

    const unreadCount = notifications.filter((n) => !n.read).length
    const notificationTypes = [
        { value: "all", label: "All Types" },
        { value: "info", label: "Information" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Warning" },
        { value: "error", label: "Error" },
        { value: "class", label: "Class Updates" },
        { value: "enrollment", label: "Enrollment" },
        { value: "system", label: "System" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading notifications...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-8 mb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="h-8 w-8" />
                        Notifications
                        {unreadCount > 0 && <Badge className="bg-red-100 text-red-800 border-red-200">{unreadCount} new</Badge>}
                    </h1>
                    <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
                </div>

                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                    >
                        <CheckCheck className="h-4 w-4" />
                        {actionLoading ? "Marking..." : "Mark All Read"}
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

            {/* Filters */}
            <div className="  rounded-lg shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {notificationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                    <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {typeFilter !== "all" || statusFilter !== "all" ? "No notifications found" : "No notifications yet"}
                    </h3>
                    <p className="text-gray-600">
                        {typeFilter !== "all" || statusFilter !== "all"
                            ? "Try adjusting your filters to see more notifications"
                            : "You'll see notifications here when you have new updates"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            onAction={handleAction}
                        />
                    ))}
                </div>
            )}

            {/* Load More Button (if needed) */}
            {filteredNotifications.length >= 50 && (
                <div className="text-center">
                    <Button variant="outline" onClick={loadNotifications} disabled={loading}>
                        Load More Notifications
                    </Button>
                </div>
            )}
        </div>
    )
}
