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
      className={`task-card ${isDragging ? "opacity-50 shadow-lg rotate-2" : "opacity-100"}`}
      onClick={() => onEdit(task)}
    >
      <header className="task-card-header">
        <span className="tag tag-category">{category}</span>
        <span className={getStatusClass(task.status)}>{task.status}</span>
      </header>
      <main className="task-card-body">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
      </main>
      <div className="task-card-metadata">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        {task.dueDate && (
          <div className="due-date">
            <FiCalendar className="fa fa-calendar" />
            <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
      <div className="task-card-progress">
        <div className="progress-label">
          <span>Subtasks</span>
          <span>{completedSubtasks}/{totalSubtasks}</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <footer className="task-card-footer">
        <div className="task-meta-icons">
          <div className="icon-group">
            <FiMessageSquare />
            <span>{comments}</span>
          </div>
          <div className="icon-group">
            <FiPaperclip />
            <span>{attachments}</span>
          </div>
        </div>
        <div className="avatar-group">
          {assignees.slice(0, 3).map((assignee) => {
            const user = membersMap[assignee._id];
            if (!user) return null;
            return (
              <div
                key={user._id}
                className="avatar"
                style={{ backgroundImage: `url(${user.avatar?.url || `https://i.pravatar.cc/150?u=${user._id}`})` }}
                title={user.fullname}
              ></div>
            );
          })}
        </div>
      </footer>
    </motion.div>
  );
};

export default TaskCard;
