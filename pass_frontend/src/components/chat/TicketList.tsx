"use client";
import React, { useEffect, useState, useRef } from "react";
import { api } from "../../lib/axios";
import { Button } from "../ui/button";
import {
  PlusIcon,
  Search,
  RotateCw,
  ArrowRightLeft,
  MoreVertical,
} from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

const capitalize = (s?: string) => {
  if (!s) return "";
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function TicketList({
  onOpen,
  activeId,
  role,
  createTicket,
  fetchTickets,
  tickets,
}: {
  onOpen: (id: string) => void;
  activeId?: string | null;
  role: string;
  createTicket: () => void;
  fetchTickets: () => void;
  tickets: any[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      const target = e.target as Node | null;
      if (target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);
  return (
    <div className="h-full flex flex-col border rounded-2xl bg-muted/50 ">
      <div className="p-5 flex flex-col items-center ">
        <div className="flex w-full justify-between  items-center pb-6 ">
          <div className="flex items-center text-center gap-3">
            <strong className="text-lg text-foreground">Tickets</strong>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 mt-1 rounded bg-muted text-muted-foreground">
                {role === "agent" ? "Agente" : "Cliente"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-1 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  const newRole = role === "agent" ? "client" : "agent";
                  try {
                    localStorage.setItem("chat_role", newRole);
                  } catch (err) {
                    /* ignore */
                  }
                  try {
                    window.dispatchEvent(
                      new CustomEvent("chat_role_change", {
                        detail: { role: newRole },
                      })
                    );
                  } catch (err) {
                    /* ignore */
                  }
                }}
                title={
                  role === "agent"
                    ? "Entrar como Cliente"
                    : "Entrar como Agente"
                }
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            {/* three-dots menu with Atualizar / Criar chamado */}

            <div className="flex text-center items-center">
              <button
                className="text-left px-3 pb-1 text-sm text-foreground hover:bg-accent"
                onClick={() => {
                  setMenuOpen(false);
                  fetchTickets();
                }}
              >
                <RotateCw className="h-4 w-4 mr-2 inline-block" />
              </button>
              <Button
                size="circle_ticket"
                variant="circle_ticket"
                onClick={createTicket}
                className=""
              >
                <PlusIcon className="h-4 w-4 " />
              </Button>
            </div>

            {/* <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-expanded={menuOpen}
                aria-label="Ações"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>

             
            </div> */}
          </div>
        </div>

        <div className="flex w-full relative">
          <Search className="absolute bottom-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            variant="modal"
            className="pl-8"
            placeholder="Buscar chamado"
          />
        </div>
      </div>
      <div className="overflow-y-auto p-2 flex-1">
        {tickets.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            Nenhum chamado encontrado.
          </div>
        )}
        {tickets.map((ticket, index) => {
          const isActive = !!activeId && ticket.id === activeId;
          return (
            <div
              key={ticket.id}
              onClick={() => onOpen(ticket.id)}
              className={`${
                isActive ? "bg-muted" : ""
              } p-2.5 cursor-pointer hover:bg-muted/50 rounded-lg flex justify-between items-center`}
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <img
                    data-slot="avatar-image"
                    className="aspect-square w-10 object-cover mb-1"
                    alt="avatar image"
                    src="https://shadcnuikit.com/images/avatars/02.png"
                  />

                  <span className="flex flex-col text-nowrap mb-auto gap-2">
                    <span className="text-fo">
                      {ticket.title ||
                        `Chamado N.º${ticket.id.substring(0, 6)}`}
                    </span>

                    {ticket.status === "OPEN" && (
                      <Badge
                        variant="ticket"
                        className="bg-muted-foreground/10 text-green-500 border border-green-600 "
                      >
                        {/* {capitalize(ticket.status)} */}
                        <span className="px-3">Aberto</span>
                      </Badge>
                    )}
                    {ticket.status === "CLOSED" && (
                      <Badge
                        variant="ticket"
                        className="bg-muted-foreground/10 text-red-500 border border-red-600"
                      >
                        {capitalize(ticket.status)}
                        Fechado
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-auto">
                {new Date(ticket.createdAt).toLocaleString().slice(12, 24)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
