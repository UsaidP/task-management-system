import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiUsers, FiMoreVertical, FiEdit3, FiTrash2, FiClock, FiCheckCircle, FiCircle } from "react-icons/fi";
import apiService from "../../../service/apiService.js";
import CreateTaskModal from "../task/CreateTaskModal";
import EditTaskModal from "../task/EditTaskModal";
import Modal from "../Modal";
import ProjectMembers from "./ProjectMembers";
import TaskCardSkeleton from "../task/TaskCardSkeleton";
import Skeleton from "../Skeleton";
import toast from "react-hot-toast";

const TaskCard = ({ task, index, onEdit }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <FiCircle className="w-4 h-4 text-text-muted" />;
      case 'in-progress':
        return <FiClock className="w-4 h-4 text-warning" />;
      case 'done':
        return <FiCheckCircle className="w-4 h-4 text-success" />;
      default:
        return <FiCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getPriorityColor = (priority = 'medium') => {
    switch (priority) {
      case 'high':
        return 'border-l-error';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
      default:
        return 'border-l-primary';
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ y: -2 }}
          onClick={() => onEdit(task)}
          className={`card-interactive border-l-4 ${getPriorityColor(task.priority)} cursor-pointer group ${
            snapshot.isDragging ? 'shadow-glow-lg rotate-2' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(task.status)}
              <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                {task.title}
              </h3>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-light rounded">
              <FiMoreVertical className="w-4 h-4 text-text-muted" />
            </button>
          </div>
          
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">
            {task.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center space-x-2">
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div className="flex -space-x-1">
                  {task.assignedTo.slice(0, 3).map((user, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-medium border-2 border-surface"
                    >
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  ))}
                  {task.assignedTo.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-text-muted flex items-center justify-center text-white text-xs font-medium border-2 border-surface">
                      +{task.assignedTo.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-xs">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};

const ColumnHeader = ({ title, count, color, icon }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm text-text-muted">{count} tasks</span>
      </div>
    </div>
  </div>
);

const ProjectPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectResponse, tasksResponse] = await Promise.all([
          apiService.getProjectById(projectId),
          apiService.getTasksByProjectId(projectId),
        ]);

        if (projectResponse.success) {
          setProject(projectResponse.data);
        } else {
          setError("Failed to fetch project details");
        }

        if (tasksResponse.success) {
          setTasks(tasksResponse.data);
        } else {
          setError((prev) => prev + " Failed to fetch tasks");
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
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success("Task created successfully!");
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    toast.success("Task updated successfully!");
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
    const newStatus = destination.droppableId;

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await apiService.updateTask(projectId, draggableId, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
    } catch (err) {
      // Revert on error
      setTasks(tasks);
      toast.error("Failed to update task status");
      setError("Failed to update task status");
    }
  };

  const columns = {
    todo: {
      title: "To Do",
      tasks: tasks.filter((task) => task.status === "todo"),
      color: "bg-text-muted/20",
      icon: <FiCircle className="w-5 h-5 text-text-muted" />
    },
    "in-progress": {
      title: "In Progress",
      tasks: tasks.filter((task) => task.status === "in-progress"),
      color: "bg-warning/20",
      icon: <FiClock className="w-5 h-5 text-warning" />
    },
    done: {
      title: "Done",
      tasks: tasks.filter((task) => task.status === "done"),
      color: "bg-success/20",
      icon: <FiCheckCircle className="w-5 h-5 text-success" />
    },
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Oops! Something went wrong</h2>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-8 overflow-x-auto pb-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-80 flex-shrink-0 glass rounded-xl p-6"
                >
                  <Skeleton className="h-6 w-1/3 mb-6" />
                  <div className="space-y-4">
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                  </div>
                </div>
              ))
            : Object.entries(columns).map(([status, column]) => (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: Object.keys(columns).indexOf(status) * 0.1 }}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`w-80 flex-shrink-0 glass rounded-xl p-6 transition-all duration-200 ${
                        snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : ''
                      }`}
                    >
                      <ColumnHeader
                        title={column.title}
                        count={column.tasks.length}
                        color={column.color}
                        icon={column.icon}
                      />
                      
                      <div className="space-y-4 min-h-[200px]">
                        <AnimatePresence>
                          {column.tasks.length > 0 ? (
                            column.tasks.map((task, index) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                index={index}
                                onEdit={openEditModal}
                              />
                            ))
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8 border-2 border-dashed border-border rounded-lg text-text-muted"
                            >
                              <div className="text-4xl mb-2">📋</div>
                              <p className="text-sm">Drop tasks here</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    </motion.div>
                  )}
                </Droppable>
              ))}
        </div>
      </DragDropContext>

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
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title="Project Members"
      >
        <ProjectMembers projectId={projectId} />
      </Modal>
    </motion.div>
  );
};

export default ProjectPage;