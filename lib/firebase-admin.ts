import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDoc,
    Timestamp,
    limit,
    setDoc,
} from "firebase/firestore"
import { db } from "./firebase"

// Types
export interface TeacherInfo {
    id: string
    name: string
    email: string
    subject: string
    bio?: string
    avatar?: string
}

export interface ClassData {
    id?: string
    class_title: string
    teacher_id: string
    teacher_info: TeacherInfo
    start_time: string
    end_time: string
    max_students: number
    meeting_link: string
    class_status: "active" | "inactive" | "completed"
    duration: string
    description?: string
    subject?: string
    created_at?: Timestamp
    enrolled_students?: string[]
}

export interface StudentData {
    id: string
    name: string
    email: string
    enrolled_classes: string[]
    created_at: Timestamp
}

// Updated types for notifications, profile, and settings
export interface NotificationData {
    id?: string
    user_id: string
    title: string
    message: string
    type: "info" | "success" | "warning" | "error" | "class" | "enrollment" | "system"
    read: boolean
    sender_id?: string
    sender_name?: string
    sender_role?: string
    class_id?: string
    created_at: Timestamp
    action_url?: string
}

export interface UserProfile {
    id: string
    name: string
    email: string
    role: "student" | "teacher" | "admin"
    avatar?: string
    avatar_public_id?: string // Cloudinary public ID for deletion
    bio?: string
    phone?: string
    location?: string
    subject?: string // For teachers
    grade?: string // For students
    department?: string // For admins
    joined_at: Timestamp
    last_active?: Timestamp
}

export interface UserData {
    id: string
    name: string
    email: string
    role: "student" | "teacher" | "admin"
    avatar?: string
    avatar_public_id?: string // Cloudinary public ID for deletion
    bio?: string
    phone?: string
    location?: string
    subject?: string // For teachers
    grade?: string // For students
    department?: string // For admins
    created_at: Timestamp
    updated_at?: Timestamp
}

export interface UserSettings {
    id: string
    user_id: string
    notifications: {
        email_enabled: boolean
        push_enabled: boolean
        class_reminders: boolean
        enrollment_updates: boolean
        system_updates: boolean
        marketing_emails: boolean
    }
    preferences: {
        theme: "light" | "dark" | "system"
        language: string
        timezone: string
        date_format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
        time_format: "12h" | "24h"
    }
    privacy: {
        profile_visibility: "public" | "private" | "contacts"
        show_email: boolean
        show_phone: boolean
        show_location: boolean
    }
    updated_at: Timestamp
}

