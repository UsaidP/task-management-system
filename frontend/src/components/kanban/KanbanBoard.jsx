import { Listbox } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useCallback, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import toast from "react-hot-toast";
import { FiChevronDown, FiFilter, FiPlus, FiSearch } from "react-icons/fi";
import apiService from "../../../service/apiService";
import Column from "./Column";
import ColumnHeader from "./ColumnHeader";
import TaskCard from "./TaskCard";

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

  // Priority options
  const priorityOptions = [
    { id: "all", name: "All Priorities" },
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
    { id: "urgent", name: "Urgent" },
  ];

  // Assignee options
  const assigneeOptions = useMemo(() => {
    const options = [{ id: "all", name: "All Members" }];
    if (members) {
      members.forEach((member) => {
        const user = member.user || member;
        options.push({
          id: user._id,
          name: user.fullname || user.email || "Unknown",
        });
      });
    }
    return options;
  }, [members]);

  const selectedPriorityObject = priorityOptions.find(
    (p) => p.id === filterPriority
  );
  const selectedAssigneeObject = assigneeOptions.find(
    (a) => a.id === filterAssignee
  );

  const membersMap = useMemo(() => {
    if (!members) return {};
    return members.reduce((acc, member) => {
      const user = member.user || member;
      acc[user._id] = user;
      return acc;
    }, {});
  }, [members]);

  const filteredColumns = useMemo(() => {
    return Object.entries(columns).reduce((acc, [status, column]) => {
      const filteredTasks = column.tasks.filter((task) => {
        if (!task) return false;
        const matchesSearch =
          searchTerm === "" ||
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority =
          filterPriority === "all" ||
          task.priority?.toLowerCase() === filterPriority.toLowerCase();
        const matchesAssignee =
          filterAssignee === "all" ||
          task.assignedTo?.some((assignee) => assignee._id === filterAssignee);
        return matchesSearch && matchesPriority && matchesAssignee;
      });
      acc[status] = { ...column, tasks: filteredTasks };
      return acc;
    }, {});
  }, [columns, searchTerm, filterPriority, filterAssignee]);

  // --- FIXED handleTaskDrop ---
  // --- ROBUST handleTaskDrop ---
  const handleTaskDrop = useCallback(
    async (item, newStatus, destinationIndex) => {
      const { id: taskId, status: originalStatus } = item;

      // We need to store the *original* state for rollback
      let originalColumnsForRollback;

      setColumns((currentColumns) => {
        // Save the original state *before* mutation
        originalColumnsForRollback = currentColumns;

        // 1. Create a shallow copy of the columns object for the new state
        // We use the fresh 'currentColumns' state, not the stale 'columns' from the closure
        const newColumns = { ...currentColumns };

        // 2. Find the true index of the task in the *original* tasks array
        const sourceTasks = currentColumns[originalStatus]?.tasks;

        // 3. Safety check
        if (!sourceTasks) {
          console.error(`Source column "${originalStatus}" not found!`);
          return currentColumns; // Return state unmodified
        }

        const taskIndex = sourceTasks.findIndex((t) => t._id === taskId);

        // 4. Safety check
        if (taskIndex === -1) {
          console.error(`Dragged task not found in "${originalStatus}"!`);
          // This is the error you're seeing. It means item.status was stale.
          // The useDrag fix (above) MUST be applied.
          return currentColumns;
        }

        // 5. Get the task object to be moved
        const movedTask = sourceTasks[taskIndex];

        if (originalStatus === newStatus) {
          // --- CASE 1: REORDERING IN THE SAME COLUMN ---
          const newSourceTasks = [...sourceTasks];
          newSourceTasks.splice(taskIndex, 1);
          newSourceTasks.splice(destinationIndex, 0, {
            ...movedTask,
            status: newStatus,
          });

          newColumns[originalStatus] = {
            ...currentColumns[originalStatus],
            tasks: newSourceTasks,
          };
        } else {
          // --- CASE 2: MOVING TO A DIFFERENT COLUMN ---
          const newSourceTasks = sourceTasks.filter(
            (t, idx) => idx !== taskIndex
          );
          const destTasks = currentColumns[newStatus]?.tasks || []; // Handle case where dest column might be new
          const newDestTasks = [...destTasks];
          newDestTasks.splice(destinationIndex, 0, {
            ...movedTask,
            status: newStatus,
          });

          newColumns[originalStatus] = {
            ...currentColumns[originalStatus],
            tasks: newSourceTasks,
          };
          newColumns[newStatus] = {
            ...currentColumns[newStatus],
            tasks: newDestTasks,
          };
        }

        // Return the new state for React to set
        return newColumns;
      });

      // --- API Call & Rollback ---
      try {
        await apiService.updateTask(projectId, taskId, { status: newStatus });
        toast.success("Task moved successfully!");
      } catch (error) {
        toast.error("Failed to move task. Reverting.");
        // On failure, revert to the original state
        if (originalColumnsForRollback) {
          setColumns(originalColumnsForRollback);
        }
      }
    },
    [setColumns, projectId] // <-- REMOVE 'columns' from dependencies
  );
  const clearFilters = () => {
    setSearchTerm("");
    setFilterPriority("all");
    setFilterAssignee("all");
  };

  const hasActiveFilters =
    searchTerm !== "" || filterPriority !== "all" || filterAssignee !== "all";

  return (
    <div className="flex h-full flex-col relative">
      {/* Fixed Filter Section */}
      <div className="pb-4 px-1 md:px-4">
        <div className="glass rounded-xl p-4 shadow-md">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
            <div className="w-full md:flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="w-full md:w-auto flex gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full md:w-auto btn-secondary flex gap-2 ${showFilters || hasActiveFilters ? "bg-primary text-black" : ""
                  }`}
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>

              {onCreateTask && (
                <button
                  type="button"
                  onClick={onCreateTask}
                  className="w-full md:w-auto btn-primary group flex gap-2"
                >
                  <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  New Task
                </button>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-3 border-t border-border overflow-visible"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Priority Filter */}
                  <div className="relative">
                    <label htmlFor="priority" className="sr-only">
                      Priority
                    </label>
                    <Listbox
                      value={filterPriority}
                      onChange={setFilterPriority}
                    >
                      <Listbox.Button className="filter-dropdown ">
                        <span className="truncate capitalize">
                          {selectedPriorityObject?.name || "Priority"}
                        </span>
                        <FiChevronDown className="w-4 h-4 text-text-muted" />
                      </Listbox.Button>
                      <Listbox.Options className="filter-dropdown-options bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                        {priorityOptions.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            value={option.id}
                            as={Fragment}
                          >
                            {({ active, selected }) => (
                              <li
                                className={`filter-dropdown-item ${active ? "bg-primary" : ""
                                  }`}
                              >
                                <span
                                  className={`block truncate ${selected ? "font-semibold" : "font-normal"
                                    }`}
                                >
                                  {option.name}
                                </span>
                              </li>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>

                  {/* Assignee Filter */}
                  <div className="relative">
                    <label htmlFor="assignee" className="sr-only">
                      Assignee
                    </label>
                    <Listbox
                      value={filterAssignee}
                      onChange={setFilterAssignee}
                    >
                      <Listbox.Button className="filter-dropdown">
                        <span className="truncate">
                          {selectedAssigneeObject?.name || "Assignee"}
                        </span>
                        <FiChevronDown className="w-4 h-4 text-text-muted" />
                      </Listbox.Button>
                      <Listbox.Options className="filter-dropdown-options">
                        {assigneeOptions.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            value={option.id}
                            as={Fragment}
                          >
                            {({ active, selected }) => (
                              <li
                                className={`filter-dropdown-item ${active ? "bg-primary" : ""
                                  }`}
                              >
                                <span
                                  className={`block truncate ${selected ? "font-semibold" : "font-normal"
                                    }`}
                                >
                                  {option.name}
                                </span>
                              </li>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn-ghost text-sm text-error hover:bg-error/10"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Kanban Board */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-stretch gap-6 px-1 md:px-4 pb-6 pt-2">
            {Object.entries(columns).map(([status, column]) => {
              const tasksToRender = filteredColumns[status]?.tasks || [];
              const totalTasks = columns[status]?.tasks?.length || 0;
              return (
                <Column
                  key={status}
                  status={status}
                  onDrop={handleTaskDrop}
                  // FIX: Pass the current task count for dropping at the end
                  taskCount={tasksToRender.length}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: Object.keys(columns).indexOf(status) * 0.08,
                    }}
                    className="w-full md:w-[280px] xl:w-[320px] flex-shrink-0"
                  >
                    <div className="flex p-4 h-full flex-col rounded-xl glass">
                      <ColumnHeader
                        title={column.title}
                        count={tasksToRender.length}
                        totalCount={totalTasks}
                        color={column.color}
                        icon={column.icon}
                        showFilterCount={
                          hasActiveFilters &&
                          tasksToRender.length !== totalTasks
                        }
                      />
                      <div className="flex-grow space-y-3 overflow-y-auto p-1 -mr-2 pr-2">
                        <AnimatePresence mode="popLayout">
                          {tasksToRender.length > 0 ? (
                            tasksToRender.map((task, index) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                index={index}
                                onEdit={() => openEditModal(task)}
                                onDelete={() => openDeleteModal(task)}
                                membersMap={membersMap}
                                // FIX: Pass the onDrop handler for reordering
                                onDrop={handleTaskDrop}
                              />
                            ))
                          ) : (
                            <motion.div
                              layout
                              className="flex items-center justify-center text-sm text-text-muted text-center h-full p-10 border-2 border-dashed border-border rounded-lg"
                            >
                              {hasActiveFilters
                                ? "No tasks match your filters."
                                : "Drag tasks here or create one."}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                </Column>
              );
            })}
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default KanbanBoard;
