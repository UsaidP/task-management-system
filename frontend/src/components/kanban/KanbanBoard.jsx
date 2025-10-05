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
      // Reordering within the same column
      const newColumns = { ...columns };
      const column = newColumns[status];
      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(item.index, 1);
      newTasks.splice(index, 0, removed);
      const newColumn = { ...column, tasks: newTasks };
      setColumns({ ...columns, [status]: newColumn });
      
      // TODO: API call to update the order of tasks
      return;
    }

    // Moving from one list to another
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
      {/* 1. Main container now controls height and horizontal scrolling */}
      <div className="flex h-full flex-1 items-stretch gap-6 overflow-x-auto p-6 ">
        {Object.entries(columns).map(([status, column]) => (
          <Column key={status} status={status} onDrop={onDrop}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: Object.keys(columns).indexOf(status) * 0.08,
              }}
              className="xl:w-[300px] flex-shrink-0"
            >
              {/* 2. Inner div to manage flex layout and styling */}
              <div className="flex p-5 h-full flex-col rounded-xl glass">
                <ColumnHeader
                  title={column.title}
                  count={column.tasks.length}
                  color={column.color}
                  icon={column.icon}
                  className="p-4 flex-shrink-0" // Added padding here
                />

                {/* 3. Task list now scrolls vertically and fills available space */}
                <div className="flex-grow space-y-3 overflow-y-auto p-4">
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
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center text-text-muted"
                      >
                        <div className="mb-2 text-4xl">📋</div>
                        <p className="text-sm">Drop tasks here</p>
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
