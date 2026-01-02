import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        point: " px-[3px] py-[3px]  border-0 my-auto ",
        circle: "rounded-full bg-primary-foreground border-border p-1.5  m-0 ",
        ticket: "bg-muted/50 rounded-full  ",
        subtle: "border-transparent py-1 ",
      },
      color: {
        default: "",
        amber:
          "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        blue: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        green:
          "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        rose: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        purple:
          "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        emerald:
          "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        red: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        gray: "bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        teal: "bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-200 dark:hover:bg-teal-900/40",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
    },
  }
);

function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