// Enhanced Class CRUD Operations
export const classService = {
    // Create a new class
    async createClass(classData: Omit<ClassData, "id" | "created_at">): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "classes"), {
                ...classData,
                created_at: Timestamp.now(),
                enrolled_students: [],
            })
            return docRef.id
        } catch (error) {
            console.error("Error creating class:", error)
            throw error
        }
    },

    // Get all classes with optional filtering
    async getAllClasses(filters?: {
        status?: string
        teacherId?: string
        studentId?: string
        limit?: number
    }): Promise<ClassData[]> {
        try {
            let q = query(collection(db, "classes"), orderBy("created_at", "desc"))

            if (filters?.status) {
                q = query(q, where("class_status", "==", filters.status))
            }

            if (filters?.teacherId) {
                q = query(q, where("teacher_id", "==", filters.teacherId))
            }

            if (filters?.limit) {
                q = query(q, limit(filters.limit))
            }

            const querySnapshot = await getDocs(q)
            let classes = querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as ClassData,
            )

            // Filter by student enrollment if studentId is provided
            if (filters?.studentId) {
                classes = classes.filter((classItem) => classItem.enrolled_students?.includes(filters.studentId!))
            }

            return classes
        } catch (error) {
            console.error("Error fetching classes:", error)
            throw error
        }
    },

    // Get classes by teacher
    async getClassesByTeacher(teacherId: string): Promise<ClassData[]> {
        try {
            const q = query(collection(db, "classes"), where("teacher_id", "==", teacherId), orderBy("created_at", "desc"))
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as ClassData,
            )
        } catch (error) {
            console.error("Error fetching teacher classes:", error)
            throw error
        }
    },

    // Get active classes for students
    async getActiveClasses(): Promise<ClassData[]> {
        try {
            const q = query(collection(db, "classes"), where("class_status", "==", "active"), orderBy("created_at", "desc"))
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as ClassData,
            )
        } catch (error) {
            console.error("Error fetching active classes:", error)
            throw error
        }
    },

    // Get classes for a specific date range (for calendar)
    async getClassesByDateRange(startDate: Date, endDate: Date): Promise<ClassData[]> {
        try {
            const q = query(collection(db, "classes"), orderBy("start_time", "asc"))
            const querySnapshot = await getDocs(q)

            const classes = querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as ClassData,
            )

            // Filter by date range
            return classes.filter((classItem) => {
                const classStart = new Date(classItem.start_time)
                return classStart >= startDate && classStart <= endDate
            })
        } catch (error) {
            console.error("Error fetching classes by date range:", error)
            throw error
        }
    },

    // Update class
    async updateClass(classId: string, updates: Partial<ClassData>): Promise<void> {
        try {
            const classRef = doc(db, "classes", classId)
            await updateDoc(classRef, updates)
        } catch (error) {
            console.error("Error updating class:", error)
            throw error
        }
    },

    // Delete class
    async deleteClass(classId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "classes", classId))
        } catch (error) {
            console.error("Error deleting class:", error)
            throw error
        }
    },

    // Get class by ID
    async getClassById(classId: string): Promise<ClassData | null> {
        try {
            const docRef = doc(db, "classes", classId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as ClassData
            }
            return null
        } catch (error) {
            console.error("Error fetching class:", error)
            throw error
        }
    },
}

// Teacher CRUD Operations
export const teacherService = {
    // Create teacher profile
    async createTeacher(teacherData: Omit<TeacherInfo, "id">): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "teachers"), {
                ...teacherData,
                created_at: Timestamp.now(),
            })
            return docRef.id
        } catch (error) {
            console.error("Error creating teacher:", error)
            throw error
        }
    },

    // Get all teachers
    async getAllTeachers(): Promise<TeacherInfo[]> {
        try {
            const querySnapshot = await getDocs(collection(db, "teachers"))
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as TeacherInfo,
            )
        } catch (error) {
            console.error("Error fetching teachers:", error)
            throw error
        }
    },

    // Get teacher by ID
    async getTeacherById(teacherId: string): Promise<TeacherInfo | null> {
        try {
            const docRef = doc(db, "teachers", teacherId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as TeacherInfo
            }
            return null
        } catch (error) {
            console.error("Error fetching teacher:", error)
            throw error
        }
    },
}

// Student CRUD Operations
export const studentService = {
    // Get all students
    async getAllStudents(): Promise<StudentData[]> {
        try {
            const querySnapshot = await getDocs(collection(db, "students"))
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as StudentData,
            )
        } catch (error) {
            console.error("Error fetching students:", error)
            throw error
        }
    },

    // Enroll student in class
    async enrollInClass(studentId: string, classId: string): Promise<void> {
        try {
            // Update class with new student
            const classRef = doc(db, "classes", classId)
            const classDoc = await getDoc(classRef)

            if (classDoc.exists()) {
                const classData = classDoc.data() as ClassData
                const enrolledStudents = classData.enrolled_students || []

                if (!enrolledStudents.includes(studentId)) {
                    await updateDoc(classRef, {
                        enrolled_students: [...enrolledStudents, studentId],
                    })
                }
            }
        } catch (error) {
            console.error("Error enrolling student:", error)
            throw error
        }
    },

    // Unenroll student from class
    async unenrollFromClass(studentId: string, classId: string): Promise<void> {
        try {
            const classRef = doc(db, "classes", classId)
            const classDoc = await getDoc(classRef)

            if (classDoc.exists()) {
                const classData = classDoc.data() as ClassData
                const enrolledStudents = classData.enrolled_students || []

                const updatedStudents = enrolledStudents.filter((id) => id !== studentId)
                await updateDoc(classRef, {
                    enrolled_students: updatedStudents,
                })
            }
        } catch (error) {
            console.error("Error unenrolling student:", error)
            throw error
        }
    },
}

