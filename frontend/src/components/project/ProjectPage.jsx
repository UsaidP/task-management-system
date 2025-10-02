import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi";
import apiService from "../../../service/apiService.js";
import CreateTaskModal from "../task/CreateTaskModal";
import EditTaskModal from "../task/EditTaskModal";
import Modal from "../Modal";
import ProjectMembers from "./ProjectMembers";
import TaskCardSkeleton from "../task/TaskCardSkeleton";
import Skeleton from "../Skeleton";
import toast from "react-hot-toast";
import KanbanBoard from "../kanban/KanbanBoard";

const ProjectPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [columns, setColumns] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectResponse, tasksResponse, membersResponse] =
          await Promise.all([
            apiService.getProjectById(projectId),
            apiService.getTasksByProjectId(projectId),
            apiService.getAllMembers(projectId),
            apiService.addMember(projectId),
          ]);

        if (projectResponse.success) {
          setProject(projectResponse.data);
        } else {
          setError("Failed to fetch project details");
        }

        if (tasksResponse.success) {
          const tasks = tasksResponse.data;
          setColumns({
            todo: {
              title: "To Do",
              tasks: tasks.filter((task) => task.status === "todo"),
              color: "bg-text-muted/20",
              icon: <FiCircle className="w-5 h-5 text-text-muted" />,
            },
            "in-progress": {
              title: "In Progress",
              tasks: tasks.filter((task) => task.status === "in-progress"),
              color: "bg-warning/20",
              icon: <FiClock className="w-5 h-5 text-warning" />,
            },
            done: {
              title: "Done",
              tasks: tasks.filter((task) => task.status === "done"),
              color: "bg-success/20",
              icon: <FiCheckCircle className="w-5 h-5 text-success" />,
            },
          });
        } else {
          setError((prev) => prev + " Failed to fetch tasks");
        }

        if (membersResponse.success) {
          setMembers(membersResponse.data);
        } else {
          setError((prev) => prev + " Failed to fetch members");
        }
      } catch (err) {
        setError("An error occurred while fetching project data.");
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleTaskCreated = (newTask) => {
    const newColumns = { ...columns };
    newColumns[newTask.status].tasks.push(newTask);
    setColumns(newColumns);
    toast.success("Task created successfully!");
  };

  const handleTaskUpdated = (updatedTask) => {
    const newColumns = { ...columns };
    const column = newColumns[updatedTask.status];
    const taskIndex = column.tasks.findIndex(
      (task) => task._id === updatedTask._id
    );
    if (taskIndex !== -1) {
      column.tasks[taskIndex] = updatedTask;
      setColumns(newColumns);
    }
    toast.success("Task updated successfully!");
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    const toastId = toast.loading("Deleting task...");
    try {
      await apiService.deleteTask(projectId, taskId);
      const newColumns = { ...columns };
      for (const status in newColumns) {
        newColumns[status].tasks = newColumns[status].tasks.filter(
          (task) => task._id !== taskId
        );
      }
      setColumns(newColumns);
      toast.success("Task deleted successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete task", { id: toastId });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    }
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {loading ? (
          <div className="flex-1">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              {project.name}
            </h1>
            <p className="text-lg text-text-secondary">{project.description}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="btn-ghost flex items-center"
          >
            <FiUsers className="mr-2" />
            Members
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center group"
          >
            <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Add Task
          </button>
        </motion.div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex gap-8 pb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-80 flex-shrink-0 glass rounded-xl p-6">
              <Skeleton className="h-6 w-1/3 mb-6" />
              <div className="space-y-4">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          columns={columns}
          setColumns={setColumns}
          projectId={projectId}
          members={members}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdated}
        task={selectedTask}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div>
          <p>Are you sure you want to delete this task?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selectedTask._id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ProjectPage;
