import { useParams } from "react-router-dom"
import { useState } from "react"
import { FiPlus } from "react-icons/fi"
import useSprint from "../../hooks/useSprint.js"
import CompleteSprintDialog from "./CompleteSprintDialog.jsx"
import CreateSprintDialog from "./CreateSprintDialog.jsx"
import SprintBoard from "./SprintBoard.jsx"

const SprintView = () => {
  const { projectId } = useParams()
  const { sprints, currentSprint, completeSprint, setCurrentSprint, setSprints } =
    useSprint(projectId)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [sprintToComplete, setSprintToComplete] = useState(null)

  const availableSprints = sprints.filter((s) => s.status !== "completed")

  const handleCompleteSprint = async (sprintId, moveTasksTo) => {
    try {
      await completeSprint(sprintId, moveTasksTo)
      setShowCompleteDialog(false)
      setSprintToComplete(null)
    } catch (err) {
      console.error("Failed to complete sprint:", err)
    }
  }

  return (
    <div className="h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Sprint Board
          </h2>
          {currentSprint && (
            <span className="px-3 py-1 rounded-xl text-xs font-medium bg-accent-success/10 text-accent-success">
              {currentSprint.name} (Active)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Select sprint"
            value={currentSprint?._id || ""}
            onChange={(e) => {
              const sprint = sprints.find((s) => s._id === e.target.value)
              setCurrentSprint(sprint || null)
            }}
            className="px-3 py-1.5 rounded-xl text-sm bg-light-bg-primary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-colors"
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
              type="button"
              onClick={() => {
                setSprintToComplete(currentSprint)
                setShowCompleteDialog(true)
              }}
              className="px-3 py-1.5 rounded-xl text-sm border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            >
              Complete Sprint
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
          >
            <FiPlus className="w-4 h-4" aria-hidden="true" />
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
      {currentSprint ? (
        <SprintBoard sprintId={currentSprint._id} projectId={projectId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary">
          <p className="text-lg mb-2">No active sprint selected</p>
          <p className="text-sm">Select a sprint above or create a new one</p>
        </div>
      )}

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSprintCreated={(data) => {
          setSprints((prev) => [data, ...prev])
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
