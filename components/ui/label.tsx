import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label"> & { optional?: string }
>(({ className, children, optional, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {optional ? (
        <span className="text-xs font-normal text-muted-foreground">
          ({optional})
        </span>
      ) : null}
    </label>
  );
});
Label.displayName = "Label";

export { Label };
