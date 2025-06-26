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
                classes = classes.filter((classItem) =>
                    classItem.enrolled_students?.includes(filters.studentId!)
                )
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
            const q = query(
                collection(db, "classes"),
                where("teacher_id", "==", teacherId),
                orderBy("created_at", "desc")
            )
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
            const q = query(
                collection(db, "classes"),
                where("class_status", "==", "active"),
                orderBy("created_at", "desc")
            )
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

                const updatedStudents = enrolledStudents.filter(id => id !== studentId)
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
