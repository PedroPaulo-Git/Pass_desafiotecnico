"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

type SwitchVariant = "default" | "square";

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  variant?: SwitchVariant;
}
function Switch({ className, variant = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer cursor-pointer data-[state=checked]:bg-foreground data-[state=unchecked]:bg-muted-foreground/20 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.20rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "square" && cn("rounded-[6px]"),

        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-[15px] ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          variant === "square"
            ? "rounded-[4px] dark:data-[state=unchecked]:bg-background"
            : "rounded-full"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
