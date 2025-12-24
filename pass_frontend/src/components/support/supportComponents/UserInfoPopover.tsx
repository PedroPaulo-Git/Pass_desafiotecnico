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

interface UserInfoPopoverProps {
  data: TicketData;
}
export const UserInfoPopover: React.FC<UserInfoPopoverProps> = ({ data }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs  
          inline-flex items-center justify-center rounded-md
          border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 
          [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 
          focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
          aria-invalid:border-destructive overflow-hidden [a&]:hover:bg-primary/90 py-1
          bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800 
          cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900/40 transition-colors"
        >
          <LuUserRoundSearch className="w-2 h-2" />
        </Button>
      </PopoverTrigger>

      {/* Aumentei um pouco a largura para acomodar o layout do card */}
      <PopoverContent className="w-96  rounded-2xl bg-card" align="start">
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between border-b border-border/30 ">
            <h3 className="font-semibold leading-none text-sm pb-3 ">
              Usuário(a)
            </h3>
          </div>

          {/* Card interno estilizado como na imagem */}
          <div className="flex gap-4 p-4 rounded-xl  bg-muted/20 border border-border/20">
            {/* Coluna do Avatar */}
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                <LuUser className="h-6 w-6" />
              </div>
            </div>

            {/* Coluna de Informações */}
            <div className="flex flex-col space-y-3 w-full">
              {/* Cabeçalho do Card */}
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-foreground">
                  {data.user?.name || data.clientName}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {data.user?.category || "Adulto"}
                </p>
              </div>

              {/* Lista de Detalhes */}
              <div className="space-y-1.5">
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize ">
                    CPF:
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {data.user?.cpf || "000.000.000-00"}
                  </span>
                </div>
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize ">
                    Nascimento:
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {data.user?.birthDate || "00/00/0000"}
                  </span>
                </div>
                <div className="flex items-left gap-2 text-xs">
                  <span className="text-muted-foreground/70 capitalize ">
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
