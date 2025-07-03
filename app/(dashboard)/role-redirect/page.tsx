'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

function redirect() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            if (user.role === "admin") {
                router.push("/admin")
            } else if (user.role === "teacher") {
                router.push("/teacher")
            } else {
                router.push("/student")
            }
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (user) {
        return null // Will redirect based on role
    }
    return (
        <div>

        </div>
    )
}

export default redirect
