import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showValue?: boolean;
  variant?: "default" | "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    showValue = false,
    variant = "default",
    size = "md",
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
    
    const variantClasses = {
      default: "bg-primary-600",
      primary: "bg-primary-600",
      secondary: "bg-secondary-600",
      tertiary: "bg-tertiary-600",
    };

    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all", variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };