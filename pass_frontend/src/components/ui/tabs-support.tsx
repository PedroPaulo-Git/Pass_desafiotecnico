"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useRef } from "react";
import { useDragToScroll } from "@/hooks/use-drag-to-scroll";

import { cn } from "@/lib/utils";

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  modalTabsStyle?: boolean; // Adicionado aqui
};

function Tabs({ className, modalTabsStyle = false, ...props }: TabsRootProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        "flex flex-col gap-2 ",
        className,
        modalTabsStyle && "gap-0"
      )}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  supportTab?: boolean;
};

function TabsList({
  className,
  supportTab = false,

  ...props
}: TabsListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  useDragToScroll(listRef as any);
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      ref={listRef}
      className={cn(
        "bg-muted border-b-muted-foreground/20 text-muted-foreground h-11 w-fit items-center justify-center rounded-lg ",
        className,
        // Keep flex mode but add a prettier scrollbar. `tabs-scrollbar` can be defined in globals.css
        // if the project doesn't include the Tailwind scrollbar plugin.
        supportTab &&
          " justify-start flex px-3 overflow-x-auto tabs-scrollbar scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  supportTab?: boolean;
};

function TabsTrigger({
  className,
  supportTab = false,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        " font-semibold cursor-pointer focus-visible:ring-ring/50 focus-visible:outline-ring data-[state=active]:border-blue-600  inline-flex h-full flex-1 items-center justify-center gap-1.5  border border-transparent  py-1 text-sm  whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
        supportTab &&
          " data-[state=active]:text-blue-600 data-[stTabsTriggerate=active]:font-semibold    data-[state=active]:border-b-2 border-t-0 border-l-0 border-r-0 hover:bg-blue-600/5 data-[state=active]:hover:bg-blue-600/5 hover:text-inherit px-4  py-1.5 data-[state=active]:p-2 data-[state=active]:px-4    data-[state=active]:bg-transparent ",
     
        )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
