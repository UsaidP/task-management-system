import dayjs from "dayjs"
import { UserIcon } from "@animateicons/react/lucide"
import SharedAvatar from "../auth/Avatar"

const priorityStyles = {
  urgent: "bg-[#C44A4A22] text-[#C44A4A]",
  high: "bg-[#D45A5A22] text-[#D45A5A]",
  medium: "bg-[#D4A54822] text-[#D4A548]",
  low: "bg-[#6888A022] text-[#6888A0]",
}

const statusStyles = {
  todo: "bg-[#8B817822] text-[#8B8178]",
  "in-progress": "bg-[#C4654A22] text-[#C4654A]",
  "under-review": "bg-[#D4A54822] text-[#D4A548]",
  completed: "bg-[#7A9A6D22] text-[#7A9A6D]",
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  "under-review": "Under Review",
  completed: "Completed",
}

const Avatar = ({ member }) => (
  <SharedAvatar
    src={member?.user?.avatar?.url || member?.avatar?.url || member?.user?.avatar}
    alt={member?.user?.fullname || member?.fullname || "User"}
    size="xs"
    className="border-2 border-light-bg-primary dark:border-dark-bg-secondary"
  />
)

const ListViewTable = ({ tasks, members, onTaskClick }) => {
  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary">
      <table className="w-full border border-light-border dark:border-dark-border rounded-lg overflow-hidden shadow-md dark:shadow-dark-md bg-light-bg-primary dark:bg-dark-bg-primary">
        <thead className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary">
              Task
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary">
              Assignees
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-light-text-tertiary dark:text-dark-text-tertiary"
              >
                No tasks found
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const status = statusStyles[task.status] || statusStyles.todo
              const statusLabel = statusLabels[task.status] || task.status
              return (
                <tr
                  key={task._id}
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${priorityStyles[task.priority?.toLowerCase()] || priorityStyles.medium}`}
                    >
                      {task.priority || "Medium"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {task.assignedTo?.length > 0 ? (
                        task.assignedTo.slice(0, 3).map((a, i) => {
                          const userId = typeof a === "object" ? a._id || a.user?._id : a
                          const member = members.find((m) => (m.user?._id || m.user) === userId)
                          const userObj = member?.user || member
                          return <Avatar key={i} member={userObj} />
                        })
                      ) : (
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {dayjs(task.dueDate).format("MMM DD, YYYY")}
                      </span>
                    ) : (
                      <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ListViewTable
