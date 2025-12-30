// src/features/helpdesk/types/helpdesk.ts

export type HelpdeskCategory = "BUG" | "AGENDAMENTO" | "TREINAMENTO" | "PERFORMANCE" | "AJUSTE_MELHORIA" | "OUTRO";

export type HelpdeskPriority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type HelpdeskStatus = "ABERTO" | "EM_ANALISE" | "EM_ANDAMENTO" | "AGUARDANDO_USUARIO" | "RESOLVIDO" | "ENCERRADO";

export type HelpdeskModule = "AGENDAMENTO" | "TREINAMENTOS" | "FINANCEIRO" | "USUARIOS";

export type HelpdeskEnvironment = "WEB" | "MOBILE";

export interface Helpdesk {
  id: string;
  ticketNumber: string | null;
  clientId: string;
  userId: string | null;
  assignedUserId: string | null;
  title: string;
  description: string;
  category: HelpdeskCategory;
  priority: HelpdeskPriority;
  status: HelpdeskStatus;
  module: HelpdeskModule | null;
  environment: HelpdeskEnvironment;
  bucketPath: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface CreateHelpdeskInput {
  clientId: string;
  userId?: string;
  title: string;
  description: string;
  category: HelpdeskCategory;
  priority?: HelpdeskPriority;
  module?: HelpdeskModule;
  environment?: HelpdeskEnvironment;
  attachments?: string[];
}

export interface UpdateHelpdeskInput {
  assignedUserId?: string;
  status?: HelpdeskStatus;
  priority?: HelpdeskPriority;
  title?: string;
  description?: string;
  category?: HelpdeskCategory;
  module?: HelpdeskModule;
  environment?: HelpdeskEnvironment;
  attachments?: string[];
}

export interface HelpdeskFilters {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "lastMessageAt" | "priority";
  sortOrder?: "asc" | "desc";
  status?: HelpdeskStatus;
  priority?: HelpdeskPriority;
  category?: HelpdeskCategory;
  clientId?: string;
  assignedUserId?: string;
}

export interface PaginatedHelpdeskResponse {
  items: Helpdesk[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Backend Status Types
export type BackendStatus = "online" | "offline" | "checking";

export interface BackendStatusInfo {
  status: BackendStatus;
  lastChecked: Date | null;
  error?: string;
}