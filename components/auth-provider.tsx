"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserData {
  uid: string
  email: string | null
  name: string
  role: string
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  userRole?: string
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              role: userData.role,
            })
          } else {
            // Handle case where user exists in auth but not in firestore
            setUser(null)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setUserRole("admin")
      } else if (user.role === "teacher") {
        setUserRole("teacher")
      } else if (user.role === "student") {
        setUserRole("student")
      } else {
        setUserRole(undefined) // Or some default/guest role
      }
    } else {
      setUserRole(undefined)
    }
  }, [user]) // This effect runs only when the user state changes

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  )
}