"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfilePictureUploadModal } from "@/components/modals/profile-picture-upload-modal"
import { profileService, type UserProfile } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"

export default function ProfilePage() {
    const { user, userRole } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showUploadModal, setShowUploadModal] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        phone: "",
        location: "",
        subject: "",
        grade: "",
        department: "",
    })

    const loadProfile = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            let userProfile = await profileService.getUserProfile(user.uid)

            // Create profile if it doesn't exist
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
            setFormData({
                name: userProfile.name || "",
                bio: userProfile.bio || "",
                phone: userProfile.phone || "",
                location: userProfile.location || "",
                subject: userProfile.subject || "",
                grade: userProfile.grade || "",
                department: userProfile.department || "",
            })
        } catch (error) {
            console.error("Error loading profile:", error)
            setError("Failed to load profile. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [user, userRole])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!user || !profile) return

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const updates: Partial<UserProfile> = {
                name: formData.name,
                bio: formData.bio,
                phone: formData.phone,
                location: formData.location,
            }

            // Add role-specific fields
            if (userRole === "teacher") {
                updates.subject = formData.subject
            } else if (userRole === "student") {
                updates.grade = formData.grade
            } else if (userRole === "admin") {
                updates.department = formData.department
            }

            await profileService.updateUserProfile(user.uid, updates)

            // Update local state
            setProfile((prev) => (prev ? { ...prev, ...updates } : null))
            setEditing(false)
            setSuccess("Profile updated successfully!")

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
            console.error("Error updating profile:", error)
            setError("Failed to update profile. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (!profile) return

        setFormData({
            name: profile.name || "",
            bio: profile.bio || "",
            phone: profile.phone || "",
            location: profile.location || "",
            subject: profile.subject || "",
            grade: profile.grade || "",
            department: profile.department || "",
        })
        setEditing(false)
        setError(null)
    }

    const handleAvatarUploadSuccess = async (imageUrl: string, publicId: string) => {
        if (!user || !profile) return

        try {
            const updates: Partial<UserProfile> = {
                avatar: imageUrl,
                avatar_public_id: publicId,
            }

            await profileService.updateUserProfile(user.uid, updates)
            setProfile((prev) => (prev ? { ...prev, ...updates } : null))
            setSuccess("Profile picture updated successfully!")

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
            console.error("Error updating avatar:", error)
            setError("Failed to update profile picture.")
        }
    }

    const handleAvatarUploadError = (errorMessage: string) => {
        setError(errorMessage)
    }

    const formatJoinDate = (timestamp: any) => {
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            return formatDistanceToNow(date, { addSuffix: true })
        } catch (error) {
            return "Unknown"
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800 border-red-200"
            case "teacher":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "student":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
                <p className="text-gray-600">Unable to load your profile information.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-8 mb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
                </div>

                {!editing ? (
                    <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            disabled={saving}
                            className="flex items-center gap-2 bg-transparent"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Messages */}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">{success}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <Card className="lg:col-span-1">
                    <CardHeader className="text-center">
                        {/* Profile Picture with Camera Icon */}
                        <div className="relative mx-auto w-fit">
                            <Avatar className="h-32 w-32 mx-auto">
                                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Camera Icon Button */}
                            <Button
                                size="sm"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 bg-white shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => setShowUploadModal(true)}
                                disabled={saving}
                            >
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">Change profile picture</span>
                            </Button>
                        </div>

                        <CardTitle className="mt-4">{profile.name}</CardTitle>
                        <Badge className={getRoleColor(profile.role)}>{profile.role}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{profile.email}</span>
                        </div>

                        {profile.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{profile.phone}</span>
                            </div>
                        )}

                        {profile.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{profile.location}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatJoinDate(profile.joined_at)}</span>
                        </div>

                        {profile.bio && (
                            <div className="pt-4 border-t">
                                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Profile Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                {editing ? (
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.name}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">{profile.email}</div>
                                <p className="text-xs text-gray-500">Email cannot be changed</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                {editing ? (
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="Enter your phone number"
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.phone || "Not provided"}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                {editing ? (
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        placeholder="Enter your location"
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.location || "Not provided"}</div>
                                )}
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {userRole === "teacher" && (
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject/Specialization</Label>
                                {editing ? (
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange("subject", e.target.value)}
                                        placeholder="Enter your subject or specialization"
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.subject || "Not provided"}</div>
                                )}
                            </div>
                        )}

                        {userRole === "student" && (
                            <div className="space-y-2">
                                <Label htmlFor="grade">Class</Label>
                                {editing ? (
                                    <Input
                                        id="grade"
                                        value={formData.grade}
                                        onChange={(e) => handleInputChange("grade", e.target.value)}
                                        placeholder="Enter your grade or level"
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.grade || "Not provided"}</div>
                                )}
                            </div>
                        )}

                        {userRole === "admin" && (
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                {editing ? (
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange("department", e.target.value)}
                                        placeholder="Enter your department"
                                        disabled={saving}
                                    />
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">{profile.department || "Not provided"}</div>
                                )}
                            </div>
                        )}

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            {editing ? (
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    disabled={saving}
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md text-sm min-h-[100px]">
                                    {profile.bio || "No bio provided"}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Picture Upload Modal */}
            <ProfilePictureUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                currentImageUrl={profile.avatar}
                currentPublicId={profile.avatar_public_id}
                userName={profile.name}
                onUploadSuccess={handleAvatarUploadSuccess}
                onUploadError={handleAvatarUploadError}
            />
        </div>
    )
}
