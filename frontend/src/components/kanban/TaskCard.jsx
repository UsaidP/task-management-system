import React from "react";
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import {
  FiMoreVertical,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

const TaskCard = ({ task, index, onEdit, onDelete, members }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task._id, status: task.status, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo":
        return <FiCircle className="w-4 h-4 text-text-muted" />;
      case "in-progress":
        return <FiClock className="w-4 h-4 text-warning" />;
      case "done":
        return <FiCheckCircle className="w-4 h-4 text-success" />;
      default:
        return <FiCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getPriorityColor = (priority = "medium") => {
    switch (priority) {
      case "high":
        return "border-l-error";
      case "medium":
        return "border-l-warning";
      case "low":
        return "border-l-success";
      default:
        return "border-l-primary";
    }
  };

  const getPriorityBadge = (priority = "medium") => {
    const badges = {
      high: "bg-error/10 text-error border-error/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      low: "bg-success/10 text-success border-success/20",
    };
    return badges[priority] || badges.medium;
  };

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`card-interactive border-l-4 ${getPriorityColor(
        task.priority
      )} group relative ${
        isDragging ? "opacity-50 scale-95 shadow-glow-lg" : ""
      } transition-all duration-200`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
            title="Edit task"
          >
            <FiEdit3 className="w-3.5 h-3.5 text-primary" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="p-1.5 hover:bg-error/10 rounded-md transition-colors"
              title="Delete task"
            >
              <FiTrash2 className="w-3.5 h-3.5 text-error" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((user, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold border-2 border-surface shadow-sm"
                  title={user.name || "User"}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              ))}
              {task.assignedTo.length > 3 && (
                <div
                  className="w-7 h-7 rounded-full bg-surface-light flex items-center justify-center text-text-muted text-xs font-semibold border-2 border-surface shadow-sm"
                  title={`+${task.assignedTo.length - 3} more`}
                >
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}

          <span
            className={`text-xs px-2 py-1 rounded-md border font-medium ${getPriorityBadge(
              task.priority
            )}`}
          >
            {task.priority || "medium"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <FiClock className="w-3.5 h-3.5" />
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