// Notification Service
export const notificationService = {
    // Create notification
    async createNotification(notificationData: Omit<NotificationData, "id" | "created_at">): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "notifications"), {
                ...notificationData,
                created_at: Timestamp.now(),
            })
            return docRef.id
        } catch (error) {
            console.error("Error creating notification:", error)
            throw error
        }
    },

    // Get notifications for user
    async getNotificationsByUser(userId: string, limitCount = 50): Promise<NotificationData[]> {
        try {
            const q = query(
                collection(db, "notifications"),
                where("user_id", "==", userId),
                orderBy("created_at", "desc"),
                limit(limitCount),
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as NotificationData,
            )
        } catch (error) {
            console.error("Error fetching notifications:", error)
            throw error
        }
    },

    // Mark notification as read
    async markAsRead(notificationId: string): Promise<void> {
        try {
            const notificationRef = doc(db, "notifications", notificationId)
            await updateDoc(notificationRef, { read: true })
        } catch (error) {
            console.error("Error marking notification as read:", error)
            throw error
        }
    },

    // Mark all notifications as read for user
    async markAllAsRead(userId: string): Promise<void> {
        try {
            const q = query(collection(db, "notifications"), where("user_id", "==", userId), where("read", "==", false))
            const querySnapshot = await getDocs(q)

            const updatePromises = querySnapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }))
            await Promise.all(updatePromises)
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
            throw error
        }
    },

    // Delete notification
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "notifications", notificationId))
        } catch (error) {
            console.error("Error deleting notification:", error)
            throw error
        }
    },

    // Get unread count
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const q = query(collection(db, "notifications"), where("user_id", "==", userId), where("read", "==", false))
            const querySnapshot = await getDocs(q)
            return querySnapshot.size
        } catch (error) {
            console.error("Error getting unread count:", error)
            return 0
        }
    },
}

