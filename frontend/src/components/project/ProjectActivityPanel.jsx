import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { UserIcon, ActivityIcon } from "@animateicons/react/lucide"
import { motion } from "framer-motion"

dayjs.extend(relativeTime)

const ProjectActivityPanel = ({ tasks, members }) => {
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5)

  return (
    <div className="flex-1 min-w-[320px] max-w-[340px] border-r border-light-border/50 dark:border-dark-border/50 pr-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
          Recent Activity
        </h2>
        <span className="text-[11px] text-accent-primary dark:text-accent-primary-light cursor-pointer font-bold hover:underline">
          View All
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        {recentTasks.length === 0 ? (
          <div className="py-4 flex flex-col items-center gap-2">
            <ActivityIcon className="w-8 h-8 text-light-text-tertiary/30" />
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary italic">
              No recent activity
            </p>
          </div>
        ) : (
          recentTasks.map((task, idx) => {
            const member = members.find((m) => (m.user?._id || m.user) === task.createdBy)
            const colorClass =
              task.status === "completed"
                ? "from-accent-success to-accent-success-light shadow-accent-success/20"
                : task.status === "in-progress"
                  ? "from-accent-primary to-accent-primary-light shadow-accent-primary/20"
                  : task.status === "under-review"
                    ? "from-accent-warning to-accent-warning-light shadow-accent-warning/20"
                    : "from-accent-info to-accent-info-light shadow-accent-info/20"

            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-3 items-start group"
              >
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {task.status === "completed" ? "Completed" : "Updated"}
                    </span>{" "}
                    task{" "}
                    <span className="text-accent-primary dark:text-accent-primary-light font-medium truncate inline-block max-w-[150px] align-bottom">
                      {task.title}
                    </span>
                  </p>
                  <p className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-light-text-tertiary/40" />
                    {dayjs(task.updatedAt).fromNow()}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ProjectActivityPanel
