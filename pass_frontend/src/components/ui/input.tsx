import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  variant = "light",
  center = false,
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "default" | "light" | "modal" | "custom";
  center?: boolean;
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:text-muted-foreground  border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:none focus-visible:ring-0 outline-none focus-visible:border-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

        variant === "light" && [
          "border-b-2 dark:bg-[#ffffff26]/30 border-border border px-0 py-2 ",
        ],
        variant === "modal" && [
          " text-foreground rounded-md focus-visible:none focus-visible:border-border border ",
        ],
        variant == "custom" && [
          "p-0 py-0 px-0 focus-visible:none focus-visible:ring-0 outline-none focus-visible:border-background ",
        ],

        className
      )}
      {...props}
    />
  );
}

export { Input };
