import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import Avatar from "../auth/Avatar"

const ProjectTeamPanel = ({ members, tasks }) => {
  const memberStats = useMemo(() => {
    // Aggregator map to handle potential duplicates or fragmented user data
    const statsMap = new Map()

    members.forEach((m) => {
      const rawId = m.user?._id || m.user
      if (!rawId) return

      const userId = typeof rawId === "object" ? rawId._id : rawId
      const name = m.user?.fullname || "User"

      // We use a combination of ID and Name for safer deduplication if IDs are inconsistent
      // but primarily we should trust the ID if it's a valid ObjectId
      const key = userId

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          ...m,
          id: userId,
          name: name,
          taskCount: 0,
          completedCount: 0,
        })
      }
    })

    // Calculate aggregated stats for each unique member
    return Array.from(statsMap.values())
      .map((stat) => {
        const userTasks = tasks.filter((t) =>
          t.assignedTo?.some((a) => (typeof a === "object" ? a._id : a) === stat.id)
        )
        return {
          ...stat,
          taskCount: userTasks.length,
          completedCount: userTasks.filter((t) => t.status === "completed").length,
        }
      })
      .sort((a, b) => b.taskCount - a.taskCount || a.name.localeCompare(b.name))
  }, [members, tasks])

  return (
    <div className="flex-1 min-w-[320px] max-w-sm border-r border-light-border/50 dark:border-dark-border/50 px-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
          Team Performance
          {memberStats.length > 0 && (
            <span className="text-[10px] bg-accent-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
              {memberStats.length}
            </span>
          )}
        </h2>
        <span className="text-[11px] text-text-muted font-bold hover:text-accent-primary cursor-pointer transition-colors">
          Stats
        </span>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        <AnimatePresence mode="popLayout">
          {memberStats.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-text-muted py-4 italic w-full text-center"
            >
              No team members assigned
            </motion.p>
          ) : (
            memberStats.slice(0, 6).map((member, idx) => {
              const progress =
                member.taskCount > 0 ? (member.completedCount / member.taskCount) * 100 : 0
              const isDone = progress === 100 && member.taskCount > 0

              return (
                <motion.div
                  key={member.id || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col items-center gap-2.5 min-w-[80px] group cursor-default"
                >
                  <div className="relative">
                    <div className="relative p-0.5 rounded-full transition-transform duration-300 group-hover:scale-105">
                      <Avatar
                        src={member.user?.avatar?.url || member.user?.avatar}
                        alt={member.name}
                        size="md"
                        className={`ring-2 ring-offset-2 ring-offset-light-bg-secondary dark:ring-offset-dark-bg-tertiary ${isDone ? "ring-accent-success/40 group-hover:ring-accent-success" : "ring-accent-primary/20 group-hover:ring-accent-primary"} transition-all duration-300`}
                      />
                    </div>
                    {member.taskCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 w-4.5 h-4.5 ${isDone ? "bg-accent-success" : "bg-accent-primary"} text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-light-bg-secondary dark:border-dark-bg-tertiary shadow-md z-10`}
                      >
                        {member.taskCount}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-0.5">
                    <span className="text-[11px] font-bold text-text-primary text-center truncate max-w-[75px] group-hover:text-accent-primary transition-colors">
                      {member.name.split(" ")[0].toLowerCase()}
                    </span>
                    <span className="text-[9px] text-text-muted font-extrabold uppercase tracking-tighter">
                      {member.completedCount}/{member.taskCount} done
                    </span>
                  </div>

                  <div className="w-16 h-1.5 rounded-full bg-bg-hover overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                      className="h-full rounded-full shadow-sm"
                      style={{
                        backgroundColor:
                          member.taskCount > 0
                            ? progress === 100
                              ? "#7A9A6D"
                              : progress > 50
                                ? "#D4A548"
                                : "#C4654A"
                            : "#8B8178",
                      }}
                    />
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProjectTeamPanel
