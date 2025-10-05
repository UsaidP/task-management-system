import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import Column from "./Column";
import TaskCard from "./TaskCard";
import ColumnHeader from "./ColumnHeader";
import toast from "react-hot-toast";
import apiService from "../../../service/apiService";

const KanbanBoard = ({
  columns,
  setColumns,
  projectId,
  members,
  openEditModal,
  openDeleteModal,
}) => {
  const onDrop = (item, status, index) => {
    if (item.status === status) {
      const newColumns = { ...columns };
      const column = newColumns[status];
      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(item.index, 1);
      newTasks.splice(index, 0, removed);
      const newColumn = { ...column, tasks: newTasks };
      setColumns({ ...columns, [status]: newColumn });
      return;
    }

    const newColumns = { ...columns };
    const sourceColumn = newColumns[item.status];
    const destinationColumn = newColumns[status];
    const [movedTask] = sourceColumn.tasks.splice(
      sourceColumn.tasks.findIndex((task) => task._id === item.id),
      1
    );
    movedTask.status = status;
    destinationColumn.tasks.push(movedTask);
    setColumns(newColumns);

    apiService
      .updateTask(projectId, item.id, { status })
      .then(() => {
        toast.success("Task moved successfully!");
      })
      .catch(() => {
        setColumns(columns);
        toast.error("Failed to move task");
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full flex-1 items-start gap-6 overflow-x-auto pb-6 px-1">
        {Object.entries(columns).map(([status, column]) => (
          <Column key={status} status={status} onDrop={onDrop}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: Object.keys(columns).indexOf(status) * 0.08,
              }}
              className="flex-shrink-0 w-80"
            >
              <div className="flex h-full max-h-[calc(100vh-240px)] min-h-[500px] flex-col rounded-xl glass">
                <div className="p-5 flex-shrink-0">
                  <ColumnHeader
                    title={column.title}
                    count={column.tasks.length}
                    color={column.color}
                    icon={column.icon}
                  />
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <AnimatePresence>
                    {column.tasks && column.tasks.length > 0 ? (
                      column.tasks.map(
                        (task, index) =>
                          task && (
                            <TaskCard
                              key={task._id}
                              task={task}
                              index={index}
                              onEdit={openEditModal}
                              onDelete={openDeleteModal}
                              members={members}
                              onDrop={onDrop}
                            />
                          )
                      )
                    ) : (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center text-text-muted mt-2"
                      >
                        <div className="mb-2 text-4xl opacity-50">📋</div>
                        <p className="text-sm font-medium">Drop tasks here</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </Column>
        ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
