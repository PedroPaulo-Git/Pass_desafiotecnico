// Textarea.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  variant?: "default" | "underlined";
  showResizeHandle?: boolean;
}

function Textarea({
  className,
  variant = "default",
  showResizeHandle = false,
  ...props
}: TextareaProps) {
  const textarea = (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex resize-y min-h-16 w-full bg-transparent text-base placeholder:text-muted-foreground disabled:opacity-50 md:text-sm outline-none focus:outline-none",

        variant === "default" && [
          "border border-input rounded-md shadow-xs px-3 py-2",

          "focus-visible:ring-0 focus-visible:border-input",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        ],

        variant === "underlined" && [
          "border-0 border-b border-muted-foreground rounded-none px-0 py-2 shadow-none",
          "focus-visible:ring-0 focus-visible:border-input", // Mantém a borda cinza ou muda para primary se quiser
        ],

        showResizeHandle && "pr-6",
        className
      )}
      {...props}
    />
  );

  return textarea;
}

export { Textarea };
