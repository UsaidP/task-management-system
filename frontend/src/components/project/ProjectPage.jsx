import { motion } from "framer-motion"
import React, { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { FiAlertCircle, FiCheckCircle, FiCircle, FiClock, FiLock, FiUsers } from "react-icons/fi"
import { useParams } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import KanbanBoard from "../kanban/KanbanBoard"
import Modal from "../Modal"
import Skeleton from "../Skeleton"
import CreateTaskModal from "../task/CreateTaskModal"
import TaskCardSkeleton from "../task/TaskCardSkeleton"
import TaskDetailPanel from "../task/TaskDetailPanel"
import ProjectMembers from "./ProjectMembers"

const deepCopy = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (React.isValidElement(obj)) {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item))
  }

  const newObj = {}
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      newObj[key] = deepCopy(obj[key])
    }
  }
  return newObj
}

// Define the base structure of the Kanban board columns
const initialColumns = {
  todo: {
    title: "To Do",
    tasks: [],
    color: "bg-task-status-todo/15",
    icon: <FiCircle className="w-5 h-5 text-task-status-todo" />,
  },
  "in-progress": {
    title: "In Progress",
    tasks: [],
    color: "bg-task-status-progress/15",
    icon: <FiClock className="w-5 h-5 text-task-status-progress" />,
  },
  "under-review": {
    title: "Under Review",
    tasks: [],
    color: "bg-task-status-review/15",
    icon: <FiAlertCircle className="w-5 h-5 text-task-status-review" />,
  },
  completed: {
    title: "Completed",
    tasks: [],
    color: "bg-task-status-done/15",
    icon: <FiCheckCircle className="w-5 h-5 text-task-status-done" />,
  },
}

const ProjectPage = () => {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [members, setMembers] = useState([])
  const [columns, setColumns] = useState(initialColumns)

  const userRole = members.find((m) => (m.user?._id || m.user) === user?._id)?.role

  const canViewBoard = userRole === "admin" || userRole === "project_admin"

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const fetchProjectData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectResponse, tasksResponse, membersResponse] = await Promise.all([
        apiService.getProjectById(projectId),
        apiService.getTasksByProjectId(projectId),
        apiService.getAllMembers(projectId),
      ])

      if (projectResponse.success) setProject(projectResponse.data)
      if (membersResponse.success) setMembers(membersResponse.data)

      if (tasksResponse.success) {
        const tasks = tasksResponse.data
        const groupedColumns = tasks.reduce((acc, task) => {
          const status = task.status || "todo"
          if (acc[status]) {
            acc[status].tasks.push(task)
          }
          return acc
        }, deepCopy(initialColumns))
        setColumns(groupedColumns)
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred while fetching project data."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProjectData()
  }, [fetchProjectData])

  const handleTaskCreated = (newTask) => {
    if (!newTask || !newTask.status || !columns[newTask.status]) return
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns }
      const newTasks = [...newColumns[newTask.status].tasks, newTask]
      newColumns[newTask.status] = {
        ...newColumns[newTask.status],
        tasks: newTasks,
      }
      return newColumns
    })
    toast.success("Task created successfully!")
  }

  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask || !updatedTask.status || !columns[updatedTask.status]) return
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns }

      // Find the original status of the task
      let originalStatus
      for (const status in newColumns) {
        if (newColumns[status].tasks.some((t) => t._id === updatedTask._id)) {
          originalStatus = status
          break
        }
      }

      // If the status has changed, remove it from the old column
      if (originalStatus && originalStatus !== updatedTask.status) {
        const oldTasks = newColumns[originalStatus].tasks.filter((t) => t._id !== updatedTask._id)
        newColumns[originalStatus] = {
          ...newColumns[originalStatus],
          tasks: oldTasks,
        }
      }

      // Add or update the task in the new column
      const newTasks = [...newColumns[updatedTask.status].tasks]
      const taskIndex = newTasks.findIndex((t) => t._id === updatedTask._id)
      if (taskIndex !== -1) {
        newTasks[taskIndex] = updatedTask
      } else {
        newTasks.push(updatedTask)
      }
      newColumns[updatedTask.status] = {
        ...newColumns[updatedTask.status],
        tasks: newTasks,
      }

      return newColumns
    })
    toast.success("Task updated successfully!")
  }

  const openEditModal = (task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTask) return

    const toastId = toast.loading("Deleting task...")
    const { _id: taskId, status } = selectedTask

    const previousColumns = columns
    setColumns((prev) => {
      const newCols = { ...prev }
      const newTasks = newCols[status].tasks.filter((t) => t._id !== taskId)
      newCols[status] = { ...newCols[status], tasks: newTasks }
      return newCols
    })
    setIsDeleteModalOpen(false)

    try {
      await apiService.deleteTask(projectId, taskId)
      toast.success("Task deleted successfully!", { id: toastId })
    } catch (err) {
      toast.error("Failed to delete task", { id: toastId })
      setColumns(previousColumns)
    } finally {
      setSelectedTask(null)
    }
  }

  const openDeleteModal = (task) => {
    setSelectedTask(task)
    setIsDeleteModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-bold text-accent-danger mb-2">Error Loading Project</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col p-6 bg-light-bg-primary dark:bg-dark-bg-primary m-0 rounded-lg"
    >
      <header className="flex items-center justify-between mb-8">
        {loading ? (
          <div className="flex-1">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              {project?.name}
            </h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
              {project?.description}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="btn-secondary flex items-center"
          >
            <FiUsers className="mr-2" />
            Members
          </button>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex gap-8 pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-80 flex-shrink-0 card rounded-xl p-6">
                <Skeleton className="h-6 w-1/3 mb-6" />
                <div className="space-y-4">
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : canViewBoard ? (
          <KanbanBoard
            columns={columns}
            setColumns={setColumns}
            projectId={projectId}
            members={members}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            onCreateTask={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FiLock className="w-12 h-12 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-40" />
              <h2 className="text-xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Board Access Restricted
              </h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Only Admins and Project Admins can view the project board. Contact your project
                admin for access.
              </p>
            </div>
          </div>
        )}
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
        members={members}
      />
      <ProjectMembers
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={projectId}
        members={members}
        setMembers={setMembers}
      />
      <TaskDetailPanel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdated}
        task={selectedTask}
        members={members}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div>
          <p>Are you sure you want to delete the task titled "{selectedTask?.title}"?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default ProjectPage
