import React, { useState, useEffect, useMemo } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import apiService from "../../../service/apiService"
import CreateTaskModal from "../task/CreateTaskModal"
import { useAuth } from "../context/customHook.js"
import { NetworkError, EmptyState } from "../ErrorStates.jsx"

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const today = new Date()
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const fetchTasks = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getAllTaskOfUser()
      if (response.success) {
        setTasks(response.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch tasks for calendar", err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user])

  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToPrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day))
    setIsModalOpen(true)
  }

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask])
  }

  const getEventsForDay = (day) =>
    tasks.filter(
      (e) =>
        new Date(e.dueDate).toDateString() ===
        new Date(currentYear, currentMonth, day).toDateString()
    )

  if (error) {
    return <NetworkError onRetry={fetchTasks} />
  }

  return (
    <div className="flex flex-col w-full h-full bg-light-bg-primary dark:bg-dark-bg-primary p-8 overflow-y-auto">
      <div className="w-full rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            <span className="text-light-text-secondary dark:text-dark-text-secondary">
              {currentYear}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={goToToday} className="btn-secondary">
              Today
            </button>
            <button onClick={goToPrevMonth} className="btn-ghost p-2">
              <FiChevronLeft />
            </button>
            <button onClick={goToNextMonth} className="btn-ghost p-2">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`blank-${i}`} className="h-10"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear()
            const dayEvents = getEventsForDay(day)

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors ${
                  isToday
                    ? "bg-accent-primary text-white font-bold"
                    : "hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover text-light-text-primary dark:text-dark-text-primary"
                }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isLoading && <p>Loading...</p>}
        {!isLoading && !error && tasks.length === 0 && (
          <EmptyState message="No tasks found for this month." />
        )}

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={handleTaskCreated}
          projectId={null} // Or pass a default project ID
          members={[]} // Or fetch members
          selectedDate={selectedDate}
        />
      </div>
    </div>
  )
}

export default CalendarView
