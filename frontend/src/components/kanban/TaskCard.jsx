import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import {
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi";

const TaskCard = ({ task, index, onEdit, onDelete, members, onDrop }) => {
  const ref = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task._id, status: task.status, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "task",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onDrop(item, task.status, hoverIndex);
      item.index = hoverIndex;
    },
  }));

  drag(drop(ref));

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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      onClick={() => onEdit(task)}
      className={`card-interactive border-l-4 ${getPriorityColor(
        task.priority
      )} cursor-pointer group ${
        isDragging ? "shadow-glow-lg rotate-2" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {task.title}
          </h3>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-light rounded"
          >
            <FiMoreVertical className="w-4 h-4 text-text-muted" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <FiEdit3 className="w-4 h-4 mr-2 inline-block" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiTrash2 className="w-4 h-4 mr-2 inline-block" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center space-x-2">
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignedTo.slice(0, 3).map((userId) => {
                const user = members.find((m) => m._id === userId);
                return (
                  <div
                    key={userId}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-medium border-2 border-surface"
                  >
                    {user?.fullname?.charAt(0) || "U"}
                  </div>
                );
              })}
              {task.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-text-muted flex items-center justify-center text-white text-xs font-medium border-2 border-surface">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs">
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </motion.div>
  );
};

export default TaskCard;