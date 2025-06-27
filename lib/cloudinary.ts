"use client"

// Client-side Cloudinary configuration
export const CLOUDINARY_CONFIG = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "profile-pictures",
}

export interface CloudinaryUploadResponse {
    public_id: string
    version: number
    signature: string
    width: number
    height: number
    format: string
    resource_type: string
    created_at: string
    tags: string[]
    bytes: number
    type: string
    etag: string
    placeholder: boolean
    url: string
    secure_url: string
    access_mode: string
    original_filename: string
}

export interface CloudinaryUploadOptions {
    folder?: string
    tags?: string[]
    public_id?: string
    onProgress?: (progress: number) => void
}

export interface ImageValidation {
    isValid: boolean
    error?: string
}

export interface OptimizedImageOptions {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
    gravity?: string
}

// Validate image file before upload
export function validateImageFile(file: File): ImageValidation {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Please select a valid image file (JPEG, PNG, or WebP)'
        }
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size must be less than 5MB'
        }
    }

    return { isValid: true }
}

// Upload image to Cloudinary using unsigned upload
export async function uploadToCloudinary(
    file: File,
    options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    // Only add allowed parameters for unsigned uploads
    if (options.folder) {
        formData.append('folder', options.folder)
    }

    if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','))
    }

    if (options.public_id) {
        formData.append('public_id', options.public_id)
    }

    // Add timestamp for uniqueness
    formData.append('timestamp', Date.now().toString())

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        if (options.onProgress) {
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    options.onProgress!(progress)
                }
            })
        }

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText)
                    resolve(response)
                } catch (error) {
                    reject(new Error('Failed to parse upload response'))
                }
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText)
                    reject(new Error(errorResponse.error?.message || 'Upload failed'))
                } catch {
                    reject(new Error(`Upload failed with status: ${xhr.status}`))
                }
            }
        })

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timeout'))
        })

        xhr.open('POST', uploadUrl)
        xhr.timeout = 30000 // 30 second timeout
        xhr.send(formData)
    })
}

// Generate optimized image URL
export function getOptimizedImageUrl(
    publicId: string,
    options: OptimizedImageOptions = {}
): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
        throw new Error('Cloudinary cloud name is missing')
    }

    const transformations: string[] = []

    if (options.width || options.height) {
        const w = options.width ? `w_${options.width}` : ''
        const h = options.height ? `h_${options.height}` : ''
        transformations.push([w, h].filter(Boolean).join(','))
    }

    if (options.crop) {
        transformations.push(`c_${options.crop}`)
    }

    if (options.gravity) {
        transformations.push(`g_${options.gravity}`)
    }

    if (options.quality) {
        transformations.push(`q_${options.quality}`)
    }

    if (options.format) {
        transformations.push(`f_${options.format}`)
    }

    const transformationString = transformations.length > 0
        ? `/${transformations.join(',')}`
        : ''

    return `https://res.cloudinary.com/${cloudName}/image/upload${transformationString}/${publicId}`
}

// Delete image from Cloudinary (server-side only)
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete image')
    }
}
