"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
interface TableCellProps extends React.ComponentProps<"td"> {
  variant?: "default" | "compact" | "extra-compact";
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full "
    >
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
  variant?: "default" | "minimal" | "bordered" | "date";
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
        "",

        variant === "minimal" &&
          cn(
            "hover:bg-muted/40",
            "[&_th]:border-border/30",
            "[&_th]:bg-table",
            "[&_th]:text-xs",
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
          variant === "date" &&
          cn(
            "[&_th]:bg-amber-500",
            "",
          ),


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
  ...props
}: React.ComponentProps<"th"> & {
  variant?: "default" | "compact" | "minimal" | "date";
  center?: boolean;
  sortable?: boolean;
  sortDirection?: "none" | "asc" | "desc";
  filterable?: boolean;
  filterActive?: boolean;
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Estilos base
        "text-foreground h-10 px-4 text-left align-middle font-medium ",
        "text-nowrap",
        "[&:has([role=checkbox])]:pr-0",

        // Variantes
        variant === "default" && "xl:p-5",
        variant === "compact" && "py-2 px-3 xl:p-3",
        variant === "minimal" &&
          cn(
            "px-4 py-3 border-y-2 ",
            "text-xs font-semibold text-muted-foreground tracking-wide ",
            "",
          ),
            variant === "date" &&
          cn(
            "border-t",
            " px-0.5",
             "nth-2:pl-5 nth-1:pl-20 ",
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
          "flex items-center gap-1.5",
          center && "justify-center",
          (sortable || filterable) && "group"
        )}
      >
        <span>{props.children}</span>

        {/* Ícone de filtro/ordenação (como ¢ na imagem) */}
        {(filterable || sortable) && (
          <span
            className={cn(
              "flex items-center text-[10px] text-muted-foreground/60",
              "group-hover:text-muted-foreground transition-colors",
              // filterActive && "text-primary",
              sortDirection !== "none"
            )}
          >
            {sortable ? (
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  sortDirection === "asc" && "rotate-180",
                  sortDirection === "none" && "opacity-50"
                )}
              />
            ) : (
              // Ícone de filtro (similar ao ¢ da imagem)
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                className="opacity-60"
              >
                <path d="M2 3H10" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 6H9" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.5 9H7.5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("", className)}
      {...props}
    />
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

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors p-4",
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
  ...props
}: TableCellProps & { center?: boolean, firstPadding?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Estilos Base (Sempre aplicados)
        "align-middle text-nowrap first:pl-5 sm:first:pl-8 [&:has([role=checkbox])]:pr-0 bg-table ",

        // Variante Default (O estilo original que você tinha)
        variant === "default" && "py-2 px-2 xl:px-0 xl:p-5",

        // Variante Compact (Com o xl:p-2 que você pediu)
        variant === "compact" && "py-1 px-4 xl:px-0 xl:p-2 first:pl-0 sm:first:pl-4",
        variant === "extra-compact" && " px-0 xl:px-0 first:pl-0 sm:first:pl-4   ",
        
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
