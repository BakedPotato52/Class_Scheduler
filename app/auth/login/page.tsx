"use client"

import React from "react"
import { useState } from "react"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })
const MotionForm = dynamic(() => import("framer-motion").then((mod) => mod.motion.form), { ssr: false })


const gradientAnimation = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { delay: 0.2, duration: 0.8, ease: [0.4, 0.0, 0.2, 1] },
}


const staggeredFieldAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
}


const LoginPage: React.FC = React.memo(() => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)
      toast.success(
        "Welcome back!", {
        description: "Successfully signed in to your account.",
      })
      router.push("/")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const cardAnimation = useMemo(
    () => ({
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    }),
    [],
  )

  const formAnimation = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.1 },
    }),
    [],
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <MotionDiv initial={cardAnimation.initial} animate={cardAnimation.animate} transition={cardAnimation.transition}>
        <Card className="w-full max-w-md overflow-hidden">
          <MotionDiv
            initial={gradientAnimation.initial}
            animate={gradientAnimation.animate}
            className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          />
          <CardHeader className="space-y-2 text-center">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to your EduHub account</CardDescription>
            </MotionDiv>
          </CardHeader>
          <CardContent>
            <MotionForm
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={formAnimation.initial}
              animate={formAnimation.animate}
              transition={formAnimation.transition}
            >
              {error && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </MotionDiv>
              )}

              <MotionDiv
                initial={staggeredFieldAnimation.initial}
                animate={staggeredFieldAnimation.animate}
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </MotionDiv>

              <MotionDiv
                initial={staggeredFieldAnimation.initial}
                animate={staggeredFieldAnimation.animate}
              >
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </MotionDiv>
            </MotionForm>

            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary font-medium">
                  Create account
                </Link>
              </p>
            </MotionDiv>


          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}
)
LoginPage.displayName = "LoginPage"
export default LoginPage