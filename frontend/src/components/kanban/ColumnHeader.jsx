import React from "react";

const ColumnHeader = ({ title, count, color, icon }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} transition-all duration-200`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <span className="text-xs text-text-muted">
            {count} {count === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ColumnHeader;
