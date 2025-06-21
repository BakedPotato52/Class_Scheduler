"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, Bell, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { requestNotificationPermission } from "@/lib/notifications"

interface ClassSession {
  id: string
  title: string
  date: string
  time: string
  duration: number
  description: string
  createdAt: string
}

export default function StudentDashboard() {
  const { user, loading } = useAuth()
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<ClassSession[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchSessions()
    requestNotificationPermission()
  }, [])

  const fetchSessions = async () => {
    try {
      const q = query(collection(db, "sessions"), orderBy("date", "asc"))
      const querySnapshot = await getDocs(q)
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClassSession[]

      setSessions(sessionsData)

      // Filter upcoming sessions (next 7 days)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = sessionsData.filter((session) => {
        const sessionDate = new Date(session.date)
        return sessionDate >= now && sessionDate <= nextWeek
      })
      setUpcomingSessions(upcoming)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const sessionDate = new Date(`${date}T${time}`)
    return sessionDate.toLocaleString()
  }

  const isSessionToday = (date: string) => {
    const today = new Date().toDateString()
    const sessionDate = new Date(date).toDateString()
    return today === sessionDate
  }

  const isSessionUpcoming = (date: string, time: string) => {
    const sessionDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return sessionDateTime > now
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.filter((s) => isSessionToday(s.date)).length}</div>
            </CardContent>
          </Card>
        </div>

        {upcomingSessions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>Your sessions for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border ${
                      isSessionToday(session.date) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{session.title}</h3>
                        <p className="text-gray-600 mb-2">{session.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDateTime(session.date, session.time)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {session.duration} minutes
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {isSessionToday(session.date) && <Badge variant="default">Today</Badge>}
                        {isSessionUpcoming(session.date, session.time) && <Badge variant="outline">Upcoming</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>Complete list of your class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{session.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDateTime(session.date, session.time)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.duration} minutes
                        </span>
                      </div>
                    </div>
                    <Badge variant={isSessionUpcoming(session.date, session.time) ? "default" : "secondary"}>
                      {isSessionUpcoming(session.date, session.time) ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
