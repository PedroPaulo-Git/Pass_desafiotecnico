// --- Tipos de Dados Baseados na sua Estrutura ---
export type Priority = "Alta" | "Média" | "Baixa" ;
export type Status = "Aberto" | "Em Análise" | "Em Andamento" | "Aguardando Usuário" | "Resolvido" | "Fechado";
export type Category = "Bug" | "Acesso" | "Dúvida" | "Visual";
export type Module = "Financeiro" | "Admin" | "Checkout" | "Integração" | "Frontend";

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
  description: string;
  category: Category; // ex: Bug, Feature, Acesso
  categoryApi?: string; // valor original do backend
  module: Module; // ex: Financeiro, Login
  moduleApi?: string; // valor original do backend
  environment: "WEB" | "MOBILE";
  clientName: string;
  user?: User; // Informações detalhadas do usuário
  priority: Priority;
  status: Status;
  statusApi?: string;
  createdAt: string | Date;
  priorityApi?: string;
  responseTime?: string; // ex: "2h"
  assignedUserId?: string | null;
  assignedTo?: Developer | null; // Informações do desenvolvedor atribuído
  attachmentCount: number;
  messageCount: number;
}
