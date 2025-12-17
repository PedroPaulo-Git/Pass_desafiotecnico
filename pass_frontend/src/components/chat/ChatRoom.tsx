"use client";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {api} from "../../lib/axios";

type Message = {
  id: string;
  content: string;
  sender: string;
  role: string;
  createdAt: string;
};

export default function ChatRoom({ ticketId }: { ticketId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const uuid = typeof window !== "undefined" ? localStorage.getItem("chat_uuid") || "" : "";
  const role = typeof window !== "undefined" ? (localStorage.getItem("chat_role") || "agent") : "agent";

  useEffect(() => {
    (async () => {
      const res = await api.get(`/tickets/${ticketId}/messages`);
      setMessages(res.data || []);
    })();

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333", { autoConnect: true });
    socketRef.current = socket;
    socket.emit("join", { ticketId, uuid, role });

    socket.on("message:receive", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => {
      socket.emit("leave", { ticketId });
      socket.disconnect();
    };
  }, [ticketId]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      await api.post(`/tickets/${ticketId}/messages`, {
        ticketId,
        senderUuid: uuid,
        role,
        content: text,
      });
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.role === "agent" ? "text-left" : "text-right"}`}>
            <div className="inline-block max-w-[70%] rounded-lg p-2 bg-gray-100">{m.content}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded border px-2 py-2" placeholder="Digite uma mensagem" />
        <button onClick={send} className="btn bg-blue-600 text-white px-4 rounded">Enviar</button>
      </div>
    </div>
  );
}
