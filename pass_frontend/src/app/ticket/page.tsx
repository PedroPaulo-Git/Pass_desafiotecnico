"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import TicketList from "../../components/chat/TicketList";

const ChatRoom = dynamic(() => import("../../components/chat/ChatRoom"), { ssr: false });

export default function TicketPage() {
  const [activeTicket, setActiveTicket] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-80 border-r">
        <TicketList onOpen={(id) => setActiveTicket(id)} />
      </div>
      <div className="flex-1">
        {activeTicket ? (
          <div className="h-full">
            <ChatRoom ticketId={activeTicket} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">Selecione um chamado ou crie um novo.</div>
        )}
      </div>
    </div>
  );
}
