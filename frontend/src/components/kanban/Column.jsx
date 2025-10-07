import React from "react";
import { useDrop } from "react-dnd";

const Column = ({ children, status, onDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => onDrop(item, status),
  }));

  return (
    <div ref={drop} className=" w-fit flex-shrink-0 rounded-xl ">
      {children}
    </div>
  );
};

export default Column;
