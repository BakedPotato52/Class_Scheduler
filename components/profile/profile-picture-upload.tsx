"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Camera, Upload, X, Loader2, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    uploadToCloudinary,
    validateImageFile,
    getOptimizedImageUrl,
    deleteFromCloudinary,
    type CloudinaryUploadResponse,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

interface ProfilePictureUploadProps {
    currentImageUrl?: string
    currentPublicId?: string
    userName: string
    onUploadSuccess: (imageUrl: string, publicId: string) => void
    onUploadError: (error: string) => void
    disabled?: boolean
    size?: "sm" | "md" | "lg" | "xl"
}

export function ProfilePictureUpload({
    currentImageUrl,
    currentPublicId,
    userName,
    onUploadSuccess,
    onUploadError,
    disabled = false,
    size = "lg",
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    const sizeClasses = {
        sm: "h-16 w-16",
        md: "h-20 w-20",
        lg: "h-24 w-24",
        xl: "h-32 w-32",
    }

    const clearMessages = useCallback(() => {
        setError(null)
        setSuccess(false)
    }, [])

    const handleFileSelect = useCallback(
        async (file: File) => {
            clearMessages()

            // Validate file
            const validation = validateImageFile(file)
            if (!validation.isValid) {
                setError(validation.error!)
                return
            }

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            setUploading(true)
            setUploadProgress(0)

            try {
                // Delete old image if exists
                if (currentPublicId) {
                    try {
                        await deleteFromCloudinary(currentPublicId)
                    } catch (deleteError) {
                        console.warn("Failed to delete old image:", deleteError)
                        // Continue with upload even if delete fails
                    }
                }

                // Upload to Cloudinary with transformations for profile pictures
                const result: CloudinaryUploadResponse = await uploadToCloudinary(file, {
                    folder: "profile-pictures",
                    transformation: "c_fill,g_face,h_400,w_400,q_auto,f_auto",
                    onProgress: setUploadProgress,
                })

                // Generate optimized URL
                const optimizedUrl = getOptimizedImageUrl(result.public_id, {
                    width: 400,
                    height: 400,
                    crop: "fill",
                    quality: "auto",
                    format: "auto",
                })

                onUploadSuccess(optimizedUrl, result.public_id)
                setSuccess(true)
                setPreviewUrl(null)

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000)
            } catch (uploadError) {
                console.error("Upload error:", uploadError)
                const errorMessage =
                    uploadError instanceof Error ? uploadError.message : "Failed to upload image. Please try again."

                setError(errorMessage)
                onUploadError(errorMessage)
                setPreviewUrl(null)
            } finally {
                setUploading(false)
                setUploadProgress(0)
            }
        },
        [currentPublicId, onUploadSuccess, onUploadError, clearMessages],
    )

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                handleFileSelect(file)
            }
            // Reset input value to allow selecting the same file again
            e.target.value = ""
        },
        [handleFileSelect],
    )

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)

            if (disabled || uploading) return

            const files = Array.from(e.dataTransfer.files)
            const imageFile = files.find((file) => file.type.startsWith("image/"))

            if (imageFile) {
                handleFileSelect(imageFile)
            } else {
                setError("Please drop an image file")
            }
        },
        [disabled, uploading, handleFileSelect],
    )

    const handleDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            if (!disabled && !uploading) {
                setDragActive(true)
            }
        },
        [disabled, uploading],
    )

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }, [])

    const openFileDialog = useCallback(() => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click()
        }
    }, [disabled, uploading])

    const displayImageUrl = previewUrl || currentImageUrl
    const showProgress = uploading && uploadProgress > 0

    return (
        <div className="space-y-4">
            {/* Avatar with Upload Overlay */}
            <div className="relative mx-auto w-fit">
                <div
                    ref={dropZoneRef}
                    className={cn(
                        "relative group cursor-pointer transition-all duration-200",
                        dragActive && "scale-105",
                        disabled && "cursor-not-allowed opacity-50",
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={openFileDialog}
                >
                    <Avatar className={cn(sizeClasses[size], "transition-all duration-200")}>
                        <AvatarImage src={displayImageUrl || "/placeholder.svg"} alt={userName} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg">
                            {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Upload Overlay */}
                    <div
                        className={cn(
                            "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                            dragActive && "opacity-100 bg-blue-500/50",
                            uploading && "opacity-100",
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                            <Camera className="h-6 w-6 text-white" />
                        )}
                    </div>

                    {/* Success Indicator */}
                    {success && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {showProgress && (
                    <div className="absolute -bottom-2 left-0 right-0">
                        <Progress value={uploadProgress} className="h-1" />
                    </div>
                )}
            </div>

            {/* Drag and Drop Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                    disabled && "opacity-50 cursor-not-allowed",
                    uploading && "pointer-events-none",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="space-y-2">
                    <Upload className={cn("h-8 w-8 mx-auto", dragActive ? "text-blue-500" : "text-gray-400")} />
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {dragActive ? "Drop your image here" : "Drag and drop your profile picture"}
                        </p>
                        <p className="text-xs text-gray-500">
                            or{" "}
                            <button
                                type="button"
                                onClick={openFileDialog}
                                disabled={disabled || uploading}
                                className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                            >
                                browse files
                            </button>
                        </p>
                    </div>
                    <p className="text-xs text-gray-400">Supports JPEG, PNG, WebP up to 5MB</p>
                </div>
            </div>

            {/* Upload Button */}
            <Button
                onClick={openFileDialog}
                disabled={disabled || uploading}
                variant="outline"
                className="w-full bg-transparent"
            >
                {uploading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading... {uploadProgress}%
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Profile Picture
                    </>
                )}
            </Button>

            {/* Messages */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="ghost" size="sm" onClick={clearMessages} className="absolute top-2 right-2 h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">Profile picture updated successfully!</AlertDescription>
                </Alert>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || uploading}
            />
        </div>
    )
}
