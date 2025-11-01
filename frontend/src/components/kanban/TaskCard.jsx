import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  FiCalendar,
  FiMessageSquare,
  FiPaperclip,
} from "react-icons/fi";

const TaskCard = ({ task, index, onEdit, onDelete, membersMap, onDrop }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task._id, status: task.status },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [task]);

  const [, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => {
      if (item.id !== task._id) {
        onDrop(item, task.status, index);
      }
    },
  }), [task, index, onDrop]);

  drag(drop(ref));

  const getStatusClass = (status) => {
    const base = "tag";
    switch (status) {
      case "in-progress": return `${base} status-in-progress`;
      case "under-review": return `${base} status-under-review`;
      case "completed": return `${base} status-completed`;
      default: return `${base} status-todo`;
    }
  };

  const getPriorityClass = (priority) => {
    const base = "tag";
    switch (priority?.toLowerCase()) {
      case "urgent": return `${base} priority-urgent`;
      case "high": return `${base} priority-high`;
      case "medium": return `${base} priority-medium`;
      case "low": return `${base} priority-low`;
      default: return `${base} priority-medium`;
    }
  };
  console.log(`Task :${JSON.stringify(task)}`);
  // Mock data for new fields
  const category = task.labels || "Dev";
  const comments = task.comments || 0;
  const attachments = task.attachments || 0;
  const completedSubtasks = task.completedSubtasks || 0;
  const totalSubtasks = task.totalSubtasks || 1;
  const assignees = task.assignees || [];

  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`w-full p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 ${isDragging ? "opacity-50 shadow-lg rotate-2" : "opacity-100"}`}
    >
      <header className="flex justify-between items-center mb-2">
        <span className="tag tag-category">{category}</span>
        <span className={getStatusClass(task.status)}>{task.status}</span>
      </header>
      <main className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{task.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
      </main>
      <div className="flex justify-between items-center mb-4">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <FiCalendar />
            <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completedSubtasks}/{totalSubtasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <footer className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <FiMessageSquare />
            <span>{comments}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <FiPaperclip />
            <span>{attachments.filename}</span>
            <span>{attachments.url}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="avatar-group flex -space-x-2">
            {assignees.length > 0 && assignees.slice(0, 3).map((assignee) => {
              const user = membersMap[assignee._id];
              if (!user) return null;
              return (
                <div
                  key={user._id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.avatar?.url || `https://i.pravatar.cc/150?u=${user._id}`})` }}
                  title={user.fullname}
                ></div>
              );
            })}
          </div>
          <button
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2 text-gray-500 dark:text-gray-400"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default TaskCard;
