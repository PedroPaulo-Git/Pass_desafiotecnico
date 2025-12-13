"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
interface TableCellProps extends React.ComponentProps<"td"> {
  variant?:
    | "default"
    | "compact"
    | "extra-compact"
    | "compact-fueling"
    | "sticky-first"
    | "sticky-second";
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full ">
      <table
        data-slot="table"
        className={cn(
          "w-full min-w-full caption-bottom text-xs md:text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}

interface TableHeaderProps extends React.ComponentProps<"thead"> {
  variant?:
    | "default"
    | "minimal"
    | "minimal-fueling"
    | "bordered"
    | "date"
    | "extra-compact"
    | "compact-fueling"
    | "main";
  withFilterIcons?: boolean;
}
function TableHeader({
  className,
  variant = "default",
  withFilterIcons = false,
  ...props
}: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Estilos base
        variant === "main" &&
          cn(
             "[&_th]:rounded-none",
            "[&_th]:border-t border-border",
            "[&_th]:bg-table",
            "[&_th]:text-sm",
            "[&_th]:font-semibold",
            "[&_th]:text-muted-foreground",
            "[&_th]:tracking-wide"
          ),

        variant === "minimal" &&
          cn(
            "[&_th]:border-border/30",
            "[&_th]:bg-table",
            "[&_th]:text-sm",
            "[&_th]:font-semibold",
            "[&_th]:text-muted-foreground",
            "[&_th]:tracking-wide"
          ),
            variant === "minimal-fueling" &&
          cn(
            "[&_th]:border-border/30",
            "[&_th]:bg-table",
            "[&_th]:text-sm",
            "[&_th]:font-semibold",
            "[&_th]:text-muted-foreground",
            "[&_th]:tracking-wide"
          ),

        // Variante com bordas completas
        variant === "bordered" &&
          cn(
            "[&_th]:hover:bg-muted/40",
            "[&_th]:border",
            "[&_th]:border-border/30",
            "[&_th]:bg-muted/30",
            "[&_th]:first:rounded-tl-md",
            "[&_th]:last:rounded-tr-md"
          ),
        variant === "date" && cn("", ""),
        variant === "compact-fueling" && cn("", ""),

        className
      )}
      {...props}
    />
  );
}

// Nova variante para TableHead com ícones de filtro
function TableHead({
  className,
  variant = "default",
  center = false,
  sortable = false,
  sortDirection = "none", // 'none', 'asc', 'desc'
  filterable = false,
  filterActive = false,
  sticky = false,
  flexCell = false,
  ...props
}: React.ComponentProps<"th"> & {
  variant?:
    | "default"
    | "main"
    | "compact"
    | "minimal"
    | "minimal-fueling"
    | "bordered"
    | "date"
    | "sticky-first"
    | "sticky-second";
  center?: boolean;
  sortable?: boolean;
  sortDirection?: "none" | "asc" | "desc";
  filterable?: boolean;
  filterActive?: boolean;
  sticky?: boolean;
  flexCell?: boolean;
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Estilos base
        "text-foreground text-left align-middle font-medium",
        "text-nowrap",
        // Flex cell styling - maintain table-like appearance in flex container
        flexCell && "flex items-center box-border h-10",
        !flexCell && "h-10",

        // Variantes
        variant === "default" &&
          cn(
            "py-3 border-y-2 px-4 z-10 xl:p-5",
            "text-xs font-semibold text-muted-foreground tracking-wide ",
            ""
          ),
           variant === "main" &&
          cn(
            "",
            "py-0 px-1   z-10",
            "text-sm font-semibold tracking-wide ",
            ""
          ),
        variant === "compact" && "py-2 px-3 xl:p-3 border border-border",
        variant === "minimal" &&
          cn(
            "py-3 border-t px-4 z-10",
            "text-xs font-semibold text-muted-foreground tracking-wide ",
            ""
          ),
           variant === "minimal-fueling" &&
          cn(
            "py-0 px-0 border-t z-10",
            "text-sm font-semibold text-muted-foreground tracking-wide ",
            ""
          ),


        variant === "date" &&
          cn("border-t", " px-0.5", " "),
        variant === "sticky-first" &&
          cn(
            "py-2 px-3 border-y ",
            "text-xs font-semibold text-muted-foreground tracking-wide",
            "sticky left-0 bg-background/95 backdrop-blur-sm z-40 "
          ),
        variant === "sticky-second" &&
          cn(
            "py-0 px-0 ml-0",
            "text-sm border-y font-semibold text-muted-foreground tracking-wide",
            "sticky bg-background/95 backdrop-blur-sm z-40 "
          ),

        // Centralização
        center && "text-center",

        // Estados interativos
        (sortable || filterable) && "cursor-pointer",
        // filterActive && "bg-primary/10 border-r-primary/30",

        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 w-full",
          center && "justify-center",
          (sortable || filterable) && "group"
        )}
      >
        <span className="w-full">{props.children}</span>

    
      </div>
    </th>
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody data-slot="table-body" className={cn("", className)} {...props} />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

interface TableRowProps extends React.ComponentProps<"tr"> {
  flexLayout?: boolean;
}

function TableRow({ className, flexLayout = false, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "data-[state=selected]:bg-muted transition-colors",
        // When using flex layout for column reordering
        flexLayout && "flex w-full",
        className
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  variant = "default",
  center = false,
  firstPadding = false,
  flexCell = false,
  ...props
}: TableCellProps & { center?: boolean; firstPadding?: boolean; flexCell?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Estilos Base (Sempre aplicados)
        "align-middle text-nowrap bg-table",
        // Flex cell styling - maintain table-like appearance in flex container
        flexCell && "flex items-center box-border h-12",
        !flexCell && "first:pl-5 sm:first:pl-8",

        // Variante Default (O estilo original que você tinha)
        variant === "default" && "py-2 px-2 xl:px-0 xl:p-5",

        // Variante Compact (Com o xl:p-2 que você pediu)
        variant === "compact" &&
          "py-1 pl-1 pr-2 xl:px-0 xl:p-1 min-w-[150px] xl:min-w-auto first:w-[50px] first:min-w-[50px] first:pr-4 ",

        variant === "compact-fueling" &&
          "py-1.5 px-2 border-y",

        variant === "extra-compact" &&
          " px-0 xl:px-0 first:pl-0 sm:first:pl-4   ",

        variant === "sticky-first" &&
          cn(
            "py-2 px-3 border-y border-border",
            "sticky left-0 bg-background/95 backdrop-blur-sm z-40"
          ),
        variant === "sticky-second" &&
          cn(
            "py-2 px-0 border-y border-border",
            "sticky bg-background/95 backdrop-blur-sm z-40"
          ),

        center && "text-center",
        firstPadding && "first:pl-4 sm:first:pl-4",

        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
