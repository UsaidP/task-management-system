import React from "react";

const Skeleton = ({ className = "", variant = "rectangular" }) => {
  const baseClasses = "animate-pulse bg-surface-light";

  const variantClasses = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded-sm h-4",
  };

  // Skeleton.jsx

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(31, 41, 55, 0.8) 25%, rgba(55, 65, 81, 0.8) 50%, rgba(31, 41, 55, 0.8) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite", // This line refers to the keyframes
      }}
    ></div>
  );
};

export default Skeleton;
