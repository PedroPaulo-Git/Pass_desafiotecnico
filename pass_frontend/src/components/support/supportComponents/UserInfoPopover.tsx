"use client";
import React from "react";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData } from "../types";
import { Badge } from "@/components/ui/badge";

interface UserInfoPopoverProps {
  data: TicketData;
}
export const UserInfoPopover: React.FC<UserInfoPopoverProps> = ({ data }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="subtle"
          color="teal"
          className="cursor-pointer hover:bg-teal-200 dark:hover:bg-teal-900/40 transition-colors"
        >
          <User className="w-3 h-3" />
          {/* Mostra '1' para indicar o usuário associado, seguindo o padrão do seu snippet */}
          1
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="w-[380px]! rounded-2xl bg-card" align="end">
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between border-b border-border/30">
            <h3 className="font-semibold leading-none text-sm pb-3">
              Usuário(a)
            </h3>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/20">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                <User className="h-6 w-6" />
              </div>
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-foreground">
                  {data.user?.name || data.clientName}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {data.user?.category || "Adulto"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize">
                    CPF:
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {data.user?.cpf || "000.000.000-00"}
                  </span>
                </div>
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize">
                    Nascimento:
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {data.user?.birthDate || "00/00/0000"}
                  </span>
                </div>
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize">
                    Nacionalidade:
                  </span>
                  <span className="font-medium text-foreground">
                    {data.user?.nationality || "Brasileira"}
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
