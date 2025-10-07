import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import Column from "./Column";
import TaskCard from "./TaskCard";
import ColumnHeader from "./ColumnHeader";
import toast from "react-hot-toast";
import apiService from "../../../service/apiService";
import { FiFilter, FiSearch, FiPlus } from "react-icons/fi";

const KanbanBoard = ({
  columns,
  setColumns,
  projectId,
  members,
  openEditModal,
  openDeleteModal,
  onCreateTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter tasks based on search and filters
  const filterTasks = useCallback(
    (tasks) => {
      if (!tasks) return [];

      return tasks.filter((task) => {
        if (!task) return false;

        // Search filter
        const matchesSearch =
          searchTerm === "" ||
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Priority filter
        const matchesPriority =
          filterPriority === "all" ||
          task.priority?.toLowerCase() === filterPriority.toLowerCase();

        // Assignee filter
        const matchesAssignee =
          filterAssignee === "all" ||
          task.assignedTo?.some(
            (assignee) =>
              assignee._id === filterAssignee || assignee === filterAssignee
          );

        return matchesSearch && matchesPriority && matchesAssignee;
      });
    },
    [searchTerm, filterPriority, filterAssignee]
  );

  // Enhanced drag and drop with optimistic updates
  const onDrop = useCallback(
    async (item, status, index) => {
      const previousColumns = { ...columns };

      try {
        if (item.status === status) {
          // Reordering within the same column
          const newColumns = { ...columns };
          const column = newColumns[status];
          const newTasks = Array.from(column.tasks);
          const [removed] = newTasks.splice(item.index, 1);
          newTasks.splice(index, 0, removed);
          newColumns[status] = { ...column, tasks: newTasks };
          setColumns(newColumns);

          // API call to update task order
          // await apiService.updateTaskOrder(projectId, status, newTasks.map(t => t._id));
          return;
        }

        // Moving from one column to another
        const newColumns = { ...columns };
        const sourceColumn = newColumns[item.status];
        const destinationColumn = newColumns[status];

        const taskIndex = sourceColumn.tasks.findIndex(
          (task) => task._id === item.id
        );
        if (taskIndex === -1) return;

        const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
        movedTask.status = status;
        destinationColumn.tasks.splice(index, 0, movedTask);
        setColumns(newColumns);

        // Optimistic update - API call
        const toastId = toast.loading("Moving task...");
        await apiService.updateTask(projectId, item.id, { status });
        toast.success("Task moved successfully!", { id: toastId });
      } catch (error) {
        // Revert on error
        setColumns(previousColumns);
        toast.error("Failed to move task. Please try again.");
        console.error("Error moving task:", error);
      }
    },
    [columns, setColumns, projectId]
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterPriority("all");
    setFilterAssignee("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" || filterPriority !== "all" || filterAssignee !== "all";

  return (
    <div className="flex h-full flex-col">
      {/* Enhanced Filter Bar */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="glass rounded-xl p-4">
          {/* Search and Filter Toggle Row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-light border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? "bg-primary text-white"
                  : "bg-surface-light text-text-secondary hover:bg-surface-dark"
              }`}
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {hasActiveFilters && !showFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>

            {/* Create Task Button */}
            {onCreateTask && (
              <button
                onClick={onCreateTask}
                className="px-4 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success-dark transition-all flex items-center gap-2 group"
              >
                <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                New Task
              </button>
            )}
          </div>

          {/* Expandable Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  {/* Priority Filter */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Priority
                    </label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee Filter */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Assignee
                    </label>
                    <select
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="all">All Members</option>
                      {members?.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name || member.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="pt-5">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm text-text-secondary hover:text-error transition-colors font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-3"
          >
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filterPriority !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Priority: {filterPriority}
                <button
                  onClick={() => setFilterPriority("all")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filterAssignee !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Assignee:{" "}
                {members?.find((m) => m._id === filterAssignee)?.name ||
                  "Unknown"}
                <button
                  onClick={() => setFilterAssignee("all")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Kanban Columns */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-full flex-1 items-stretch gap-6 overflow-x-auto px-6 pb-6">
          {Object.entries(columns).map(([status, column]) => {
            const filteredTasks = filterTasks(column.tasks);
            const totalTasks = column.tasks?.length || 0;
            const visibleTasks = filteredTasks.length;

            return (
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
                  <div className="flex p-5 h-full flex-col rounded-xl glass">
                    <ColumnHeader
                      title={column.title}
                      count={visibleTasks}
                      totalCount={totalTasks}
                      color={column.color}
                      icon={column.icon}
                      className="p-4 flex-shrink-0"
                      showFilterCount={
                        hasActiveFilters && visibleTasks !== totalTasks
                      }
                    />

                    {/* Task List with Enhanced Empty State */}
                    <div className="flex-grow space-y-3 overflow-y-auto p-4">
                      <AnimatePresence mode="popLayout">
                        {filteredTasks && filteredTasks.length > 0 ? (
                          filteredTasks.map((task, index) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              index={index}
                              onEdit={openEditModal}
                              onDelete={openDeleteModal}
                              members={members}
                              onDrop={onDrop}
                            />
                          ))
                        ) : (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center text-text-muted"
                          >
                            {hasActiveFilters ? (
                              <>
                                <div className="mb-2 text-4xl">🔍</div>
                                <p className="text-sm font-medium">
                                  No matching tasks
                                </p>
                                <p className="text-xs mt-1">
                                  Try adjusting your filters
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="mb-2 text-4xl">📋</div>
                                <p className="text-sm font-medium">
                                  No tasks yet
                                </p>
                                <p className="text-xs mt-1">
                                  Drop tasks here or create new ones
                                </p>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Hidden tasks indicator */}
                    {hasActiveFilters && visibleTasks !== totalTasks && (
                      <div className="flex-shrink-0 px-4 pb-2 text-center">
                        <p className="text-xs text-text-muted">
                          {totalTasks - visibleTasks} task
                          {totalTasks - visibleTasks !== 1 ? "s" : ""} hidden by
                          filters
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Column>
            );
          })}
        </div>
      </DndProvider>
    </div>
  );
};

export default KanbanBoard;
