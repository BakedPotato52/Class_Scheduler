"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClassCard } from "@/components/classes/class-card"
import CreateClassModal from "@/components/modals/create-class-modal"
import { classService, studentService, type ClassData } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

export default function ClassesPage() {
    const { user, userRole } = useAuth()
    const [classes, setClasses] = useState<ClassData[]>([])
    const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [enrollmentFilter, setEnrollmentFilter] = useState<string>("all")

    const loadClasses = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            let classesData: ClassData[] = []

            switch (userRole) {
                case "teacher":
                    classesData = await classService.getClassesByTeacher(user.uid)
                    break
                case "student":
                    classesData = await classService.getActiveClasses()
                    break
                case "admin":
                    classesData = await classService.getAllClasses()
                    break
                default:
                    classesData = []
            }

            setClasses(classesData)
            setFilteredClasses(classesData)
        } catch (error) {
            console.error("Error loading classes:", error)
            setError("Failed to load classes. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClasses()
    }, [user, userRole])

    // Filter classes based on search term, status, and enrollment
    useEffect(() => {
        let filtered = classes

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (classItem) =>
                    classItem.class_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    classItem.teacher_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    classItem.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((classItem) => classItem.class_status === statusFilter)
        }

        // Enrollment filter for students
        if (userRole === "student" && enrollmentFilter !== "all") {
            filtered = filtered.filter((classItem) => {
                const isEnrolled = classItem.enrolled_students?.includes(user?.uid || "")
                return enrollmentFilter === "enrolled" ? isEnrolled : !isEnrolled
            })
        }

        setFilteredClasses(filtered)
    }, [classes, searchTerm, statusFilter, enrollmentFilter, userRole, user])

    const handleEnroll = async (classId: string) => {
        if (!user) return

        try {
            await studentService.enrollInClass(user.uid, classId)
            await loadClasses()
        } catch (error) {
            console.error("Error enrolling in class:", error)
            setError("Failed to enroll in class. Please try again.")
        }
    }

    const handleUnenroll = async (classId: string) => {
        if (!user) return

        try {
            await studentService.unenrollFromClass(user.uid, classId)
            await loadClasses()
        } catch (error) {
            console.error("Error unenrolling from class:", error)
            setError("Failed to unenroll from class. Please try again.")
        }
    }

    const handleDeleteClass = async (classId: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return

        try {
            await classService.deleteClass(classId)
            await loadClasses()
        } catch (error) {
            console.error("Error deleting class:", error)
            setError("Failed to delete class. Please try again.")
        }
    }

    const isEnrolled = (classItem: ClassData) => {
        return classItem.enrolled_students?.includes(user?.uid || "") || false
    }

    const getPageTitle = () => {
        switch (userRole) {
            case "teacher":
                return "My Classes"
            case "student":
                return "Available Classes"
            case "admin":
                return "All Classes"
            default:
                return "Classes"
        }
    }

    const getPageSubtitle = () => {
        switch (userRole) {
            case "teacher":
                return "Manage and monitor your classes"
            case "student":
                return "Discover and join classes"
            case "admin":
                return "Monitor all platform classes"
            default:
                return "Class management"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading classes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                    <p className="text-gray-600 mt-1">{getPageSubtitle()}</p>
                </div>
                {userRole === "teacher" && (
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Class
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search classes, teachers, or subjects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Enrollment Filter (Students only) */}
                    {userRole === "student" && (
                        <Select value={enrollmentFilter} onValueChange={setEnrollmentFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Enrollment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                <SelectItem value="enrolled">My Classes</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Classes Grid */}
            {filteredClasses.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || statusFilter !== "all" || enrollmentFilter !== "all"
                            ? "No classes found"
                            : "No classes available"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== "all" || enrollmentFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : userRole === "teacher"
                                ? "Create your first class to get started"
                                : "Check back later for new classes"}
                    </p>
                    {userRole === "teacher" && !searchTerm && statusFilter === "all" && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Class
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClasses.map((classItem) => (
                        <ClassCard
                            key={classItem.id}
                            classData={classItem}
                            onEnroll={handleEnroll}
                            onUnenroll={handleUnenroll}
                            onDelete={handleDeleteClass}
                            isEnrolled={isEnrolled(classItem)}
                            isLoading={loading}
                        />
                    ))}
                </div>
            )}

            {/* Create Class Modal */}
            {userRole === "teacher" && (
                <CreateClassModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={loadClasses} />
            )}
        </div>
    )
}
