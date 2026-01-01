"use client";
import React, { useEffect, useState } from "react";
import { LuUser } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData, Developer } from "../types";
import { api } from "@/lib/axios";
interface AssignUserPopoverProps {
  children: React.ReactNode;
  data: TicketData;
  onAssign: (developer: Developer) => void;
}

// Developers loaded from API
// We'll fetch users and filter by role === 'DEVELOPER'

export const AssignUserPopover: React.FC<AssignUserPopoverProps> = ({
  children,
  data,
  onAssign,
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(0); // Start with first item hovered

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await api.get("/users");
        const users = (Array.isArray(resp.data) ? resp.data : resp.data.items || []) as any[];
        if (users && users.length > 0) {
          console.log("Fetched users:", users);
          const devs = users
            .filter((u) => u.role === "DEVELOPER")
            .map((u) => ({
              id: u.id,
              name: u.name,
              avatarFallback: (u.name || "")
                .split(" ")
                .map((s: string) => s[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              role: u.role || "DEVELOPER",
              email: u.email || "",
              phone: u.phone || "",
            }));
          if (mounted) setDevelopers(devs);
        } else {
          console.log("No users found", users, resp);
        }
      } catch (err) {
        console.error("Failed to load developers", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAssign = (developer: Developer) => {
    onAssign(developer);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-96 rounded-2xl bg-card" align="start">
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between border-b border-border/30">
            <h3 className="font-semibold leading-none text-sm pb-3">
              Atribuir Responsável
            </h3>
          </div>

          <div className="flex flex-col space-y-2 w-full">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : developers.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                Nenhum desenvolvedor encontrado
              </div>
            ) : (
              developers.map((developer, index) => (
                <div
                  key={developer.id}
                  className={`flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/20 cursor-pointer transition-colors ${
                    index === hoveredIndex ? "bg-muted/80" : ""
                  }`}
                  onClick={() => handleAssign(developer)}
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                      <LuUser className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 w-full">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-foreground">
                        {developer.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {developer.role || "Desenvolvedor"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-left gap-2 text-xs">
                        <span className="text-muted-foreground/70 capitalize">
                          Email:
                        </span>
                        <span className="font-medium text-foreground">
                          {developer.email || "desenvolvedor@empresa.com"}
                        </span>
                      </div>
                      <div className="flex items-left gap-2 text-xs">
                        <span className="text-muted-foreground/70 capitalize">
                          Telefone:
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {developer.phone || "(11) 99999-9999"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
