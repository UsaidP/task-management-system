import { memo, useCallback, useRef, useState } from "react"
import { PlusIcon } from "@animateicons/react/lucide"
import TaskCard from "./TaskCard"

const DropIndicator = () => (
  <div className="flex items-center gap-1 py-0.5 pointer-events-none" aria-hidden="true">
    <div className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0" />
    <div className="h-0.5 flex-1 bg-accent-primary rounded-full" />
  </div>
)

const BoardColumn = memo(
  ({
    column,
    columnId,
    tasks,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onTaskClick,
    onDragStart,
    onDragEnd,
    onAddTask,
    onHeaderClick,
  }) => {
    const [dropIndex, setDropIndex] = useState(-1)
    // Ref to coordinate card-level and column-level dragOver handlers.
    // Card handler fires first (event bubbles child → parent), sets flag.
    // Column handler checks it to avoid overriding the precise index.
    const cardHandledRef = useRef(false)

    const handleCardDragOver = useCallback(
      (e, index) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        const midY = rect.top + rect.height / 2
        const newIndex = e.clientY < midY ? index : index + 1
        setDropIndex((prev) => (prev !== newIndex ? newIndex : prev))
        cardHandledRef.current = true
        onDragOver(e, columnId)
      },
      [onDragOver, columnId]
    )

    const handleColumnDragOver = useCallback(
      (e) => {
        e.preventDefault()
        onDragOver(e, columnId)
        // Only set index when no card handled this event (empty space / below cards)
        if (!cardHandledRef.current) {
          setDropIndex(tasks.length)
        }
        cardHandledRef.current = false
      },
      [onDragOver, columnId, tasks.length]
    )

    const handleColumnDragLeave = useCallback(
      (e) => {
        // Only clear when truly leaving the column (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setDropIndex(-1)
          onDragLeave()
        }
      },
      [onDragLeave]
    )

    const handleColumnDrop = useCallback(
      (e) => {
        e.preventDefault()
        const index = dropIndex >= 0 ? dropIndex : tasks.length
        setDropIndex(-1)
        onDrop(e, columnId, index)
      },
      [onDrop, columnId, dropIndex, tasks.length]
    )

    return (
      <div
        className={`w-72 flex-shrink-0 flex flex-col gap-3 transition-all duration-200 ${
          isDragOver
            ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-light-bg-primary dark:ring-offset-dark-bg-primary rounded-lg"
            : ""
        }`}
        onDragOver={handleColumnDragOver}
        onDragLeave={handleColumnDragLeave}
        onDrop={handleColumnDrop}
      >
        {/* Column Header */}
        {onHeaderClick ? (
          <button
            type="button"
            onClick={() => onHeaderClick(columnId)}
            className="flex items-center gap-2 px-3 py-2.5 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg border border-light-border dark:border-dark-border w-full cursor-pointer hover:opacity-90 transition-opacity"
            title={`Filter by ${column.title}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
            />
            <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary flex-1 truncate">
              {column.title}
            </span>
            <span className="w-6 h-6 flex items-center justify-center rounded-md bg-light-border/50 dark:bg-dark-border/50 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
              {tasks.length}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg border border-light-border dark:border-dark-border">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
            />
            <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary flex-1 truncate">
              {column.title}
            </span>
            <span className="w-6 h-6 flex items-center justify-center rounded-md bg-light-border/50 dark:bg-dark-border/50 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
              {tasks.length}
            </span>
          </div>
        )}

        {/* Column Content */}
        <div className="flex flex-col gap-2 min-h-[100px]">
          {tasks.map((task, index) => (
            <div key={task._id}>
              {isDragOver && dropIndex === index && <DropIndicator />}
              <div onDragOver={(e) => handleCardDragOver(e, index)}>
                <TaskCard
                  task={task}
                  onClick={onTaskClick}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              </div>
            </div>
          ))}
          {isDragOver && dropIndex === tasks.length && <DropIndicator />}
          <button
            type="button"
            onClick={onAddTask}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-light-border dark:border-dark-border text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-light-bg-primary dark:hover:bg-dark-bg-primary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-accent-primary/50 transition-all w-full text-sm font-medium bg-light-bg-primary dark:bg-dark-bg-primary"
          >
            <PlusIcon className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>
    )
  }
)

BoardColumn.displayName = "BoardColumn"

export default BoardColumn
