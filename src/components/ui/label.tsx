import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  optional?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, optional, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-sm text-muted-foreground">(Optional)</span>
      )}
    </label>
  )
);
Label.displayName = "Label";

export { Label };