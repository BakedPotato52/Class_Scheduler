"use client"

import type React from "react"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { profileService, UserProfile } from "@/lib/firebase-admin"

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

type ProfileContextType = {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  reloadProfile: () => void
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




type Props = {
  user: any
  userRole: string
  children: ReactNode
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined)
export const ProfileProvider = ({ user, userRole, children }: Props) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let userProfile = await profileService.getUserProfile(user.uid)

      if (!userProfile) {
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.name || user.email?.split("@")[0] || "User",
          email: user.email || "",
          role: userRole as "student" | "teacher" | "admin",
          joined_at: new Date() as any,
        }

        await profileService.createUserProfile(newProfile)
        userProfile = newProfile
      }

      setProfile(userProfile)
    } catch (err) {
      console.error("Error loading profile:", err)
      setError("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user, userRole])

  return (
    <ProfileContext.Provider value={{ profile, loading, error, reloadProfile: loadProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
