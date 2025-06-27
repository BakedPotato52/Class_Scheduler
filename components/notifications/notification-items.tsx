"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
    Bell,
    Check,
    Trash2,
    ExternalLink,
    User,
    BookOpen,
    AlertCircle,
    Info,
    CheckCircle,
    AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { NotificationData } from "@/lib/firebase-admin"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
    notification: NotificationData
    onMarkAsRead: (id: string) => void
    onDelete: (id: string) => void
    onAction?: (url: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onAction }: NotificationItemProps) {
    const [isLoading, setIsLoading] = useState(false)

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-600" />
            case "class":
                return <BookOpen className="h-5 w-5 text-blue-600" />
            case "enrollment":
                return <User className="h-5 w-5 text-purple-600" />
            case "system":
                return <Bell className="h-5 w-5 text-gray-600" />
            default:
                return <Info className="h-5 w-5 text-blue-600" />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "success":
                return "border-l-green-500 bg-green-50"
            case "warning":
                return "border-l-yellow-500 bg-yellow-50"
            case "error":
                return "border-l-red-500 bg-red-50"
            case "class":
                return "border-l-blue-500 bg-blue-50"
            case "enrollment":
                return "border-l-purple-500 bg-purple-50"
            case "system":
                return "border-l-gray-500 bg-gray-50"
            default:
                return "border-l-blue-500 bg-blue-50"
        }
    }

    const handleMarkAsRead = async () => {
        if (notification.read) return

        setIsLoading(true)
        try {
            await onMarkAsRead(notification.id!)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await onDelete(notification.id!)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = () => {
        if (notification.action_url) {
            onAction?.(notification.action_url)
        }
    }

    const formatTimestamp = (timestamp: any) => {
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            return formatDistanceToNow(date, { addSuffix: true })
        } catch (error) {
            return "Unknown time"
        }
    }

    return (
        <Card
            className={cn(
                "border-l-4 transition-all duration-200 hover:shadow-md",
                getNotificationColor(notification.type),
                !notification.read && "ring-2 ring-blue-100",
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className={cn("font-medium text-gray-900", !notification.read && "font-semibold")}>
                                {notification.title}
                            </h3>
                            {!notification.read && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    New
                                </Badge>
                            )}
                        </div>

                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">{notification.message}</p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                                <span>{formatTimestamp(notification.created_at)}</span>
                                {notification.sender_name && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {notification.sender_name}
                                        {notification.sender_role && (
                                            <Badge variant="outline" className="text-xs">
                                                {notification.sender_role}
                                            </Badge>
                                        )}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {notification.action_url && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleAction}
                                        disabled={isLoading}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                )}

                                {!notification.read && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleMarkAsRead}
                                        disabled={isLoading}
                                        className="h-7 px-2 text-xs"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark Read
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
