import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 ",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          outline_text:
          "border bg-background shadow-xs hover:bg-accent disabled:opacity-100 ",
      
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-full cursor-pointer",
          ghost_without_background_hover:
          " hover:text-accent-foreground rounded-full cursor-pointer",
        link: "text-primary underline-offset-4 hover:underline",
        modal: "border bg-foreground text-background hover:bg-foreground/90 ",
        modal_white: "border bg-muted text-muted-foreground hover:bg-muted-foreground/90 ",
        table: "border-b-2 dark:bg-[#ffffff26]/30 border-border border px-0 py-2 ",
        table_border_cutted: "border rounded-md border-dashed  dark:bg-input/30 dark:border-input dark:border-dashed px-0 py-2 ",
        table_add: "bg-table-button text-black hover:bg-table-button/90 rounded-lg ",
        collapsible_button:"w-full flex items-center justify-between py-5! px-3 text-sm font-medium ",
      },
      size: {
        modal: "h-11 px-8 rounded-full",
        default: "h-9 px-4 py-2 has-[>svg]:px-3 ",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
