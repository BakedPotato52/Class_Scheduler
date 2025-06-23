"use client"

import type React from "react"

import { useEffect } from "react"
import { onMessageListener } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const messageListener = await onMessageListener()
        if (messageListener) {
          // Handle foreground messages
          // messageListener.then((payload: any) => {
          //   toast({
          //     title: payload.notification?.title || "New Notification",
          //     description: payload.notification?.body || "You have a new message",
          //   })
          // })
        }
      } catch (error) {
        console.error("Error setting up notifications:", error)
      }
    }

    setupNotifications()
  }, [toast])

  return <>{children}</>
}

