import React from "react";
import { useDrop } from "react-dnd";

const Column = ({ children, status, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDrop(item, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`transition-all duration-200 ${
        isOver ? "scale-[1.02]" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default Column;
