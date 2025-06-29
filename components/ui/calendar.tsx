"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
  data?: any
}

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  className?: string
}

export function Calendar({ events = [], onEventClick, onDateClick, className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 border border-gray-200 bg-gray-50" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 sm:h-32 border border-gray-200   p-1 sm:p-2 cursor-pointer hover:bg-gray-50 transition-colors",
            isToday && "bg-blue-50 border-blue-300",
          )}
          onClick={() => onDateClick?.(date)}
        >
          <div className={cn("text-sm font-medium mb-1", isToday ? "text-blue-600" : "text-gray-900")}>{day}</div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                  event.color || "bg-blue-100 text-blue-800",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onEventClick?.(event)
                }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className={cn("  rounded-lg shadow-sm border", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold dark:text-white text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div key={day} className="p-2 sm:p-3 text-center text-sm font-medium text-gray-700 dark:text-white ">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">{renderCalendarDays()}</div>
    </div>
  )
}

export type { CalendarEvent }
