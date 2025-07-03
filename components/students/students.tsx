"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Search,
    Filter,
    Mail,
    Phone,
    BookOpen,
    Users,
    MoreVertical,
    GraduationCap,
    UserPlus,
    TrendingUp,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { userDataService, classService, type UserData, type ClassData } from "@/lib/firebase-admin"

interface StudentWithStats extends UserData {
    enrolledClasses: ClassData[]
    activeEnrollments: number
    completedClasses: number
    recentClasses: ClassData[]
}

export default function StudentsPage() {
    const { user } = useAuth()
    const [students, setStudents] = useState<StudentWithStats[]>([])
    const [filteredStudents, setFilteredStudents] = useState<StudentWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [gradeFilter, setGradeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // Check if user has permission to view students
    const hasPermission = user?.role === "teacher" || user?.role === "admin"

    useEffect(() => {
        if (!hasPermission) return

        const fetchStudents = async () => {
            try {
                setLoading(true)

                // Get all students
                const studentsData = await userDataService.getUsersDataByRole("student")

                // Get all classes to calculate stats
                const allClasses = await classService.getAllClasses()

                // Calculate stats for each student
                const studentsWithStats: StudentWithStats[] = await Promise.all(
                    studentsData.map(async (student) => {
                        // Find classes where student is enrolled
                        const enrolledClasses = allClasses.filter((cls) => cls.enrolled_students?.includes(student.id))

                        const activeEnrollments = enrolledClasses.filter((cls) => cls.class_status === "active").length
                        const completedClasses = enrolledClasses.filter((cls) => cls.class_status === "completed").length
                        const recentClasses = enrolledClasses
                            .sort((a, b) => {
                                const dateA = a.created_at?.toDate() || new Date(0)
                                const dateB = b.created_at?.toDate() || new Date(0)
                                return dateB.getTime() - dateA.getTime()
                            })
                            .slice(0, 3)

                        return {
                            ...student,
                            enrolledClasses,
                            activeEnrollments,
                            completedClasses,
                            recentClasses,
                        }
                    }),
                )

                setStudents(studentsWithStats)
                setFilteredStudents(studentsWithStats)
            } catch (error) {
                console.error("Error fetching students:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStudents()
    }, [hasPermission])

    // Filter students based on search and filters
    useEffect(() => {
        let filtered = students

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (student) =>
                    student.name.toLowerCase().includes(searchLower) ||
                    student.email.toLowerCase().includes(searchLower) ||
                    student.id.toLowerCase().includes(searchLower),
            )
        }

        // Grade filter
        if (gradeFilter !== "all") {
            filtered = filtered.filter((student) => student.grade === gradeFilter)
        }

        // Status filter (active = has active enrollments)
        if (statusFilter !== "all") {
            if (statusFilter === "active") {
                filtered = filtered.filter((student) => student.activeEnrollments > 0)
            } else {
                filtered = filtered.filter((student) => student.activeEnrollments === 0)
            }
        }

        setFilteredStudents(filtered)
    }, [students, searchTerm, gradeFilter, statusFilter])

    if (!hasPermission) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                            <p className="text-muted-foreground">
                                You don't have permission to view students. This page is accessible to teachers and administrators.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Students</h1>
                        <p className="text-muted-foreground">Monitor student progress and enrollments</p>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const grades = [...new Set(students.map((s) => s.grade).filter(Boolean))]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mt-8">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-muted-foreground">
                        Monitor student progress and enrollments ({filteredStudents.length} students)
                    </p>
                </div>
                {user?.role === "admin" && (
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold">{students.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                                <p className="text-2xl font-bold">{students.filter((s) => s.activeEnrollments > 0).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                                <p className="text-2xl font-bold">{students.reduce((sum, s) => sum + s.enrolledClasses.length, 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-4 w-4 text-purple-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Avg Enrollments</p>
                                <p className="text-2xl font-bold">
                                    {students.length > 0
                                        ? Math.round(
                                            (students.reduce((sum, s) => sum + s.enrolledClasses.length, 0) / students.length) * 10,
                                        ) / 10
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search students by name, email, or student ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={gradeFilter} onValueChange={setGradeFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue placeholder="Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grades</SelectItem>
                                {grades.map((grade) => (
                                    <SelectItem key={grade} value={grade!}>
                                        {grade}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No students found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || gradeFilter !== "all" || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "No students have been enrolled yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                            <AvatarFallback>
                                                {student.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{student.name}</CardTitle>
                                            <CardDescription>{student.email}</CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                View Classes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                View Progress
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Student Info */}
                                <div className="space-y-2">
                                    {student.grade && (
                                        <div className="flex items-center text-sm">
                                            <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Grade: {student.grade}</span>
                                        </div>
                                    )}
                                    {student.phone && (
                                        <div className="flex items-center text-sm">
                                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{student.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm">
                                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>Student ID: {student.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{student.enrolledClasses.length}</p>
                                        <p className="text-xs text-muted-foreground">Total Classes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{student.activeEnrollments}</p>
                                        <p className="text-xs text-muted-foreground">Active</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{student.completedClasses}</p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex justify-between items-center pt-2">
                                    <Badge variant={student.activeEnrollments > 0 ? "default" : "secondary"}>
                                        {student.activeEnrollments > 0 ? "Active" : "Inactive"}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <BookOpen className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Recent Classes */}
                                {student.recentClasses.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium mb-2">Recent Classes:</p>
                                        <div className="space-y-1">
                                            {student.recentClasses.slice(0, 2).map((cls) => (
                                                <div key={cls.id} className="text-xs text-muted-foreground">
                                                    • {cls.class_title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
