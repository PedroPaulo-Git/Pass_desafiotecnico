// --- Tipos de Dados Baseados na sua Estrutura ---
export type Priority = "Alta" | "Média" | "Baixa";
export type Status = "Aberto" | "Em Andamento" | "Resolvido" | "Fechado";

export interface Developer {
  id: string;
  name: string;
  avatarFallback: string;
  role: string;
  email: string;
  phone: string;
}

export interface User {
  name: string;
  category: string; // e.g., "Adulto"
  cpf: string;
  birthDate: string;
  nationality: string;
  email: string;
  telefone: string;
}

export interface TicketData {
  id: string;
  ticketNumber: string; // ex: TKT-1024
  title: string;
  category: string; // ex: Bug, Feature, Acesso
  module: string; // ex: Financeiro, Login
  clientName: string;
  user?: User; // Informações detalhadas do usuário
  priority: Priority;
  status: Status;
  createdAt: string | Date;
  responseTime?: string; // ex: "2h"
  assignedTo?: Developer | null;
  attachmentCount: number;
  messageCount: number;
}