// Profile Service
export const profileService = {
    // Get user profile
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const docRef = doc(db, "profiles", userId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as UserProfile
            }
            return null
        } catch (error) {
            console.error("Error fetching user profile:", error)
            throw error
        }
    },

    // Create or update user profile
    async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
        try {
            const profileRef = doc(db, "profiles", userId)
            await setDoc(
                profileRef,
                {
                    ...profileData,
                    id: userId,
                    last_active: Timestamp.now(),
                },
                { merge: true },
            )
        } catch (error) {
            console.error("Error updating user profile:", error)
            throw error
        }
    },

    // Create initial profile
    async createUserProfile(profileData: UserProfile): Promise<void> {
        try {
            const profileRef = doc(db, "profiles", profileData.id)
            await setDoc(profileRef, {
                ...profileData,
                joined_at: Timestamp.now(),
                last_active: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error creating user profile:", error)
            throw error
        }
    },
}

// UserData Service (for userData collection)
export const userDataService = {
    // Get user data
    async getUserData(userId: string): Promise<UserData | null> {
        try {
            const docRef = doc(db, "userData", userId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as UserData
            }
            return null
        } catch (error) {
            console.error("Error fetching user data:", error)
            throw error
        }
    },

    // Create or update user data
    async updateUserData(userId: string, userData: Partial<UserData>): Promise<void> {
        try {
            const userDataRef = doc(db, "userData", userId)
            await setDoc(
                userDataRef,
                {
                    ...userData,
                    id: userId,
                    updated_at: Timestamp.now(),
                },
                { merge: true },
            )
        } catch (error) {
            console.error("Error updating user data:", error)
            throw error
        }
    },

    // Create initial user data
    async createUserData(userData: UserData): Promise<void> {
        try {
            const userDataRef = doc(db, "userData", userData.id)
            await setDoc(userDataRef, {
                ...userData,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error creating user data:", error)
            throw error
        }
    },

    // Get all users data
    async getAllUsersData(): Promise<UserData[]> {
        try {
            const querySnapshot = await getDocs(collection(db, "userData"))
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as UserData,
            )
        } catch (error) {
            console.error("Error fetching all users data:", error)
            throw error
        }
    },

    // Get users data by role
    async getUsersDataByRole(role: "student" | "teacher" | "admin"): Promise<UserData[]> {
        try {
            const q = query(collection(db, "userData"), where("role", "==", role))
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as UserData,
            )
        } catch (error) {
            console.error("Error fetching users data by role:", error)
            throw error
        }
    },

    // Search users by name or email
    async searchUsers(searchTerm: string): Promise<UserData[]> {
        try {
            const allUsers = await this.getAllUsersData()
            const searchLower = searchTerm.toLowerCase()

            return allUsers.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            )
        } catch (error) {
            console.error("Error searching users:", error)
            throw error
        }
    },

    // Get users with pagination
    async getUsersWithPagination(limitCount: number = 20): Promise<UserData[]> {
        try {
            const q = query(
                collection(db, "userData"),
                orderBy("created_at", "desc"),
                limit(limitCount)
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    }) as UserData,
            )
        } catch (error) {
            console.error("Error fetching users with pagination:", error)
            throw error
        }
    },

    // Delete user data
    async deleteUserData(userId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "userData", userId))
        } catch (error) {
            console.error("Error deleting user data:", error)
            throw error
        }
    },

    // Batch update users data
    async batchUpdateUsersData(
        updates: Array<{ userId: string; data: Partial<UserData> }>
    ): Promise<void> {
        try {
            const updatePromises = updates.map(({ userId, data }) =>
                this.updateUserData(userId, data)
            )
            await Promise.all(updatePromises)
        } catch (error) {
            console.error("Error batch updating users data:", error)
            throw error
        }
    },
}

// Settings Service
export const settingsService = {
    // Get user settings
    async getUserSettings(userId: string): Promise<UserSettings | null> {
        try {
            const docRef = doc(db, "settings", userId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                } as UserSettings
            }
            return null
        } catch (error) {
            console.error("Error fetching user settings:", error)
            throw error
        }
    },

    // Create or update user settings
    async updateUserSettings(userId: string, settingsData: Partial<UserSettings>): Promise<void> {
        try {
            const settingsRef = doc(db, "settings", userId)
            await setDoc(
                settingsRef,
                {
                    ...settingsData,
                    id: userId,
                    user_id: userId,
                    updated_at: Timestamp.now(),
                },
                { merge: true },
            )
        } catch (error) {
            console.error("Error updating user settings:", error)
            throw error
        }
    },

    // Create default settings
    async createDefaultSettings(userId: string): Promise<UserSettings> {
        const defaultSettings: UserSettings = {
            id: userId,
            user_id: userId,
            notifications: {
                email_enabled: true,
                push_enabled: true,
                class_reminders: true,
                enrollment_updates: true,
                system_updates: true,
                marketing_emails: false,
            },
            preferences: {
                theme: "system",
                language: "en",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                date_format: "MM/DD/YYYY",
                time_format: "12h",
            },
            privacy: {
                profile_visibility: "public",
                show_email: false,
                show_phone: false,
                show_location: false,
            },
            updated_at: Timestamp.now(),
        }

        try {
            const settingsRef = doc(db, "settings", userId)
            await setDoc(settingsRef, defaultSettings)
            return defaultSettings
        } catch (error) {
            console.error("Error creating default settings:", error)
            throw error
        }
    },
}

