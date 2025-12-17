"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { api } from "../../lib/axios";
import { toast } from "sonner";
import { MessageBubbleInner } from "../ui/message-bubble-inner";
import { ChatInput } from "../ui/chat-input";

export type Message = {
  id: string;
  content: string;
  sender: string;
  role: string;
  seen?: boolean;
  createdAt: string;
};

export default function ChatRoom({ ticketId, onBack, mode = "real", onSwitchToReal, backendAvailable = false, useRealApi = false }: { ticketId: string; onBack?: () => void; mode?: "mock" | "real"; onSwitchToReal?: (mockId: string) => Promise<void>; backendAvailable?: boolean; useRealApi?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connectedRole, setConnectedRole] = useState<string>("agent");
  const [online, setOnline] = useState<Array<{ uuid: string; role: string }>>(
    []
  );
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  

  const uuid =
    typeof window !== "undefined"
      ? localStorage.getItem("chat_uuid") || ""
      : "";
  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("chat_role") || "agent"
      : "agent";

  useEffect(() => {
    let mounted = true;

    if (mode === "mock") {
      // load messages from localStorage for mock mode
      try {
        const raw = localStorage.getItem(`mock_chat:${ticketId}:messages`);
        const msgs = raw ? JSON.parse(raw) : [];
        if (mounted) setMessages(msgs);
      } catch (e) {
        if (mounted) setMessages([]);
      }

      return () => {
        mounted = false;
      };
    }

    (async () => {
      const res = await api.get(`/tickets/${ticketId}/messages`);
      if (!mounted) return;
      setMessages(res.data || []);
    })();

    const socketBase = (api && (api.defaults as any)?.baseURL) || (typeof window !== "undefined" ? window.location.origin : "");
    const socket = io(socketBase, { autoConnect: true });
    socketRef.current = socket;
    socket.emit("join", { ticketId, uuid, role });
    setConnectedRole(role);

    socket.on("message:receive", (msg: Message) => {
      setMessages((prev) => [...prev, { ...msg, seen: false }]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    socket.on("user:joined", (u: { uuid: string; role: string }) => {
      setOnline((prev) => {
        if (prev.find((p) => p.uuid === u.uuid)) return prev;
        return [...prev, { uuid: u.uuid, role: u.role }];
      });
    });

    socket.on("user:left", (u: { uuid?: string }) => {
      if (u?.uuid) {
        setOnline((prev) => prev.filter((p) => p.uuid !== u.uuid));
      } else {
        setOnline([]);
      }
    });

    socket.on("message:seen", (p: { messageId: string; uuid?: string }) => {
      if (!p?.messageId) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === p.messageId);
        if (idx === -1) return prev;
        return prev.map((m, i) => (i <= idx ? { ...m, seen: true } : m));
      });
    });

    return () => {
      try {
        socket.emit("leave", { ticketId, uuid });
      } catch {}
      socket.disconnect();
      mounted = false;
    };
  }, [ticketId, mode]);

  const send = async () => {
    if (!text.trim()) return;

    if (mode === "mock") {
      // append to localStorage-backed mock chat
      try {
        const m = {
          id: `m-${crypto.randomUUID()}`,
          content: text,
          sender: uuid,
          role,
          seen: false,
          createdAt: new Date().toISOString(),
        };
        const raw = localStorage.getItem(`mock_chat:${ticketId}:messages`);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(m);
        localStorage.setItem(`mock_chat:${ticketId}:messages`, JSON.stringify(arr));
        setMessages((prev) => [...prev, m]);
        setText("");
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch (e) {
        console.error(e);
      }
      return;
    }

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
      <div className="flex-1 overflow-y-auto px-3">


        <div className="header sticky top-0 py-2 bg-background z-10">

          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
              {/* Back button visible on mobile only */}
              {onBack && (
                <div className="lg:hidden mr-1">
                  <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                <img
                  data-slot="avatar-image"
                  className="aspect-square w-10 object-cover mb-1"
                  alt="avatar image"
                  src="https://shadcnuikit.com/images/avatars/02.png"
                />
              </div>
              <div className="text-sm font-medium">
                Chamado {ticketId.substring(0, 6)}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Conectado como: {connectedRole}</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-nowrap">Online: {online.length}</span>
              {mode === "mock" && backendAvailable && !useRealApi && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (onSwitchToReal) {
                      await onSwitchToReal(ticketId);
                    }
                  }}
                >
                  Switch to real
                </Button>
              )}
            </div>
          </div>
        </div>
        {messages.map((m) => (
          <MessageBubbleInner
            key={m.id}
            message={m}
            isOwn={m.sender === uuid}
            onSeen={(id) => {
              // emit seen if not own
              if (id && m.sender !== uuid) {
                try {
                  socketRef.current?.emit("message:seen", { ticketId, messageId: id, uuid });
                } catch (e) {
                  /* ignore */
                }
                // mark this and all previous messages as seen
                setMessages((prev) => {
                  const idx = prev.findIndex((mm) => mm.id === id);
                  if (idx === -1) return prev;
                  return prev.map((mm, i) => (i <= idx ? { ...mm, seen: true } : mm));
                });
              }
            }}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="px-3 w-full">
          <ChatInput setText={setText} value={text} onSend={send} className=""/>
        {/* <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded border px-2 py-2"
          placeholder="Digite uma mensagem"
        />
        <button
          onClick={send}
          className="btn bg-blue-600 text-white px-4 rounded"
        >
          Enviar
        </button> */}
      </div>
    
    </div>
  );
}
