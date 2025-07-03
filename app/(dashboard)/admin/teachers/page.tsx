"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Mail, Phone, BookOpen, Users, MoreVertical, UserCheck, GraduationCap } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { userDataService, classService, type UserData, type ClassData } from "@/lib/firebase-admin"

interface TeacherWithStats extends UserData {
    totalClasses: number
    activeClasses: number
    totalStudents: number
    recentClasses: ClassData[]
}

export default function TeachersPage() {
    const { user } = useAuth()
    const [teachers, setTeachers] = useState<TeacherWithStats[]>([])
    const [filteredTeachers, setFilteredTeachers] = useState<TeacherWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    // Check if user has permission to view teachers
    const hasPermission = user?.role === "admin"

    useEffect(() => {
        if (!hasPermission) return

        const fetchTeachers = async () => {
            try {
                setLoading(true)

                // Get all teachers
                const teachersData = await userDataService.getUsersDataByRole("teacher")

                // Get all classes to calculate stats
                const allClasses = await classService.getAllClasses()

                // Calculate stats for each teacher
                const teachersWithStats: TeacherWithStats[] = await Promise.all(
                    teachersData.map(async (teacher) => {
                        const teacherClasses = allClasses.filter((cls) => cls.teacher_id === teacher.id)
                        const activeClasses = teacherClasses.filter((cls) => cls.class_status === "active")
                        const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.enrolled_students?.length || 0), 0)
                        const recentClasses = teacherClasses.slice(0, 3) // Get 3 most recent classes

                        return {
                            ...teacher,
                            totalClasses: teacherClasses.length,
                            activeClasses: activeClasses.length,
                            totalStudents,
                            recentClasses,
                        }
                    }),
                )

                setTeachers(teachersWithStats)
                setFilteredTeachers(teachersWithStats)
            } catch (error) {
                console.error("Error fetching teachers:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTeachers()
    }, [hasPermission])

    // Filter teachers based on search and filters
    useEffect(() => {
        let filtered = teachers

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (teacher) =>
                    teacher.name.toLowerCase().includes(searchLower) ||
                    teacher.email.toLowerCase().includes(searchLower) ||
                    teacher.department?.toLowerCase().includes(searchLower) ||
                    teacher.subject?.toLowerCase().includes(searchLower),
            )
        }

        // Department filter
        if (departmentFilter !== "all") {
            filtered = filtered.filter((teacher) => teacher.department === departmentFilter)
        }

        // Status filter (active = has active classes)
        if (statusFilter !== "all") {
            if (statusFilter === "active") {
                filtered = filtered.filter((teacher) => teacher.activeClasses > 0)
            } else {
                filtered = filtered.filter((teacher) => teacher.activeClasses === 0)
            }
        }

        setFilteredTeachers(filtered)
    }, [teachers, searchTerm, departmentFilter, statusFilter])

    if (!hasPermission) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                            <p className="text-muted-foreground">
                                You don't have permission to view teachers. This page is only accessible to administrators.
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
                        <h1 className="text-3xl font-bold">Teachers</h1>
                        <p className="text-muted-foreground">Manage and view all teaching staff</p>
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

    const departments = [...new Set(teachers.map((t) => t.department).filter(Boolean))]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mt-8">
                <div>
                    <h1 className="text-3xl font-bold">Teachers</h1>
                    <p className="text-muted-foreground">
                        Manage and view all teaching staff ({filteredTeachers.length} teachers)
                    </p>
                </div>
                <Button>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Add Teacher
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                                <p className="text-2xl font-bold">{teachers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Teachers</p>
                                <p className="text-2xl font-bold">{teachers.filter((t) => t.activeClasses > 0).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                                <p className="text-2xl font-bold">{teachers.reduce((sum, t) => sum + t.totalClasses, 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold">{teachers.reduce((sum, t) => sum + t.totalStudents, 0)}</p>
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
                                placeholder="Search teachers by name, email, department, or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept!}>
                                        {dept}
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

            {/* Teachers Grid */}
            {filteredTeachers.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || departmentFilter !== "all" || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "No teachers have been added yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTeachers.map((teacher) => (
                        <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                                            <AvatarFallback>
                                                {teacher.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{teacher.name}</CardTitle>
                                            <CardDescription>{teacher.email}</CardDescription>
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
                                                <Users className="mr-2 h-4 w-4" />
                                                View Students
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Teacher Info */}
                                <div className="space-y-2">
                                    {teacher.subject && (
                                        <div className="flex items-center text-sm">
                                            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Subject: {teacher.subject}</span>
                                        </div>
                                    )}
                                    {teacher.department && (
                                        <div className="flex items-center text-sm">
                                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Department: {teacher.department}</span>
                                        </div>
                                    )}
                                    {teacher.phone && (
                                        <div className="flex items-center text-sm">
                                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{teacher.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{teacher.totalClasses}</p>
                                        <p className="text-xs text-muted-foreground">Total Classes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{teacher.activeClasses}</p>
                                        <p className="text-xs text-muted-foreground">Active Classes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{teacher.totalStudents}</p>
                                        <p className="text-xs text-muted-foreground">Students</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex justify-between items-center pt-2">
                                    <Badge variant={teacher.activeClasses > 0 ? "default" : "secondary"}>
                                        {teacher.activeClasses > 0 ? "Active" : "Inactive"}
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
                                {teacher.recentClasses.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium mb-2">Recent Classes:</p>
                                        <div className="space-y-1">
                                            {teacher.recentClasses.slice(0, 2).map((cls) => (
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
