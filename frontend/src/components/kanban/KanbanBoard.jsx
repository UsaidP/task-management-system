import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import Column from './Column';
import TaskCard from './TaskCard';
import ColumnHeader from './ColumnHeader';
import toast from 'react-hot-toast';
import apiService from '../../../service/apiService';

const KanbanBoard = ({ columns, setColumns, projectId, members, openEditModal, openDeleteModal }) => {
  const onDrop = (item, status, index) => {
    if (item.status === status) {
      // Reordering within the same column
      const newColumns = { ...columns };
      const column = newColumns[status];
      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(item.index, 1);
      newTasks.splice(index, 0, removed);
      const newColumn = {
        ...column,
        tasks: newTasks,
      };
      setColumns({
        ...columns,
        [status]: newColumn,
      });
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
        // Revert the columns state if the API call fails
        setColumns(columns);
        toast.error("Failed to move task");
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex gap-8 pb-6">
        {Object.entries(columns).map(([status, column]) => (
          <Column key={status} status={status} onDrop={onDrop}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: Object.keys(columns).indexOf(status) * 0.1,
              }}
              className={`w-80 flex-shrink-0 glass rounded-xl p-6 transition-all duration-200`}
            >
              <ColumnHeader
                title={column.title}
                count={column.tasks.length}
                color={column.color}
                icon={column.icon}
              />

              <div className="space-y-4 min-h-[200px]">
                <AnimatePresence>
                  {column.tasks && column.tasks.length > 0 ? (
                    column.tasks.map((task, index) =>
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 border-2 border-dashed border-border rounded-lg text-text-muted"
                    >
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm">Drop tasks here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Column>
        ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;