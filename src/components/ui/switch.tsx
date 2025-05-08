import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "../../utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(defaultChecked || false);
    
    const handleCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };
    
    const controlledChecked = checked !== undefined ? checked : isChecked;

    return (
      <label
        className={cn(
          "inline-flex items-center cursor-pointer",
          className
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={controlledChecked}
          onChange={handleCheckedChange}
          {...props}
        />
        <div
          aria-hidden="true"
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            controlledChecked ? "bg-primary-600" : "bg-input"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white transform transition-transform",
              controlledChecked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };