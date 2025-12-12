"use client";

import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ArrowLeftToLine,
  ArrowRightToLine,
  MoreHorizontal,
  PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PinnableHeaderContentProps } from "../types";

export function PinnableHeaderContent({
  columnId,
  label,
  pin,
  sort,
  onToggleSort,
  onTogglePin,
}: PinnableHeaderContentProps) {
  const SortIcon =
    sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ChevronsUpDown;

  const isPinned = pin !== null;

  return (
    <div className="flex items-center justify-between w-full">
      <button
        type="button"
        onClick={() => onToggleSort(columnId)}
        className={cn(
          "flex items-center gap-1 hover:text-foreground transition-colors",
          columnId === "period"
            ? isPinned
              ? "ml-0"
              : "ml-2"
            : "ml-4"
        )}
      >
        <span className="truncate">{label}</span>
        <SortIcon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            sort ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </button>
      <div className="ml-auto relative z-50">
        {isPinned ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-muted"
            onClick={() => onTogglePin(columnId, pin)}
          >
            <PinOff className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 hover:bg-muted"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTogglePin(columnId, "left")}>
                <ArrowLeftToLine className="h-4 w-4 mr-2" />
                Fixar à esquerda
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePin(columnId, "right")}>
                <ArrowRightToLine className="h-4 w-4 mr-2" />
                Fixar à direita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
