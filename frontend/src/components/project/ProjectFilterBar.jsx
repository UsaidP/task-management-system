import { ChevronDownIcon } from "@animateicons/react/lucide"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { FilterIcon } from "lucide-react"

const ProjectFilterBar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  dateFilter,
  onDateChange,
  members,
}) => {
  const hasActiveFilters =
    searchQuery || statusFilter || priorityFilter || assigneeFilter || dateFilter

  const clearAll = () => {
    onSearchChange("")
    onStatusChange("")
    onPriorityChange("")
    onAssigneeChange("")
    onDateChange("")
  }

  return (
    <fieldset
      className="flex items-center gap-2 flex-wrap border-none p-0"
      aria-label="Task filters"
    >
      <button
        type="button"
        className={`flex items-center gap-1.5 px-3 py-1.5 h-9 text-xs sm:text-sm font-medium rounded-lg border transition-all appearance-none whitespace-nowrap ${hasActiveFilters ? "bg-accent-primary text-white border-primary hover:bg-accent-primary-dark shadow-sm" : "bg-light-bg-primary text-text-primary border-border hover:bg-bg-hover hover:border-accent-primary/50"}`}
        aria-label="Toggle filters"
      >
        <FilterIcon className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* Status Filter */}
      <Listbox value={statusFilter} onChange={onStatusChange}>
        <div className="relative min-w-[150px] sm:min-w-[170px]">
          <ListboxButton
            className="w-full text-left flex items-center justify-between h-9 px-3 text-xs sm:text-sm font-medium bg-bg-canvas border border-border rounded-lg hover:bg-bg-hover transition-all"
            aria-label="Filter by status"
          >
            <span className="truncate capitalize">
              {statusFilter ? statusFilter.replace("-", " ") : "All Status"}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </ListboxButton>
          <ListboxOptions className="absolute z-[100] mt-1 w-full bg-bg-canvas border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
            <ListboxOption
              value=""
              className={({ active }) =>
                `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
              }
            >
              {({ selected }) => (
                <span
                  className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                >
                  All Status
                </span>
              )}
            </ListboxOption>
            {["todo", "in-progress", "under-review", "completed"].map((status) => (
              <ListboxOption
                key={status}
                value={status}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                }
              >
                {({ selected }) => (
                  <span
                    className={`block truncate capitalize ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                  >
                    {status.replace("-", " ")}
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Priority Filter */}
      <Listbox value={priorityFilter} onChange={onPriorityChange}>
        <div className="relative min-w-[150px] sm:min-w-[170px]">
          <ListboxButton
            className="w-full text-left flex items-center justify-between h-9 px-3 text-xs sm:text-sm font-medium bg-bg-canvas border border-border rounded-lg hover:bg-bg-hover transition-all"
            aria-label="Filter by priority"
          >
            <span className="truncate capitalize">{priorityFilter || "All Priority"}</span>
            <ChevronDownIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </ListboxButton>
          <ListboxOptions className="absolute z-[100] mt-1 w-full bg-bg-canvas border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
            <ListboxOption
              value=""
              className={({ active }) =>
                `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
              }
            >
              {({ selected }) => (
                <span
                  className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                >
                  All Priority
                </span>
              )}
            </ListboxOption>
            {["low", "medium", "high", "urgent"].map((priority) => (
              <ListboxOption
                key={priority}
                value={priority}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                }
              >
                {({ selected }) => (
                  <span
                    className={`block truncate capitalize ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                  >
                    {priority}
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Assignee Filter */}
      <Listbox value={assigneeFilter} onChange={onAssigneeChange}>
        <div className="relative min-w-[170px] sm:min-w-[190px]">
          <ListboxButton
            className="w-full text-left flex items-center justify-between h-9 px-3 text-xs sm:text-sm font-medium bg-bg-canvas border border-border rounded-lg hover:bg-bg-hover transition-all"
            aria-label="Filter by assignee"
          >
            <span className="truncate">{assigneeFilter || "All Assignees"}</span>
            <ChevronDownIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </ListboxButton>
          <ListboxOptions className="absolute z-[100] mt-1 w-full bg-bg-canvas border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
            <ListboxOption
              value=""
              className={({ active }) =>
                `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
              }
            >
              {({ selected }) => (
                <span
                  className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                >
                  All Assignees
                </span>
              )}
            </ListboxOption>
            {members.map((m) => (
              <ListboxOption
                key={m.user?._id}
                value={m.user?.fullname || ""}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                }
                role="option"
              >
                {({ selected }) => (
                  <span
                    className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                  >
                    {m.user?.fullname}
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Date Filter */}
      <Listbox value={dateFilter} onChange={onDateChange}>
        <div className="relative min-w-[150px] sm:min-w-[170px]">
          <ListboxButton
            className="w-full text-left flex items-center justify-between h-9 px-3 text-xs sm:text-sm font-medium bg-bg-canvas border border-border rounded-lg hover:bg-bg-hover transition-all"
            aria-label="Filter by date"
          >
            <span className="truncate">
              {dateFilter ? dateFilter.replace("due-", "Due ").replace("_", " ") : "Any Date"}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </ListboxButton>
          <ListboxOptions className="absolute z-[100] mt-1 w-full bg-bg-canvas border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
            <ListboxOption
              value=""
              className={({ active }) =>
                `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
              }
            >
              {({ selected }) => (
                <span
                  className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                >
                  Any Date
                </span>
              )}
            </ListboxOption>
            {[
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Due Today" },
              { value: "week", label: "Due This Week" },
              { value: "month", label: "Due This Month" },
            ].map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                }
              >
                {({ selected }) => (
                  <span
                    className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                  >
                    {opt.label}
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs sm:text-sm font-medium text-primary hover:underline"
          aria-label="Clear all filters"
        >
          Clear
        </button>
      )}
    </fieldset>
  )
}

export default ProjectFilterBar
