"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TicketList from "../../../components/chat/TicketList";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { api } from "@/lib/axios";

const ChatRoom = dynamic(() => import("../../../components/chat/ChatRoom"), {
  ssr: false,
});

export default function TicketPage() {
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [onOpen, setOnOpen] = useState<(id: string) => void>(() => () => {});
  const [tickets, setTickets] = useState<any[]>([]);
  const [role, setRole] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("chat_role") || "agent" : "agent"
  );

  const uuid =
    typeof window !== "undefined"
      ? localStorage.getItem("chat_uuid") || ""
      : "";

  useEffect(() => {
    fetchTickets();
  }, [role]);

  useEffect(() => {
    function handler(e: Event) {
      try {
        // @ts-ignore
        const newRole = (e as CustomEvent)?.detail?.role || localStorage.getItem("chat_role") || "agent";
        setRole(newRole);
      } catch (err) {
        setRole(localStorage.getItem("chat_role") || "agent");
      }
    }
    window.addEventListener("chat_role_change", handler as EventListener);
    return () => window.removeEventListener("chat_role_change", handler as EventListener);
  }, []);

  const fetchTickets = async () => {
    setOnOpen(() => (id: string) => setActiveTicket(id));
    const res = await api.get(`/tickets`);
    const all = res.data || [];
    if (role === "agent") {
      setTickets(all);
    } else {
      const mine = all.filter((t: any) => t.clientUuid === uuid);
      setTickets(mine);
      // if client has an open ticket, open it automatically
      if (mine.length === 1) onOpen(mine[0].id);
    }
  };

  const createTicket = async () => {
    try {
      if (!uuid) {
        const newUuid = crypto.randomUUID();
        localStorage.setItem("chat_uuid", newUuid);
      }
      const clientUuid = localStorage.getItem("chat_uuid");
      const res = await api.post(`/tickets`, { clientUuid });
      const ticket = res.data;
      // backend enforces one-open-ticket rule; show toast
      (await import("sonner")).toast.success(
        "Chamado criado ou já existente aberto"
      );
      fetchTickets();
      onOpen(ticket.id);
    } catch (e) {
      (await import("sonner")).toast.error("Erro ao criar chamado");
    }
  };

  return (
    <div className="h-[92vh] p-4">
      {/* Desktop / Tablet layout */}
      <div className="hidden lg:flex h-full">
        <div className="w-80">
          <TicketList
            onOpen={onOpen}
            activeId={activeTicket}
            role={role}
            createTicket={createTicket}
            fetchTickets={fetchTickets}
            tickets={tickets}
          />
        </div>
        <div className="flex-1">
          {activeTicket ? (
            <div className="h-full">
              <ChatRoom ticketId={activeTicket} />
            </div>
          ) : (
            <div className="flex flex-col gap-2 h-full items-center justify-center text-foreground">
              Selecione um chamado ou crie um novo
              <Button
                size="circle_ticket"
                variant="circle_ticket"
                onClick={createTicket}
                className=""
              >
                <PlusIcon className="h-4 w-4 " />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout: show either list or chat (single column) */}
      <div className="lg:hidden h-full">
        {!activeTicket ? (
          <div className="h-full">
            <TicketList
              onOpen={(id) => {
                setActiveTicket(id);
              }}
              activeId={activeTicket}
              role={role}
              createTicket={createTicket}
              fetchTickets={fetchTickets}
              tickets={tickets}
            />
          </div>
        ) : (
          <div className="h-full">
            <ChatRoom ticketId={activeTicket} onBack={() => setActiveTicket(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
