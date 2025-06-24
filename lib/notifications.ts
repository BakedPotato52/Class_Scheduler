import { messaging } from "./firebase"
import { getToken, onMessage } from "firebase/messaging"

export const requestNotificationPermission = async () => {
  try {
    const messagingInstance = await messaging()
    if (!messagingInstance) {
      console.log("Firebase messaging is not supported in this browser")
      return null
    }

    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      const token = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      console.log("FCM Token:", token)
      return token
    } else {
      console.log("Notification permission denied")
      return null
    }
  } catch (error) {
    console.error("Error getting notification permission:", error)
    return null
  }
}

export const onMessageListener = async () => {
  const messagingInstance = await messaging()
  if (!messagingInstance) return

  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      resolve(payload)
    })
  })
}

export const showNotification = (title: string, body: string) => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        // vibrate: [200, 100, 200],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
        },
      })
    })
  }
}
