"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTicketMessages } from "@/features/helpdesk/hooks/use-ticket-messages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, User, ShieldCheck, Clock, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketMessagesProps {
  ticketId: string;
}

export const TicketMessages: React.FC<TicketMessagesProps> = ({ ticketId }) => {
  const { currentUser } = useAuth();
  const { messages, isLoading, isSending, sendMessage } = useTicketMessages(ticketId);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isSending) return;

    try {
      await sendMessage({
        authorId: currentUser.id,
        authorType: currentUser.role === "CLIENT" ? "user" : "support",
        message: newMessage.trim(),
      });
      setNewMessage("");
    } catch (e) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 h-[400px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50 rounded-lg border border-border overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden"
        style={{ minHeight: "350px", maxHeight: "500px" }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-60">
            <Clock className="w-8 h-8" />
            <p className="text-sm">Nenhuma mensagem ainda.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.AuthorId === currentUser?.id;
            const isSupport = msg.AuthorType === "support";
            const date = new Date(msg.CreatedAt);

            return (
              <div 
                key={idx} 
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0 border border-border">
                  <AvatarFallback className={isSupport ? "bg-purple-900/20 text-purple-400" : "bg-blue-900/20 text-blue-400"}>
                    {isSupport ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {isSupport ? "Suporte" : "Cliente"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(date, "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className={`
                    p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none border border-border/50"}
                  `}>
                    {msg.Message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-muted/20 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isSending}
            className="w-full bg-background border border-border rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || isSending}
          className="rounded-full h-9 w-9 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
