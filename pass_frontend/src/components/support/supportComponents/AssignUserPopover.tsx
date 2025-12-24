"use client";
import React, { useState } from "react";
import { LuUser, LuUserRoundSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData, Developer } from "../types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
interface AssignUserPopoverProps {
  children: React.ReactNode;
  data: TicketData;
  onAssign: (developer: Developer) => void;
}

// Mock list of available developers
const mockDevelopers: Developer[] = [
  {
    id: "1",
    name: "João Silva",
    avatarFallback: "JS",
    role: "Desenvolvedor Sênior",
    email: "joao@empresa.com",
    phone: "(11) 99999-1111",
  },
  {
    id: "2",
    name: "Maria Santos",
    avatarFallback: "MS",
    role: "Analista de Suporte",
    email: "maria@empresa.com",
    phone: "(11) 99999-2222",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    avatarFallback: "PO",
    role: "Tech Lead",
    email: "pedro@empresa.com",
    phone: "(11) 99999-3333",
  },
];

export const AssignUserPopover: React.FC<AssignUserPopoverProps> = ({
  children,
  data,
  onAssign,
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(0); // Start with first item hovered

  const handleAssign = (developer: Developer) => {
    onAssign(developer);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-96 rounded-2xl bg-card" align="start">
        <div className="grid p-4">
          <div className="flex items-center justify-between border-b border-border/30">
            <h3 className="font-semibold leading-none text-sm pb-3">
              Atribuir Responsável
            </h3>
          </div>

          <div className="flex gap-4 rounded-xl pt-3">
            <div className="flex gap-4 p-4 py-2 px-2 rounded-xl bg-muted/20 border border-border/20">
              <div className="flex flex-col space-y-2 w-full">
                <div className="space-y-1.5">
                  {mockDevelopers.map((developer, index) => (
                    <div>

               
                    <div
                      key={developer.id}
                      className={`flex flex-col rounded-xl px-4 items-left gap-2 group w-full py-2.5 text-left cursor-pointer transition-colors ${
                        index === hoveredIndex ? "bg-muted/80" : ""
                      }`}
                      onClick={() => handleAssign(developer)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(0)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-purple-900 text-purple-200 text-xs">
                            {developer.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {developer.name}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {developer.role}
                          </p>
                        </div>
                      </div>
                    </div>    
                    <Separator orientation="horizontal" className="my-1 w-full" />
                     </div>
                  ))}
                  
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};