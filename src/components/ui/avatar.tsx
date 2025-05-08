import React, { forwardRef, ImgHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void;
}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange, alt, ...props }, ref) => {
    const [status, setStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle");

    React.useEffect(() => {
      if (onLoadingStatusChange) {
        onLoadingStatusChange(status);
      }
    }, [status, onLoadingStatusChange]);

    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        alt={alt}
        onLoadStart={() => setStatus("loading")}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {}

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };