import React from 'react';

const Skeleton = ({ className }) => {
  return <div className={`bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse ${className}`}></div>;
};

export default Skeleton;
