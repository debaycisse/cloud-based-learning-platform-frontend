import React, { ComponentPropsWithoutRef, ElementRef, forwardRef, createContext, useContext } from "react";
import { cn } from "../../utils/cn";

const RadioGroupContext = createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

const RadioGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
>(({ className, value, onValueChange, defaultValue, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState(defaultValue || "");
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setLocalValue(newValue);
    }
  };

  const contextValue = {
    value: value !== undefined ? value : localValue,
    onValueChange: handleValueChange,
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        role="radiogroup"
        {...props}
      />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & {
    value: string;
  }
>(({ className, value, children, ...props }, ref) => {
  const { value: groupValue, onValueChange } = useRadioGroupContext();
  const checked = value === groupValue;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-2",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-full border border-primary-600 flex items-center justify-center",
          checked && "border-2"
        )}
        onClick={() => onValueChange?.(value)}
      >
        {checked && (
          <div className="h-2 w-2 rounded-full bg-primary-600" />
        )}
      </div>
      {children}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };