import { TicketData } from "../types";

// --- Mock Database ---
let MOCK_TICKETS: TicketData[] = [
  {
    id: "1",
    ticketNumber: "TKT-2024-001",
    title: "Erro ao gerar relatório financeiro em PDF",
    category: "Bug",
    module: "Financeiro",
    clientName: "Maria Silva (Viagens Premium)",
    priority: "Alta",
    status: "Em Andamento",
    createdAt: new Date(2025, 11, 21, 9, 30), // Hoje
    assignedTo: { id: "dev1", name: "Carlos Dev", avatarFallback: "CD" },
    attachmentCount: 2,
    messageCount: 5,
  },
  {
    id: "2",
    ticketNumber: "TKT-2024-002",
    title: "Solicitação de novo usuário no sistema",
    category: "Acesso",
    module: "Admin",
    clientName: "Ana Paula (Mundo Viagens)",
    priority: "Baixa",
    status: "Aberto",
    createdAt: new Date(2025, 11, 20, 14, 20), // Ontem
    assignedTo: null, // Ninguém pegou ainda
    attachmentCount: 0,
    messageCount: 1,
  },
  {
    id: "3",
    ticketNumber: "TKT-2024-003",
    title: "API retornando erro 500 no checkout",
    category: "Bug",
    module: "Checkout",
    clientName: "Roberto Alves (Destinos Inc.)",
    priority: "Alta",
    status: "Resolvido",
    createdAt: new Date(2025, 11, 19), // 19/12/2025
    responseTime: "45min",
    assignedTo: { id: "dev2", name: "Amanda Tech", avatarFallback: "AT" },
    attachmentCount: 1,
    messageCount: 12,
  },
  {
    id: "4",
    ticketNumber: "TKT-2024-004",
    title: "Dúvida sobre integração com Gateway",
    category: "Dúvida",
    module: "Integração",
    clientName: "Lucas Ferreira",
    priority: "Média",
    status: "Em Andamento",
    createdAt: new Date(2025, 11, 18), // 18/12/2025
    assignedTo: { id: "dev1", name: "Carlos Dev", avatarFallback: "CD" },
    attachmentCount: 3,
    messageCount: 4,
  },
  {
    id: "5",
    ticketNumber: "TKT-2024-005",
    title: "Ajuste de cor no botão da Home",
    category: "Visual",
    module: "Frontend",
    clientName: "Eduardo Oliveira",
    priority: "Baixa",
    status: "Fechado",
    createdAt: new Date(2025, 11, 15), // 15/12/2025
    assignedTo: { id: "dev3", name: "Junior Front", avatarFallback: "JF" },
    attachmentCount: 1,
    messageCount: 2,
  },
];

// --- API Simulation ---
export const ticketAPI = {
  // Get all tickets
  getAll: (): Promise<TicketData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_TICKETS]), 100);
    });
  },

  // Get ticket by ID
  getById: (id: string): Promise<TicketData | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ticket = MOCK_TICKETS.find(t => t.id === id) || null;
        resolve(ticket);
      }, 50);
    });
  },

  // Update ticket priority
  updatePriority: (id: string, newPriority: string): Promise<TicketData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === id);
        if (ticketIndex === -1) {
          reject(new Error('Ticket not found'));
          return;
        }

        MOCK_TICKETS[ticketIndex] = {
          ...MOCK_TICKETS[ticketIndex],
          priority: newPriority as any
        };

        resolve(MOCK_TICKETS[ticketIndex]);
      }, 200);
    });
  },

  // Create new ticket
  create: (ticket: Omit<TicketData, 'id'>): Promise<TicketData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTicket: TicketData = {
          ...ticket,
          id: Date.now().toString()
        };
        MOCK_TICKETS.push(newTicket);
        resolve(newTicket);
      }, 300);
    });
  },

  // Update ticket
  update: (id: string, updates: Partial<TicketData>): Promise<TicketData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === id);
        if (ticketIndex === -1) {
          reject(new Error('Ticket not found'));
          return;
        }

        MOCK_TICKETS[ticketIndex] = {
          ...MOCK_TICKETS[ticketIndex],
          ...updates
        };

        resolve(MOCK_TICKETS[ticketIndex]);
      }, 200);
    });
  },

  // Delete ticket
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === id);
        if (ticketIndex === -1) {
          reject(new Error('Ticket not found'));
          return;
        }

        MOCK_TICKETS.splice(ticketIndex, 1);
        resolve();
      }, 150);
    });
  }
};