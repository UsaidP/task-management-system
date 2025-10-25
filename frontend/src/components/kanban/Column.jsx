import { useDrop } from "react-dnd";

const Column = ({ children, status, onDrop, taskCount }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    // BUG FIX: 'accept' must match the 'type' from useDrag (which is "task")
    accept: "task",

    // Pass the destinationIndex (taskCount) for drops on the column
    // This allows dropping into an empty column or at the end of the list
    drop: (item) => onDrop(item, status, taskCount),

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`w-full md:w-[280px] xl:w-[320px] flex-shrink-0 rounded-xl transition-colors duration-300 ${
        isOver ? "bg-accent-blue/10" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default Column;
