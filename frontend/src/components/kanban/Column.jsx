import React from 'react';
import { useDrop } from 'react-dnd';

const Column = ({ children, status, onDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item) => onDrop(item, status),
  }));

  return (
    <div ref={drop} className="w-80 flex-shrink-0 glass rounded-xl p-6">
      {children}
    </div>
  );
};

export default Column;