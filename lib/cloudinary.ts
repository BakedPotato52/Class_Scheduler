"use client"

// Client-side Cloudinary configuration
export const CLOUDINARY_CONFIG = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "profile-pictures",
}

export interface CloudinaryUploadResponse {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    resource_type: string
    created_at: string
    bytes: number
    url: string
    original_filename: string
}

export interface CloudinaryError {
    message: string
    name: string
    http_code: number
}

// Upload image to Cloudinary using unsigned upload
export const uploadToCloudinary = async (
    file: File,
    options?: {
        folder?: string
        transformation?: string
        onProgress?: (progress: number) => void
    }
): Promise<CloudinaryUploadResponse> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset)
        formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName)

        // Optional folder organization
        if (options?.folder) {
            formData.append("folder", options.folder)
        }

        // Optional transformations for profile pictures
        if (options?.transformation) {
            formData.append("transformation", options.transformation)
        }

        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && options?.onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100)
                options.onProgress(progress)
            }
        })

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse
                    resolve(response)
                } catch (error) {
                    reject(new Error("Failed to parse upload response"))
                }
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText)
                    reject(new Error(errorResponse.error?.message || "Upload failed"))
                } catch {
                    reject(new Error(`Upload failed with status: ${xhr.status}`))
                }
            }
        })

        xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"))
        })

        xhr.addEventListener("timeout", () => {
            reject(new Error("Upload timeout"))
        })

        xhr.timeout = 30000 // 30 second timeout
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`)
        xhr.send(formData)
    })
}

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (
    publicId: string,
    options?: {
        width?: number
        height?: number
        crop?: "fill" | "fit" | "scale" | "crop"
        quality?: "auto" | number
        format?: "auto" | "webp" | "jpg" | "png"
    }
): string => {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`

    const transformations = []

    if (options?.width || options?.height) {
        const crop = options?.crop || "fill"
        transformations.push(`c_${crop}`)

        if (options.width) transformations.push(`w_${options.width}`)
        if (options.height) transformations.push(`h_${options.height}`)
    }

    if (options?.quality) {
        transformations.push(`q_${options.quality}`)
    }

    if (options?.format) {
        transformations.push(`f_${options.format}`)
    }

    const transformationString = transformations.length > 0 ? `${transformations.join(",")}/` : ""

    return `${baseUrl}/${transformationString}${publicId}`
}

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: "Please select a valid image file (JPEG, PNG, or WebP)"
        }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: "Image size must be less than 5MB"
        }
    }

    return { isValid: true }
}

// Delete image from Cloudinary (requires server-side implementation)
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        const response = await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ publicId }),
        })

        if (!response.ok) {
            throw new Error("Failed to delete image")
        }
    } catch (error) {
        console.error("Error deleting image:", error)
        throw error
    }
}
