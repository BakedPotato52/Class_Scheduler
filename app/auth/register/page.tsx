"use client"

import React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Link from "next/link"
import { toast } from "sonner"
import { GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import dynamic from "next/dynamic"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })
const MotionForm = dynamic(() => import("framer-motion").then((mod) => mod.motion.form), { ssr: false })

const RegisterPage: React.FC = React.memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  })
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error("Please enter your full name")
      }
      if (!formData.email.trim()) {
        throw new Error("Please enter your email address")
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }
      if (!formData.role) {
        throw new Error("Please select your role")
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      // Create user document in Firestore with retry logic
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          role: formData.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } catch (firestoreError: any) {
        console.error("Firestore error:", firestoreError)
        // If Firestore fails, we should still allow the user to continue
        // as the authentication was successful
        toast.success(
          "Account Created", {
          description: "Account created successfully! Some features may be limited until setup is complete.",
        })
        router.push("/")
        return
      }

      toast.success("Success", {
        description: "Account created successfully!",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Registration error:", error)

      // Provide user-friendly error messages
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please try signing in instead.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "permission-denied" || error.message.includes("permissions")) {
        setError("Account created but profile setup failed. Please contact support or try signing in.")
      } else {
        setError(error.message || "Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Enhanced animations
  const cardAnimation = useMemo(
    () => ({
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" },
    }),
    []
  )

  const formAnimation = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.2, duration: 0.4, ease: "easeOut" },
    }),
    []
  )

  const gradientAnimation = useMemo(
    () => ({
      initial: { x: "-100%" },
      animate: { x: 0 },
      transition: { type: "spring", stiffness: 100, damping: 15 },
    }),
    []
  )

  const staggeredFieldAnimation = useMemo(
    () => ({
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 },
    }),
    []
  )

  const fieldVar = useMemo(() => ({
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
  }), [])



  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <MotionDiv
        {...cardAnimation}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <Card className="w-full max-w-md overflow-hidden">
          {/* gradient bar */}
          <MotionDiv
            {...gradientAnimation}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2, duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"
          />

          {/* header */}
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>

          {/* form */}
          <CardContent>
            <MotionForm
              onSubmit={handleRegister}
              {...formAnimation}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4"
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
                variants={fieldVar}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </MotionDiv>

              <MotionDiv
                variants={fieldVar}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </MotionDiv>

              <MotionDiv
                variants={fieldVar}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </MotionDiv>

              <MotionDiv
                variants={fieldVar}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.4, duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Label className="mb-2">Role</Label>
                <RadioGroup defaultValue="student" className="flex gap-4" onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="teacher" />
                    <Label htmlFor="teacher">Teacher</Label>
                  </div>
                </RadioGroup>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account…" : "Register"}
                </Button>
              </MotionDiv>
            </MotionForm>

            {/* footer link */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              Already have an account?{" "}
              <Link href="/" className="underline underline-offset-4 hover:text-primary font-medium">
                Sign in
              </Link>
            </MotionDiv>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
})
RegisterPage.displayName = "RegisterPage"
export default RegisterPage
