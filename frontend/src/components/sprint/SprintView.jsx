import { useCallback, useEffect, useState } from "react"
import { FiMoreVertical, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import CompleteSprintDialog from "./CompleteSprintDialog.jsx"
import CreateSprintDialog from "./CreateSprintDialog.jsx"

const useSprint = (projectId) => {
  const { user } = useAuth()
  const [sprints, setSprints] = useState([])
  const [currentSprint, setCurrentSprint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSprints = async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.getSprintsByProject(projectId)
      if (response.success) {
        setSprints(response.data || [])
        const activeSprint = response.data?.find((s) => s.status === "active")
        setCurrentSprint(activeSprint || null)
      }
    } catch (err) {
      setError(err)
      console.error("Failed to fetch sprints:", err)
    } finally {
      setLoading(false)
    }
  }

  const createSprint = async (sprintData) => {
    const response = await apiService.createSprint({
      ...sprintData,
      projectId,
    })
    if (response.success) {
      setSprints((prev) => [...prev, response.data])
      return response.data
    }
    throw new Error(response.message)
  }

  const startSprint = async (sprintId) => {
    const response = await apiService.startSprint(sprintId, projectId)
    if (response.success) {
      setSprints((prev) =>
        prev.map((s) => {
          if (s.status === "active") {
            return { ...s, status: "completed" }
          }
          if (s._id === sprintId) {
            return { ...s, status: "active" }
          }
          return s
        })
      )
      setCurrentSprint(response.data)
      return response.data
    }
    throw new Error(response.message)
  }

  const completeSprint = async (sprintId, moveTasksTo) => {
    const response = await apiService.completeSprint(sprintId, moveTasksTo)
    if (response.success) {
      setSprints((prev) =>
        prev.map((s) => (s._id === sprintId ? { ...s, status: "completed" } : s))
      )
      setCurrentSprint(null)
      return response.data
    }
    throw new Error(response.message)
  }

  const deleteSprint = async (sprintId) => {
    const response = await apiService.deleteSprint(sprintId)
    if (response.success) {
      setSprints((prev) => prev.filter((s) => s._id !== sprintId))
      if (currentSprint?._id === sprintId) {
        setCurrentSprint(null)
      }
    }
    throw new Error(response.message)
  }

  useEffect(() => {
    fetchSprints()
  }, [projectId])

  return {
    sprints,
    currentSprint,
    loading,
    error,
    fetchSprints,
    createSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    setCurrentSprint,
  }
}

const SprintView = ({ projectId, onCreateSprint, onBacklogClick }) => {
  const {
    sprints,
    currentSprint,
    loading,
    createSprint,
    startSprint,
    completeSprint,
    setCurrentSprint,
  } = useSprint(projectId)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [sprintToComplete, setSprintToComplete] = useState(null)
  const [view, setView] = useState("board") // "board" or "list"

  const availableSprints = sprints.filter((s) => s.status !== "completed")
  const activeSprint = sprints.find((s) => s.status === "active")

  const handleStartSprint = async (sprintId) => {
    try {
      await startSprint(sprintId)
    } catch (err) {
      console.error("Failed to start sprint:", err)
    }
  }

  const handleCompleteSprint = async (sprintId, moveTasksTo) => {
    try {
      await completeSprint(sprintId, moveTasksTo)
      setShowCompleteDialog(false)
      setSprintToComplete(null)
    } catch (err) {
      console.error("Failed to complete sprint:", err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-accent-success"
      case "completed":
        return "bg-slate-400"
      default:
        return "bg-light-text-tertiary"
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBacklogClick}
            className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary"
          >
            ← Backlog
          </button>
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Sprint Board
          </h2>
          {currentSprint && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-success/20 text-accent-success">
              {currentSprint.name} (Active)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentSprint?._id || ""}
            onChange={(e) => {
              const sprint = sprints.find((s) => s._id === e.target.value)
              setCurrentSprint(sprint || null)
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-light-bg-primary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border"
          >
            <option value="">Select Sprint</option>
            {availableSprints.map((sprint) => (
              <option key={sprint._id} value={sprint._id}>
                {sprint.name} {sprint.status === "active" ? "(Active)" : ""}
              </option>
            ))}
          </select>

          {currentSprint && currentSprint.status !== "completed" && (
            <button
              onClick={() => {
                setSprintToComplete(currentSprint)
                setShowCompleteDialog(true)
              }}
              className="px-3 py-1.5 rounded-lg text-sm border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
            >
              Complete Sprint
            </button>
          )}

          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90"
          >
            <FiPlus className="w-4 h-4" />
            New Sprint
          </button>
        </div>
      </div>

      {/* Sprint Info */}
      {currentSprint && (
        <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                {currentSprint.name}
              </h3>
              {currentSprint.goal && (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {currentSprint.goal}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              <span>Start: {new Date(currentSprint.startDate).toLocaleDateString()}</span>
              <span>End: {new Date(currentSprint.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        {currentSprint ? (
          <div className="flex gap-4 h-full">
            {["todo", "in-progress", "under-review", "completed"].map((status) => (
              <div key={status} className="w-[300px] flex-shrink-0">
                <div className={`p-3 rounded-t-lg ${getStatusColor(currentSprint?.status)}`}>
                  <h4 className="font-semibold text-white text-sm uppercase">
                    {status.replace("-", " ")}
                  </h4>
                </div>
                <div className="p-3 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-b-lg min-h-[200px] border border-t-0 border-light-border dark:border-dark-border">
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-center py-8">
                    Tasks for {status.replace("-", " ")} will appear here
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-light-text-tertiary dark:text-dark-text-tertiary">
            <p className="text-lg mb-2">No active sprint selected</p>
            <p className="text-sm">Select a sprint above or create a new one</p>
          </div>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={async (data) => {
          await createSprint(data)
          setShowCreateDialog(false)
        }}
        projectId={projectId}
      />

      {/* Complete Sprint Dialog */}
      <CompleteSprintDialog
        isOpen={showCompleteDialog}
        onClose={() => {
          setShowCompleteDialog(false)
          setSprintToComplete(null)
        }}
        onComplete={(moveTasksTo) => handleCompleteSprint(sprintToComplete?._id, moveTasksTo)}
        sprint={sprintToComplete}
      />
    </div>
  )
}

export default SprintView
export { useSprint }
