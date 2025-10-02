import React from 'react';

const ColumnHeader = ({ title, count, color, icon }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <span className="text-sm text-text-muted">{count} tasks</span>
      </div>
    </div>
  </div>
);

export default ColumnHeader;
