import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FiLayout, FiPlus } from "react-icons/fi"
import apiService from "../../service/apiService.js"
import { useAuth } from "./context/customHook.js"
import { NetworkError, ServerError } from "./ErrorStates.jsx"
import KanbanBoard from "./kanban/KanbanBoard.jsx"
import { Skeleton, SkeletonCircle, SkeletonText } from "./Skeleton.jsx"
import TaskDetailPanel from "./task/TaskDetailPanel.jsx"

const BoardSkeleton = () => (
  <div className="flex h-full p-6 gap-6 overflow-x-auto">
    {[1, 2, 3, 4].map((idx) => (
      <div
        key={idx}
        className="w-[320px] flex-shrink-0 flex flex-col gap-4 bg-light-bg-primary/50 dark:bg-dark-bg-primary/50 rounded-xl p-4"
      >
        <SkeletonText width="w-1/2" height="h-8" className="mb-2" />
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="p-3 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover space-y-3"
          >
            <SkeletonText width="w-3/4" height="h-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-4 rounded-full" />
              <SkeletonCircle size="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
)

const initialColumns = {
  todo: { title: "To Do", items: [], tasks: [] },
  "in-progress": { title: "In Progress", items: [], tasks: [] },
  "under-review": { title: "In Review", items: [], tasks: [] },
  completed: { title: "Done", items: [], tasks: [] },
}

const Board = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [columns, setColumns] = useState(initialColumns)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)

  const canAddTask =
    user?.role === "admin" ||
    user?.role === "owner" ||
    user?.role === "projectAdmin" ||
    user?.role === "ADMIN" ||
    user?.role === "OWNER" ||
    user?.role === "PROJECT_ADMIN"

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getAllTaskOfUser()
      if (response.success) {
        const tasks = response.data

        // Group tasks by status
        const newColumns = JSON.parse(JSON.stringify(initialColumns)) // Deep copy

        tasks.forEach((task) => {
          if (newColumns[task.status]) {
            newColumns[task.status].tasks.push(task)
            newColumns[task.status].items.push(task._id) // For dnd tracking
          }
        })

        setColumns(newColumns)
      }
    } catch (err) {
      console.error("Failed to fetch tasks for board view:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  if (error) {
    if (error.name === "NetworkError") return <NetworkError onRetry={fetchTasks} />
    return <ServerError onRetry={fetchTasks} />
  }

  return (
    <div className="h-full flex flex-col pt-0" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 shrink-0 max-w-[1400px] mx-auto w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-1 flex items-center">
            Global Board
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Drag and drop tasks across all your projects.
          </p>
        </div>
        {canAddTask && (
          <button type="button" className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {loading ? (
          <BoardSkeleton />
        ) : (
          <KanbanBoard
            columns={columns}
            setColumns={setColumns}
            projectId="global" // KanbanBoard needs this for internal DnD maps
            members={[{ user: user }]}
            openEditModal={(task) => {
              setTaskToEdit(task)
              setIsEditModalOpen(true)
            }}
          />
        )}
      </div>

      {isEditModalOpen && (
        <TaskDetailPanel
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setTaskToEdit(null)
            fetchTasks()
          }}
          task={taskToEdit}
          members={[{ user: user }]} // Pass user mapping for globals
          onTaskUpdated={(updatedTask) => {
            fetchTasks()
          }}
        />
      )}
    </div>
  )
}

export default Board
