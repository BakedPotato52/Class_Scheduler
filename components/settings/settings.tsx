"use client"

import { useState, useEffect } from "react"
import { Settings, Bell, Palette, Shield, Globe, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { settingsService, type UserSettings } from "@/lib/firebase-admin"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
    const { user } = useAuth()
    const [settings, setSettings] = useState<UserSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const loadSettings = async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            let userSettings = await settingsService.getUserSettings(user.uid)

            // Create default settings if they don't exist
            if (!userSettings) {
                userSettings = await settingsService.createDefaultSettings(user.uid)
            }

            setSettings(userSettings)
        } catch (error) {
            console.error("Error loading settings:", error)
            setError("Failed to load settings. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [user])

    const handleNotificationChange = (key: string, value: boolean) => {
        if (!settings) return

        setSettings((prev) => ({
            ...prev!,
            notifications: {
                ...prev!.notifications,
                [key]: value,
            },
        }))
    }

    const handlePreferenceChange = (key: string, value: string) => {
        if (!settings) return

        setSettings((prev) => ({
            ...prev!,
            preferences: {
                ...prev!.preferences,
                [key]: value,
            },
        }))
    }

    const handlePrivacyChange = (key: string, value: boolean | string) => {
        if (!settings) return

        setSettings((prev) => ({
            ...prev!,
            privacy: {
                ...prev!.privacy,
                [key]: value,
            },
        }))
    }

    const handleSave = async () => {
        if (!user || !settings) return

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            await settingsService.updateUserSettings(user.uid, settings)
            setSuccess("Settings saved successfully!")

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
            console.error("Error saving settings:", error)
            setError("Failed to save settings. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const timezones = [
        { value: "America/New_York", label: "Eastern Time (ET)" },
        { value: "America/Chicago", label: "Central Time (CT)" },
        { value: "America/Denver", label: "Mountain Time (MT)" },
        { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
        { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
        { value: "Europe/Paris", label: "Central European Time (CET)" },
        { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
        { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
        { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
    ]

    const languages = [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
        { value: "de", label: "German" },
        { value: "it", label: "Italian" },
        { value: "pt", label: "Portuguese" },
        { value: "zh", label: "Chinese" },
        { value: "ja", label: "Japanese" },
        { value: "ko", label: "Korean" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings not found</h3>
                <p className="text-gray-600">Unable to load your settings.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Settings className="h-8 w-8" />
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1">Customize your experience and preferences</p>
                </div>

                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Messages */}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">{success}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.email_enabled}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("email_enabled", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.push_enabled}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("push_enabled", checked)}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Class Reminders</Label>
                                    <p className="text-sm text-gray-600">Get reminded about upcoming classes</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.class_reminders}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("class_reminders", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enrollment Updates</Label>
                                    <p className="text-sm text-gray-600">Notifications about class enrollments</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.enrollment_updates}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("enrollment_updates", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>System Updates</Label>
                                    <p className="text-sm text-gray-600">Important system announcements</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.system_updates}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("system_updates", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Marketing Emails</Label>
                                    <p className="text-sm text-gray-600">Promotional content and updates</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.marketing_emails}
                                    onCheckedChange={(checked: boolean) => handleNotificationChange("marketing_emails", checked)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance & Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance & Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <Select
                                    value={settings.preferences.theme}
                                    onValueChange={(value) => handlePreferenceChange("theme", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Select
                                    value={settings.preferences.language}
                                    onValueChange={(value) => handlePreferenceChange("language", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Timezone</Label>
                                <Select
                                    value={settings.preferences.timezone}
                                    onValueChange={(value) => handlePreferenceChange("timezone", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map((tz) => (
                                            <SelectItem key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date Format</Label>
                                    <Select
                                        value={settings.preferences.date_format}
                                        onValueChange={(value) => handlePreferenceChange("date_format", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Time Format</Label>
                                    <Select
                                        value={settings.preferences.time_format}
                                        onValueChange={(value) => handlePreferenceChange("time_format", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12h">12 Hour</SelectItem>
                                            <SelectItem value="24h">24 Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Profile Visibility</Label>
                                <Select
                                    value={settings.privacy.profile_visibility}
                                    onValueChange={(value) => handlePrivacyChange("profile_visibility", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="contacts">Contacts Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">Control who can see your profile information</p>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Email Address</Label>
                                    <p className="text-sm text-gray-600">Display email on your public profile</p>
                                </div>
                                <Switch
                                    checked={settings.privacy.show_email}
                                    onCheckedChange={(checked) => handlePrivacyChange("show_email", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Phone Number</Label>
                                    <p className="text-sm text-gray-600">Display phone number on your profile</p>
                                </div>
                                <Switch
                                    checked={settings.privacy.show_phone}
                                    onCheckedChange={(checked) => handlePrivacyChange("show_phone", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Location</Label>
                                    <p className="text-sm text-gray-600">Display location on your profile</p>
                                </div>
                                <Switch
                                    checked={settings.privacy.show_location}
                                    onCheckedChange={(checked) => handlePrivacyChange("show_location", checked)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Account Status</p>
                                    <p className="text-sm text-gray-600">Your account is active</p>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Data Export</p>
                                    <p className="text-sm text-gray-600">Download your account data</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Export
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <div>
                                    <p className="font-medium text-red-900">Delete Account</p>
                                    <p className="text-sm text-red-600">Permanently delete your account</p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
