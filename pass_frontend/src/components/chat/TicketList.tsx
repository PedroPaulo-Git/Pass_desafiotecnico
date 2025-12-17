"use client";
import React, { useEffect, useState } from "react";
import {api} from "../../lib/axios";

export default function TicketList({ onOpen }: { onOpen: (id: string) => void }) {
  const [tickets, setTickets] = useState<any[]>([]);

  const uuid = typeof window !== "undefined" ? localStorage.getItem("chat_uuid") || "" : "";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await api.get(`/tickets`);
    setTickets(res.data || []);
  };

  const createTicket = async () => {
    if (!uuid) {
      const newUuid = crypto.randomUUID();
      localStorage.setItem("chat_uuid", newUuid);
    }
    const clientUuid = localStorage.getItem("chat_uuid");
    const res = await api.post(`/tickets`, { clientUuid });
    const ticket = res.data;
    fetchTickets();
    onOpen(ticket.id);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <strong>Tickets</strong>
        <button onClick={createTicket} className="text-sm text-blue-600">Novo</button>
      </div>
      <div className="overflow-y-auto p-2 flex-1">
        {tickets.map((t) => (
          <div key={t.id} onClick={() => onOpen(t.id)} className="p-2 cursor-pointer hover:bg-gray-100 rounded">
            <div className="text-sm font-medium">{t.title || `Chamado ${t.id.substring(0,6)}`}</div>
            <div className="text-xs text-muted-foreground">{t.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
