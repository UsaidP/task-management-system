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
    const options = [{ id: "all", name: "All Members" }]
    if (members) {
      members.forEach((member) => {
        options.push({
          id: member._id,
          name: member.user?.fullname || member.fullname || member.email || "Unknown",
        })
      })
    }
    return options
  }, [members])

  const selectedPriorityObject = priorityOptions.find((p) => p.id === filterPriority)
  const selectedAssigneeObject = assigneeOptions.find((a) => a.id === filterAssignee)

  const membersMap = useMemo(() => {
    if (!members) return {}
    return members.reduce((acc, member) => {
      if (member.user) {
        acc[member.user._id] = member.user
      }
      // console.log(`Members map: ${JSON.stringify(acc)}`)
      return acc
    }, {})
  }, [members])

  const filteredColumns = useMemo(() => {
    return Object.entries(columns).reduce((acc, [status, column]) => {
      // console.info(`Status: ${status}, Column: ${JSON.stringify(column)}`);
      const filteredTasks = column.tasks.filter((task) => {
        console.log(`Filter Assignee ${filterAssignee}`)

        if (!task) return false
        const matchesSearch =
          searchTerm === "" ||
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPriority =
          filterPriority === "all" || task.priority?.toLowerCase() === filterPriority.toLowerCase()
        const matchesAssignee =
          filterAssignee === "all" || task.assignedTo?.includes(filterAssignee)
        return matchesSearch && matchesPriority && matchesAssignee
      })
      acc[status] = { ...column, tasks: filteredTasks }
      return acc
    }, {})
  }, [columns, searchTerm, filterPriority, filterAssignee])

  const handleTaskDrop = useCallback(
    async (item, newStatus, destinationIndex) => {
      const { id: taskId, status: originalStatus } = item
      if (originalStatus === newStatus) {
        const newColumns = { ...columns }
        const column = newColumns[originalStatus]
        const newTasks = Array.from(column.tasks)
        const [removed] = newTasks.splice(item.index, 1)
        newTasks.splice(destinationIndex, 0, removed)
        newColumns[originalStatus] = { ...column, tasks: newTasks }
        setColumns(newColumns)
        return
      }

      const previousColumns = JSON.parse(JSON.stringify(columns))
      const newColumns = { ...columns }
      const sourceColumn = { ...newColumns[originalStatus] }
      const destColumn = { ...newColumns[newStatus] }
      const sourceTasks = [...sourceColumn.tasks]
      const destTasks = [...destColumn.tasks]
      const taskIndex = sourceTasks.findIndex((t) => t._id === taskId)
      if (taskIndex === -1) return

      const [movedTask] = sourceTasks.splice(taskIndex, 1)
      movedTask.status = newStatus
      destTasks.splice(destinationIndex, 0, movedTask)
      newColumns[originalStatus] = { ...sourceColumn, tasks: sourceTasks }
      newColumns[newStatus] = { ...destColumn, tasks: destTasks }
      setColumns(newColumns)

      try {
        await apiService.updateTask(projectId, taskId, { status: newStatus })
        toast.success("Task moved successfully!")
      } catch (error) {
        setColumns(previousColumns)
        toast.error("Failed to move task.")
      }
    },
    [columns, setColumns, projectId]
  )

  const clearFilters = () => {
    setSearchTerm("")
    setFilterPriority("all")
    setFilterAssignee("all")
  }

  const hasActiveFilters = searchTerm !== "" || filterPriority !== "all" || filterAssignee !== "all"

  return (
    <div className="flex h-full flex-col relative">
      {/* Fixed Filter Section */}
      <div className="sticky top-0 z-50 bg-background pb-4 px-1">
        <div className="glass rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex gap-2 ${showFilters || hasActiveFilters ? "bg-primary text-white" : ""
                }`}
            >
              <FiFilter className="w-4 h-4" />
              Filters
            </button>

            {onCreateTask && (
              <button type="button" onClick={onCreateTask} className="btn-primary group flex gap-2">
                <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                New Task
              </button>
            )}
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
                  <div className="flex gap-2 items-center relative">
                    <label className="input-label shrink-0">Priority</label>
                    <Listbox value={filterPriority} onChange={setFilterPriority}>
                      <div className="relative">
                        <Listbox.Button className="w-40 px-3 py-2 bg-primary border border-border rounded-lg text-text-primary text-left flex items-center justify-between">
                          <span className="truncate capitalize">
                            {selectedPriorityObject?.name}
                          </span>
                          <FiChevronDown className="w-4 h-4 text-text-muted" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-50 mt-1 w-full bg-primary border border-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                          {priorityOptions.map((option) => (
                            <Listbox.Option
                              key={option.id}
                              value={option.id}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-primary-dark text-white" : "text-text-primary"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span
                                  className={`block truncate ${selected ? "font-semibold" : "font-normal"
                                    }`}
                                >
                                  {option.name}
                                </span>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </div>

                  {/* Assignee Filter */}
                  <div className="flex gap-2 items-center relative">
                    <Listbox value={filterAssignee} onChange={setFilterAssignee}>
                      <label className="input-label shrink-0">Assignee</label>
                      <div className="relative">
                        <Listbox.Button className="w-40 px-3 py-2 bg-primary border border-border rounded-lg text-text-primary text-left flex items-center justify-between">
                          <span className="truncate">{selectedAssigneeObject?.name}</span>
                          <FiChevronDown className="w-4 h-4 text-text-muted" />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-50 mt-1 w-full bg-primary border border-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                          {assigneeOptions.map((option) => (
                            <Listbox.Option
                              key={option.id}
                              value={option.id}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-primary-dark text-white" : "text-text-primary"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <span
                                  className={`block truncate ${selected ? "font-semibold" : "font-normal"
                                    }`}
                                >
                                  {option.name}
                                </span>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
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
        <div className="flex flex-1 items-stretch gap-6 overflow-x-auto px-1 pb-6 pt-2">
          {Object.entries(columns).map(([status, column]) => {
            const tasksToRender = filteredColumns[status]?.tasks || []
            const totalTasks = columns[status]?.tasks?.length || 0
            return (
              <Column key={status} status={status} onDrop={handleTaskDrop}>
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
                              onEdit={openEditModal}
                              onDelete={openDeleteModal}
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
