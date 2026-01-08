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
  module?: HelpdeskModule;
  search?: string;
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

// Message Types
export interface HelpdeskMessage {
  AuthorId: string;
  AuthorType: "user" | "support";
  Message: string;
  CreatedAt: string;
  Attachments: string[];
}

export interface CreateMessageInput {
  authorId: string;
  authorType: "user" | "support";
  message: string;
  attachments?: string[];
}

// Statistics Types
export interface TicketTrend {
  month: string;
  count: number;
  opened: number;
  closed: number;
}

export interface MessageStats {
  totalMessages: number;
  totalAttachments: number;
  avgMessagesPerTicket: number;
}

export interface StatsTotals {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface PercentageChange {
  tickets: number;
  messages: number;
}

export interface HelpdeskStatistics {
  ticketsByStatus: Record<HelpdeskStatus, number>;
  ticketsByPriority: Record<HelpdeskPriority, number>;
  ticketsByModule: Record<HelpdeskModule | string, number>;
  ticketsTrend: TicketTrend[];
  messagesStats: MessageStats;
  totals: StatsTotals;
  percentageChange: PercentageChange;
  role: string;
  userId?: string;
}