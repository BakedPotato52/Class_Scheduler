"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2, AlertCircle, Check, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    uploadToCloudinary,
    validateImageFile,
    getOptimizedImageUrl,
    deleteFromCloudinary,
    type CloudinaryUploadResponse,
} from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

interface ProfilePictureUploadModalProps {
    isOpen: boolean
    onClose: () => void
    currentImageUrl?: string
    currentPublicId?: string
    userName: string
    onUploadSuccess: (imageUrl: string, publicId: string) => void
    onUploadError: (error: string) => void
}

export function ProfilePictureUploadModal({
    isOpen,
    onClose,
    currentImageUrl,
    currentPublicId,
    userName,
    onUploadSuccess,
    onUploadError,
}: ProfilePictureUploadModalProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    const clearMessages = useCallback(() => {
        setError(null)
        setSuccess(false)
    }, [])

    const resetModal = useCallback(() => {
        setPreviewUrl(null)
        setUploadProgress(0)
        setUploading(false)
        clearMessages()
    }, [clearMessages])

    const handleClose = useCallback(() => {
        if (!uploading) {
            resetModal()
            onClose()
        }
    }, [uploading, resetModal, onClose])

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

                // Upload to Cloudinary
                const result: CloudinaryUploadResponse = await uploadToCloudinary(file, {
                    folder: "profile-pictures",
                    tags: ["profile", "user-avatar"],
                    onProgress: setUploadProgress,
                })

                // Generate optimized URL for profile pictures
                const optimizedUrl = getOptimizedImageUrl(result.public_id, {
                    width: 400,
                    height: 400,
                    crop: "fill",
                    gravity: "face",
                    quality: "auto",
                    format: "auto",
                })

                onUploadSuccess(optimizedUrl, result.public_id)
                setSuccess(true)

                // Close modal after successful upload
                setTimeout(() => {
                    handleClose()
                }, 1500)
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
        [currentPublicId, onUploadSuccess, onUploadError, clearMessages, handleClose],
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

            if (uploading) return

            const files = Array.from(e.dataTransfer.files)
            const imageFile = files.find((file) => file.type.startsWith("image/"))

            if (imageFile) {
                handleFileSelect(imageFile)
            } else {
                setError("Please drop an image file")
            }
        },
        [uploading, handleFileSelect],
    )

    const handleDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            if (!uploading) {
                setDragActive(true)
            }
        },
        [uploading],
    )

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }, [])

    const openFileDialog = useCallback(() => {
        if (!uploading) {
            fileInputRef.current?.click()
        }
    }, [uploading])

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                        Upload a new profile picture. Supported formats: JPEG, PNG, WebP (max 5MB)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current/Preview Image */}
                    {(previewUrl || currentImageUrl) && (
                        <div className="flex justify-center">
                            <div className="relative">
                                <img
                                    src={previewUrl || currentImageUrl}
                                    alt="Profile preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                                {success && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    {/* Drag and Drop Area */}
                    <div
                        ref={dropZoneRef}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                            uploading && "pointer-events-none opacity-50",
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={openFileDialog}
                    >
                        <div className="space-y-3">
                            {uploading ? (
                                <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                            ) : (
                                <ImageIcon className={cn("h-12 w-12 mx-auto", dragActive ? "text-blue-500" : "text-gray-400")} />
                            )}

                            <div>
                                <p className="text-lg font-medium text-gray-900">
                                    {uploading
                                        ? "Uploading your image..."
                                        : dragActive
                                            ? "Drop your image here"
                                            : "Choose your profile picture"}
                                </p>
                                {!uploading && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Drag and drop an image, or click to browse
                                    </p>
                                )}
                            </div>

                            {!uploading && (
                                <Button variant="outline" className="mt-4">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Image
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex justify-between items-center">
                                {error}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearMessages}
                                    className="h-6 w-6 p-0 hover:bg-transparent"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Profile picture updated successfully! Closing...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={uploading}>
                            {uploading ? "Uploading..." : "Cancel"}
                        </Button>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                />
            </DialogContent>
        </Dialog>
    )
}
