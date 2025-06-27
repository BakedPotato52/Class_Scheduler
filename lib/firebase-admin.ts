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

// New types for notifications, profile, and settings
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
    bio?: string
    phone?: string
    location?: string
    subject?: string // For teachers
    grade?: string // For students
    department?: string // For admins
    joined_at: Timestamp
    last_active?: Timestamp
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
            const [teachers, classes, students] = await Promise.all([
                teacherService.getAllTeachers(),
                classService.getAllClasses(),
                studentService.getAllStudents(),
            ])

            const activeClasses = classes.filter((c) => c.class_status === "active")
            const teachersWithActiveClasses = new Set(activeClasses.map((c) => c.teacher_id)).size

            return {
                totalTeachers: teachers.length,
                activeTeachers: teachersWithActiveClasses,
                totalClasses: classes.length,
                activeClasses: activeClasses.length,
                totalStudents: students.length,
                completedClasses: classes.filter((c) => c.class_status === "completed").length,
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error)
            throw error
        }
    },
}
