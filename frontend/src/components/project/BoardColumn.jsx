import { FiPlus } from "react-icons/fi"
import TaskCard from "./TaskCard"

const BoardColumn = ({
  column,
  tasks,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskClick,
  onDragStart,
  onDragEnd,
  onAddTask,
}) => {
  return (
    <div
      className={`w-72 flex-shrink-0 flex flex-col gap-3 transition-all duration-200 ${isDragOver ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-light-bg-primary dark:ring-offset-dark-bg-primary rounded-lg" : ""}`}
      onDragOver={(e) => onDragOver(e, column)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column)}
    >
      {/* Column Header */}
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

      {/* Column Content */}
      <div className="flex flex-col gap-2 min-h-[100px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={onTaskClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-light-border dark:border-dark-border text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-light-bg-primary dark:hover:bg-dark-bg-primary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-accent-primary/50 transition-all w-full text-sm font-medium bg-light-bg-primary dark:bg-dark-bg-primary"
        >
          <FiPlus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </div>
  )
}

export default BoardColumn