// Admin Analytics
export const adminService = {
    // Get dashboard statistics
    async getDashboardStats() {
        try {
            const [teachers, classes, students, allUsers] = await Promise.all([
                teacherService.getAllTeachers(),
                classService.getAllClasses(),
                studentService.getAllStudents(),
                userDataService.getAllUsersData(),
            ])

            const activeClasses = classes.filter((c) => c.class_status === "active")
            const completedClasses = classes.filter((c) => c.class_status === "completed")
            const teachersWithActiveClasses = new Set(activeClasses.map((c) => c.teacher_id)).size

            // Calculate enrollment statistics
            const totalEnrollments = classes.reduce((sum, cls) => sum + (cls.enrolled_students?.length || 0), 0)
            const avgEnrollmentPerClass = classes.length > 0 ? totalEnrollments / classes.length : 0

            // Calculate completion rate
            const completionRate = classes.length > 0 ? (completedClasses.length / classes.length) * 100 : 0

            return {
                totalTeachers: teachers.length,
                activeTeachers: teachersWithActiveClasses,
                totalClasses: classes.length,
                activeClasses: activeClasses.length,
                totalStudents: students.length,
                completedClasses: completedClasses.length,
                totalUsers: allUsers.length,
                totalEnrollments,
                avgEnrollmentPerClass: Math.round(avgEnrollmentPerClass * 10) / 10,
                completionRate: Math.round(completionRate * 10) / 10,
                usersByRole: {
                    students: allUsers.filter(u => u.role === 'student').length,
                    teachers: allUsers.filter(u => u.role === 'teacher').length,
                    admins: allUsers.filter(u => u.role === 'admin').length,
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error)
            throw error
        }
    },

    // Get user growth data for charts
    async getUserGrowthData(days: number = 30): Promise<Array<{ date: string; users: number }>> {
        try {
            const allUsers = await userDataService.getAllUsersData()
            const now = new Date()
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

            // Group users by date
            const usersByDate: { [key: string]: number } = {}

            // Initialize all dates with 0
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
                const dateStr = date.toISOString().split('T')[0]
                usersByDate[dateStr] = 0
            }

            // Count users by creation date
            allUsers.forEach(user => {
                if (user.created_at) {
                    const userDate = user.created_at.toDate()
                    if (userDate >= startDate) {
                        const dateStr = userDate.toISOString().split('T')[0]
                        if (usersByDate[dateStr] !== undefined) {
                            usersByDate[dateStr]++
                        }
                    }
                }
            })

            return Object.entries(usersByDate).map(([date, users]) => ({
                date,
                users
            }))
        } catch (error) {
            console.error("Error fetching user growth data:", error)
            return []
        }
    },

    // Get class statistics by status
    async getClassStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
        try {
            const classes = await classService.getAllClasses()
            const statsByStatus: { [key: string]: number } = {
                active: 0,
                inactive: 0,
                completed: 0
            }

            classes.forEach(cls => {
                statsByStatus[cls.class_status] = (statsByStatus[cls.class_status] || 0) + 1
            })

            return Object.entries(statsByStatus).map(([status, count]) => ({
                status,
                count
            }))
        } catch (error) {
            console.error("Error fetching class stats by status:", error)
            return []
        }
    },

    // Get enrollment trends
    async getEnrollmentTrends(days: number = 30): Promise<Array<{ date: string; enrollments: number }>> {
        try {
            const classes = await classService.getAllClasses()
            const now = new Date()
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

            // Initialize dates
            const enrollmentsByDate: { [key: string]: number } = {}
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
                const dateStr = date.toISOString().split('T')[0]
                enrollmentsByDate[dateStr] = 0
            }

            // Count enrollments by class creation date (approximation)
            classes.forEach(cls => {
                if (cls.created_at) {
                    const classDate = cls.created_at.toDate()
                    if (classDate >= startDate) {
                        const dateStr = classDate.toISOString().split('T')[0]
                        if (enrollmentsByDate[dateStr] !== undefined) {
                            enrollmentsByDate[dateStr] += cls.enrolled_students?.length || 0
                        }
                    }
                }
            })

            return Object.entries(enrollmentsByDate).map(([date, enrollments]) => ({
                date,
                enrollments
            }))
        } catch (error) {
            console.error("Error fetching enrollment trends:", error)
            return []
        }
    }
}
