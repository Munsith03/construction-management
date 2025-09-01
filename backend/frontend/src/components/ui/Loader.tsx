import React from "react";

function Loader({
  size = "sm",
  color = "primary",
  thickness = 2,
  className = "",
}) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className="flex justify-center items-center"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className={`border-t-transparent rounded-full animate-spin ${sizeStyles[size]} ${className}`}
        style={{
          borderWidth: thickness,
          borderColor: `var(--color-${color}, #1111111)`,
          borderTopColor: "transparent",
          boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
        }}
      />
    </div>
  );
}

export default Loader;
