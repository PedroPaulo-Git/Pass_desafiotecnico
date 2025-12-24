"use client";
import React from "react";
import { LuUser, LuUserRoundSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData } from "../types";

interface AssignedUserPopoverProps {
  children: React.ReactNode;
  data: TicketData;
}

export const AssignedUserPopover: React.FC<AssignedUserPopoverProps> = ({
  children,
  data,
}) => {
  if (!data.assignedTo) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-96 rounded-2xl bg-card" align="start">
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between border-b border-border/30">
            <h3 className="font-semibold leading-none text-sm pb-3">
              Responsável
            </h3>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/20">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                <LuUser className="h-6 w-6" />
              </div>
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-foreground">
                  {data.assignedTo?.name}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {data.assignedTo?.role || "Suporte"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize">
                    Email:
                  </span>
                  <span className="font-medium text-foreground">
                    {data.assignedTo?.email || "suporte@empresa.com"}
                  </span>
                </div>
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize">
                    Telefone:
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {data.assignedTo?.phone || "(11) 99999-9999"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
