import { Listbox } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Fragment, useCallback, useMemo, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import toast from "react-hot-toast"
import { FiChevronDown, FiFilter, FiPlus, FiSearch } from "react-icons/fi"
import apiService from "../../../service/apiService"
import Column from "./Column"
import ColumnHeader from "./ColumnHeader"
import TaskCard from "./TaskCard"

const KanbanBoard = ({
  columns,
  setColumns,
  projectId,
  members,
  openEditModal,
  openDeleteModal,
  onCreateTask,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterAssignee, setFilterAssignee] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Priority options
  const priorityOptions = [
    { id: "all", name: "All Priorities" },
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
    { id: "urgent", name: "Urgent" },
  ]

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

  const selectedPriorityObject = priorityOptions.find((p) => p.id === filterPriority)
  const selectedAssigneeObject = assigneeOptions.find((a) => a.id === filterAssignee)

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
          (task.assignedTo &&
            task.assignedTo.some((assignee) => assignee._id === filterAssignee));
        return matchesSearch && matchesPriority && matchesAssignee;
      });
      acc[status] = { ...column, tasks: filteredTasks };
      return acc;
    }, {});
  }, [columns, searchTerm, filterPriority, filterAssignee]);

  const handleTaskDrop = useCallback(
    async (item, newStatus, destinationIndex) => {
      const { _id: taskId, status: originalStatus, index } = item;
      const optimisticColumns = JSON.parse(JSON.stringify(columns));

      const sourceColumnTasks = [...optimisticColumns[originalStatus].tasks];
      const [movedTask] = sourceColumnTasks.splice(index, 1);
      movedTask.status = newStatus;

      const destColumnTasks = [...optimisticColumns[newStatus].tasks];
      destColumnTasks.splice(destinationIndex, 0, movedTask);

      const newColumns = {
        ...optimisticColumns,
        [originalStatus]: {
          ...optimisticColumns[originalStatus],
          tasks: sourceColumnTasks,
        },
        [newStatus]: {
          ...optimisticColumns[newStatus],
          tasks: destColumnTasks,
        },
      };

      setColumns(newColumns);

      try {
        await apiService.updateTask(projectId, taskId, { status: newStatus });
        toast.success("Task moved successfully!");
      } catch (error) {
        setColumns(optimisticColumns);
        toast.error("Failed to move task.");
      }
    },
    [columns, setColumns, projectId],
  );

  const clearFilters = () => {
    setSearchTerm("")
    setFilterPriority("all")
    setFilterAssignee("all")
  }

  const hasActiveFilters = searchTerm !== "" || filterPriority !== "all" || filterAssignee !== "all"

  return (
    <div className="flex h-full flex-col relative">
      {/* Fixed Filter Section */}
      <div className="sticky top-0 z-50 pb-4 px-1 md:px-4">
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
                className={`w-full md:w-auto btn-secondary flex gap-2 ${showFilters || hasActiveFilters ? "bg-primary text-white" : ""
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
                    <label htmlFor="priority" className="sr-only">Priority</label>
                    <Listbox value={filterPriority} onChange={setFilterPriority}>
                      <Listbox.Button className="filter-dropdown">
                        <span className="truncate capitalize">
                          {selectedPriorityObject?.name || "Priority"}
                        </span>
                        <FiChevronDown className="w-4 h-4 text-text-muted" />
                      </Listbox.Button>
                      <Listbox.Options className="filter-dropdown-options">
                        {priorityOptions.map((option) => (
                          <Listbox.Option key={option.id} value={option.id} as={Fragment}>
                            {({ active, selected }) => (
                              <li
                                className={`filter-dropdown-item ${active ? "bg-primary-dark" : ""
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
                    <label htmlFor="assignee" className="sr-only">Assignee</label>
                    <Listbox value={filterAssignee} onChange={setFilterAssignee}>
                      <Listbox.Button className="filter-dropdown">
                        <span className="truncate">
                          {selectedAssigneeObject?.name || "Assignee"}
                        </span>
                        <FiChevronDown className="w-4 h-4 text-text-muted" />
                      </Listbox.Button>
                      <Listbox.Options className="filter-dropdown-options">
                        {assigneeOptions.map((option) => (
                          <Listbox.Option key={option.id} value={option.id} as={Fragment}>
                            {({ active, selected }) => (
                              <li
                                className={`filter-dropdown-item ${active ? "bg-primary-dark" : ""
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
              <Column key={status} status={status} onDrop={handleTaskDrop}>
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
                      showFilterCount={hasActiveFilters && tasksToRender.length !== totalTasks}
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
            )
          })}
        </div>
      </DndProvider>
    </div>
  )
}

export default KanbanBoard
