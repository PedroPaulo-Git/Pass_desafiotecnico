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

  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [useRealApi, setUseRealApi] = useState<boolean>(() => {
    try {
      return (typeof window !== "undefined" && localStorage.getItem("use_real_api") === "true") || false;
    } catch {
      return false;
    }
  });
  const [mockTickets, setMockTickets] = useState<any[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem("mock_tickets");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchTickets();
  }, [role]);

  // poll backend availability
  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        const res = await api.get(`/tickets`, { timeout: 2500 });
        if (!mounted) return;
        setBackendAvailable(Boolean(res && res.status >= 200 && res.status < 300));
      } catch (e) {
        if (!mounted) return;
        setBackendAvailable(false);
      }
    }

    checkBackend();
    const iv = setInterval(checkBackend, 10000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  // when backend becomes available and user previously chose real API, enable
  useEffect(() => {
    if (backendAvailable) {
      // if backend is available, switch to real API usage
      setUseRealApi(true);
      try {
        localStorage.setItem("use_real_api", "true");
      } catch {}
    }
  }, [backendAvailable]);

  // whenever we switch to real API ensure we fetch real tickets
  useEffect(() => {
    if (useRealApi) fetchTickets();
  }, [useRealApi]);

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
    if (!useRealApi) {
      // load mock tickets
      try {
        const raw = localStorage.getItem("mock_tickets");
        const mt = raw ? JSON.parse(raw) : [];
        setTickets(mt);
        if (role !== "agent") {
          const mine = mt.filter((t: any) => t.clientUuid === uuid);
          if (mine.length === 1) onOpen(mine[0].id);
        }
      } catch (e) {
        setTickets([]);
      }
      return;
    }

    const res = await api.get(`/tickets`);
    const all = res.data || [];
    if (role === "agent") {
      setTickets(all);
    } else {
      const mine = all.filter((t: any) => t.clientUuid === uuid);
      setTickets(mine);
      if (mine.length === 1) onOpen(mine[0].id);
    }
  };

  const createTicket = async () => {
    // Agents are not allowed to create tickets client-side
    if (role === "agent") {
      (await import("sonner")).toast.error("Você está em modo Agente — mude para Cliente para criar um chamado");
      return;
    }

    if (!useRealApi) {
      // ensure client uuid exists for mock tickets
      try {
        if (!uuid) {
          const newUuid = crypto.randomUUID();
          localStorage.setItem("chat_uuid", newUuid);
        }
      } catch {}

      // check existing mock tickets for this client
      try {
        const raw = localStorage.getItem("mock_tickets");
        const mt = raw ? JSON.parse(raw) : [];
        const clientUuid = typeof window !== "undefined" ? localStorage.getItem("chat_uuid") : "";
        const existing = mt.find((t: any) => t.clientUuid === clientUuid && t.status === "OPEN");
        if (existing) {
          (await import("sonner")).toast.error("Você já possui um chamado em aberto");
          setActiveTicket(existing.id);
          setTickets(mt);
          return;
        }
      } catch (e) {
        // fallthrough to create
      }

      // create mock ticket locally
      createTestChat();
      (await import("sonner")).toast.success("Chamado mock criado");
      return;
    }

    try {
      if (!uuid) {
        const newUuid = crypto.randomUUID();
        localStorage.setItem("chat_uuid", newUuid);
      }
      const clientUuid = localStorage.getItem("chat_uuid");
      const res = await api.post(`/tickets`, { clientUuid });
      const ticket = res.data;
      // refresh tickets first
      await fetchTickets();
      // determine if the returned ticket was just created by comparing createdAt
      let created = false;
      try {
        const createdAt = ticket?.createdAt ? new Date(ticket.createdAt).getTime() : NaN;
        if (!isNaN(createdAt)) {
          const delta = Date.now() - createdAt;
          // if server-created within last 1s, consider it newly created
          created = delta < 1000;
        }
      } catch (err) {
        // ignore and fallback
      }
      const { toast } = await import("sonner");
      if (created) {
        toast.success("Chamado criado");
      } else {
        toast.error("Já existe um chamado em aberto");
      }
      onOpen(ticket.id);
    } catch (e) {
      (await import("sonner")).toast.error("Erro ao criar chamado");
    }
  };

  // create an in-memory/mock ticket for offline demo
  const createTestChat = () => {
    try {
      if (typeof window === "undefined") return;
      const id = `mock-${crypto.randomUUID()}`;
      const ticket = {
        id,
        title: `Test Chat ${id.slice(0, 6)}`,
        status: "OPEN",
        clientUuid: uuid || `mock-client-${id.slice(5, 11)}`,
        createdAt: new Date().toISOString(),
        isMock: true,
      };
      const next = [ticket, ...mockTickets];
      setMockTickets(next);
      localStorage.setItem("mock_tickets", JSON.stringify(next));
      // init messages
      localStorage.setItem(`mock_chat:${id}:messages`, JSON.stringify([]));
      setActiveTicket(id);
      setTickets(next);
    } catch (e) {
      console.error(e);
    }
  };

  // migrate a mock chat to the real backend
  const migrateMockToReal = async (mockId: string) => {
    try {
      const raw = localStorage.getItem(`mock_chat:${mockId}:messages`);
      const msgs = raw ? JSON.parse(raw) : [];
      // create real ticket
      if (!uuid) {
        const newUuid = crypto.randomUUID();
        localStorage.setItem("chat_uuid", newUuid);
      }
      const clientUuid = localStorage.getItem("chat_uuid");
      const res = await api.post(`/tickets`, { clientUuid });
      const realTicket = res.data;
      // post messages sequentially
      for (const m of msgs) {
        try {
          await api.post(`/tickets/${realTicket.id}/messages`, {
            ticketId: realTicket.id,
            senderUuid: m.sender,
            role: m.role,
            content: m.content,
          });
        } catch (err) {
          // ignore individual failures
        }
      }
      // switch to real API usage, refresh tickets and exit current mock chat
      setUseRealApi(true);
      try { localStorage.setItem("use_real_api", "true"); } catch {}
      await fetchTickets();
      // exit the mock chat so user sees the real ticket list
      setActiveTicket(null);
      (await import("sonner")).toast.success("Switched to real chat and migrated messages");
    } catch (e) {
      (await import("sonner")).toast.error("Failed to migrate to real chat");
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
            tickets={useRealApi ? tickets : mockTickets}
          />
        </div>
        <div className="flex-1">
          {activeTicket ? (
            <div className="h-full">
              <ChatRoom
                ticketId={activeTicket}
                mode={useRealApi ? "real" : "mock"}
                onSwitchToReal={async (mockId: string) => await migrateMockToReal(mockId)}
                backendAvailable={backendAvailable}
                useRealApi={useRealApi}
              />
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
              tickets={useRealApi ? tickets : mockTickets}
            />
          </div>
        ) : (
          <div className="h-full">
            <ChatRoom
              ticketId={activeTicket}
              onBack={() => setActiveTicket(null)}
              mode={useRealApi ? "real" : "mock"}
              onSwitchToReal={async (mockId: string) => await migrateMockToReal(mockId)}
              backendAvailable={backendAvailable}
              useRealApi={useRealApi}
            />
          </div>
        )}
      </div>
    </div>
  );
}
