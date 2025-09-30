import React, { useState, useEffect } from "react";
import apiService from "../../../service/apiService.js";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      apiService.getSubTasksForTask(task._id).then((res) => {
        if (res.success) setSubtasks(res.data);
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const toastId = toast.loading("Updating task...");

    try {
      const response = await apiService.updateTask(task.project, task._id, {
        title,
        description,
        status,
      });
      if (response.success) {
        toast.success("Task updated successfully!", { id: toastId });
        onTaskUpdated(response.data);
        onClose();
      }
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to update task";
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    const toastId = toast.loading("Adding sub-task...");
    try {
      const response = await apiService.createSubTask(task._id, newSubtask);
      if (response.success) {
        toast.success("Sub-task added!", { id: toastId });
        setSubtasks([...subtasks, response.data]);
        setNewSubtask("");
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to add sub-task", {
        id: toastId,
      });
    }
  };

  const handleToggleSubtask = async (subtaskId, isCompleted) => {
    const toastId = toast.loading("Updating sub-task...");
    try {
      await apiService.updateSubTask(subtaskId, { isCompleted: !isCompleted });
      toast.success("Sub-task updated!", { id: toastId });
      setSubtasks(
        subtasks.map((st) =>
          st._id === subtaskId ? { ...st, isCompleted: !isCompleted } : st
        )
      );
    } catch (err) {
      toast.error(err.data?.message || "Failed to update sub-task", {
        id: toastId,
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    const toastId = toast.loading("Deleting sub-task...");
    try {
      await apiService.deleteSubTask(subtaskId);
      toast.success("Sub-task deleted!", { id: toastId });
      setSubtasks(subtasks.filter((st) => st._id !== subtaskId));
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete sub-task", {
        id: toastId,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800"
          >
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
              Edit Task
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                  className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Sub-tasks Section */}
              <div className="space-y-2">
                <h4 className="font-semibold">Sub-tasks</h4>
                {subtasks.map((st) => (
                  <div
                    key={st._id}
                    className="flex items-center justify-between"
                  >
                    <span
                      onClick={() =>
                        handleToggleSubtask(st._id, st.isCompleted)
                      }
                      className={`cursor-pointer ${
                        st.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a sub-task"
                    className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
