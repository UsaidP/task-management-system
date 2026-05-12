import { useDrop } from "react-dnd"

const Column = ({ children, status, onDrop, taskCount }) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      // BUG FIX: 'accept' must match the 'type' from useDrag (which is "task")
      accept: "task",

      // Pass the destinationIndex (taskCount) for drops on the column
      // This allows dropping into an empty column or at the end of the list
      drop: (item, monitor) => {
        if (monitor.didDrop()) return // Already handled by a nested TaskCard
        onDrop(item, status, taskCount)
      },

      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [status, onDrop, taskCount]
  )

  return (
    <div
      ref={drop}
      role="region"
      aria-label={`${status.replace("-", " ")} tasks`}
      className={`w-full md:w-[280px] xl:w-[320px] flex-shrink-0 rounded-xl transition-colors duration-300 ${isOver ? "bg-accent-info/10" : ""}`}
    >
      {children}
    </div>
  )
}

export default Column
