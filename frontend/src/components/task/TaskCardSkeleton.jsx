import React from 'react';
import Skeleton from '../Skeleton';

const TaskCardSkeleton = () => {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm dark:bg-gray-700">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mt-2" />
    </div>
  );
};

export default TaskCardSkeleton;
