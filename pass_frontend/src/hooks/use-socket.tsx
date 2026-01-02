"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User as UserIcon, UserPlus } from "lucide-react";
import { AssignUserPopover } from "@/components/support/supportComponents/AssignDeveloperPopover";

const getSocketUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3333";
  // Force HTTPS if it's a production Render URL but missing protocol
  if (
    url.includes("onrender.com") &&
    !url.startsWith("https://") &&
    !url.startsWith("http://")
  ) {
    return `https://${url}`;
  }
  return url;
};

const SOCKET_URL = getSocketUrl();

export function useSocket() {
  const { currentUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      query: {
        userId: currentUser.id,
        role: currentUser.role,
      },
      transports: ["websocket"], // Ensure websocket transport
    });

    console.log("Initializing socket connection to:", SOCKET_URL);

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to notification server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Handle new tickets (Admins/Developers)
    socket.on("ticket:created", (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });

      if (currentUser.role === "ADMIN") {
        toast.custom(
          (t) => (
            <div className="bg-background border border-border p-4 rounded-xl shadow-lg flex flex-col gap-3 w-[350px]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Novo Ticket Criado</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {ticket.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.dismiss(t)}
                >
                  Ignorar
                </Button>

                {/* Note: In a real toast.custom, complex interactions like Popover might need careful handling. 
                  For now, we'll suggest a quick action button that could trigger a dialog. */}
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    toast.dismiss(t);
                    // In a real implementation, we would open the TicketDialog directly with the assignment phase.
                    // For now, let's trigger a secondary toast or a global event.
                    toast.info("Abra o chamado para atribuir o desenvolvedor.");
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Atribuir
                </Button>
              </div>
            </div>
          ),
          { duration: 8000 }
        );
      } else if (currentUser.role === "DEVELOPER") {
        toast.info(`Novo ticket criado: ${ticket.title}`);
      }
    });

    // Handle ticket updates (Client gets notified)
    socket.on("ticket:updated", (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk", ticket.id] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });

      if (currentUser.role === "CLIENT") {
        toast.success(`Seu chamado "${ticket.ticketNumber}" foi atualizado.`);
      }
    });

    // Handle new messages
    socket.on("message:new", (data) => {
      const { helpdeskId, message, ticketNumber, authorName } = data;

      // Invalidate messages for this ticket
      queryClient.invalidateQueries({
        queryKey: ["helpdesk", helpdeskId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });

      // Only notify if user is NOT the author
      if (message.AuthorId !== currentUser.id) {
        toast.custom(
          (t) => (
            <div className="bg-background border border-border p-3 rounded-lg shadow-sm flex items-start gap-3 w-[320px]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-[10px]">
                  {authorName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-bold text-primary uppercase">
                    {ticketNumber}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {authorName}
                  </p>
                </div>
                <p className="text-xs line-clamp-2 italic">
                  "{message.Message}"
                </p>
              </div>
            </div>
          ),
          { position: "bottom-right", duration: 5000 }
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, queryClient]);

  return { isConnected };
}
