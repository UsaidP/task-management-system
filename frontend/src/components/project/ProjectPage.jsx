import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "../../../service/apiService.js";
import CreateTaskModal from "../task/CreateTaskModal";
import EditTaskModal from "../task/EditTaskModal";
import Modal from "../Modal";
import ProjectMembers from "./ProjectMembers";
import TaskCardSkeleton from "../task/TaskCardSkeleton";
import Skeleton from "../Skeleton";
import { FiPlus } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

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
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const onDragEnd = (result) => {
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

    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    apiService
      .updateTask(projectId, draggableId, { status: newStatus })
      .catch((err) => {
        setTasks(tasks);
        setError("Failed to update task status");
      });
  };

  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        {loading ? (
          <div className="w-1/2">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {project.name}
            </h1>
            <p className="text-md text-text-secondary">{project.description}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setIsMembersModalOpen(true)}
            className="px-4 py-2 font-medium text-white bg-secondary rounded-md hover:bg-primary"
          >
            Manage Members
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 font-medium text-white bg-accent/80 rounded-md hover:bg-accent"
          >
            <FiPlus className="mr-2" />
            Create Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-80 flex-shrink-0 p-4 bg-primary/50 backdrop-blur-lg border border-secondary rounded-lg"
                >
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <div className="space-y-4">
                    <TaskCardSkeleton />
                    <TaskCardSkeleton />
                  </div>
                </div>
              ))
            : Object.entries(columns).map(([status, tasksInColumn]) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="w-80 flex-shrink-0 p-4 bg-primary/50 backdrop-blur-lg border border-secondary rounded-lg"
                    >
                      <h2 className="text-xl font-bold mb-4 capitalize text-text-primary">
                        {status.replace("-", " ")}
                      </h2>
                      <motion.div
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {tasksInColumn.length > 0 ? (
                          tasksInColumn.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openEditModal(task)}
                                  className="p-4 bg-secondary rounded-md shadow-lg cursor-pointer hover:bg-primary flex justify-between items-start"
                                  variants={itemVariants}
                                >
                                  <div>
                                    <h3 className="font-bold text-text-primary">
                                      {task.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-1">
                                      {task.description}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="text-sm text-center text-text-secondary p-4 border-2 border-dashed border-secondary rounded-md">
                            Drop tasks here
                          </div>
                        )}
                        {provided.placeholder}
                      </motion.div>
                    </motion.div>
                  )}
                </Droppable>
              ))}
        </div>
      </DragDropContext>

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
