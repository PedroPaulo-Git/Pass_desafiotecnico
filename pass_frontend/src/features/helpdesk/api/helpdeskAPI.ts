// src/features/helpdesk/api/helpdeskAPI.ts
import { api } from "@/lib/axios";
import {
  Helpdesk,
  CreateHelpdeskInput,
  UpdateHelpdeskInput,
  HelpdeskFilters,
  PaginatedHelpdeskResponse,
  HelpdeskMessage,
  CreateMessageInput
} from "../types/helpdesk";
import { MOCK_HELPDESK } from "./helpdeskMockData";

// Real API calls
export const helpdeskAPI = {
  // Get all helpdesk tickets
  async getAll(filters: HelpdeskFilters = {}): Promise<PaginatedHelpdeskResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category) params.append("category", filters.category);
    if (filters.clientId) params.append("clientId", filters.clientId);
    if (filters.assignedUserId) params.append("assignedUserId", filters.assignedUserId);
    if (filters.module) params.append("module", filters.module);
    if (filters.search) params.append("search", filters.search);

    const { data } = await api.get<{ data: Helpdesk[], pagination: { page: number, limit: number, total: number, totalPages: number } }>(
      `/helpdesk?${params.toString()}`
    );
    
    // Map backend response to expected format
    return {
      items: data.data,
      page: data.pagination.page,
      limit: data.pagination.limit,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages,
    };
  },

  // Get single helpdesk ticket
  async getById(id: string): Promise<Helpdesk> {
    const { data } = await api.get<Helpdesk>(`/helpdesk/${id}`);
    return data;
  },

  // Create new helpdesk ticket
  async create(ticket: CreateHelpdeskInput): Promise<Helpdesk> {
    const { data } = await api.post<Helpdesk>("/helpdesk", ticket);
    return data;
  },

  // Update helpdesk ticket
  async update(id: string, updates: UpdateHelpdeskInput): Promise<Helpdesk> {
    console.log("🔄 Making update request to:", `/helpdesk/${id}`, updates);
    const { data } = await api.put<Helpdesk>(`/helpdesk/${id}`, updates);
    console.log("✅ Update successful:", data);
    return data;
  },

  // Delete helpdesk ticket
  async delete(id: string): Promise<void> {
    await api.delete(`/helpdesk/${id}`);
  },

  // --- Messages ---
  async getMessages(helpdeskId: string): Promise<HelpdeskMessage[]> {
    const { data } = await api.get<HelpdeskMessage[]>(`/helpdesk/${helpdeskId}/messages`);
    return data;
  },

  async sendMessage(helpdeskId: string, input: CreateMessageInput): Promise<void> {
    await api.post(`/helpdesk/${helpdeskId}/messages`, input);
  },

  async deleteMessage(helpdeskId: string, messageIndex: number): Promise<void> {
    await api.delete(`/helpdesk/${helpdeskId}/messages/${messageIndex}`);
  },

  // --- Attachments ---
  async uploadAttachment(helpdeskId: string, file: File): Promise<{ url: string; filename: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post<{ url: string; filename: string; path: string }>(
      `/helpdesk/${helpdeskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  async listAttachments(helpdeskId: string): Promise<Array<{ filename: string; size: number; uploadedAt: string; url: string }>> {
    const { data } = await api.get<Array<{ filename: string; size: number; uploadedAt: string; url: string }>>(
      `/helpdesk/${helpdeskId}/attachments`
    );
    return data;
  },

  async downloadAttachment(helpdeskId: string, filename: string): Promise<Blob> {
    const { data } = await api.get(`/helpdesk/${helpdeskId}/attachments/${filename}`, {
      responseType: 'blob',
    });
    return data;
  },

  async getHistory(helpdeskId: string): Promise<Array<{ id: string; type: string; title: string; description: string; userName: string; createdAt: string }>> {
    const { data } = await api.get(`/helpdesk/${helpdeskId}/history`);
    return data;
  },
};

// Mock API calls (for when backend is offline)
export const helpdeskMockAPI = {
  async getAll(filters: HelpdeskFilters = {}): Promise<PaginatedHelpdeskResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredItems = [...MOCK_HELPDESK];

    // Apply filters
    if (filters.status) {
      filteredItems = filteredItems.filter(item => item.status === filters.status);
    }
    if (filters.priority) {
      filteredItems = filteredItems.filter(item => item.priority === filters.priority);
    }
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }
    if (filters.clientId) {
      filteredItems = filteredItems.filter(item => item.clientId === filters.clientId);
    }
    if (filters.assignedUserId) {
      filteredItems = filteredItems.filter(item => item.assignedUserId === filters.assignedUserId);
    }
    if (filters.module) {
      filteredItems = filteredItems.filter(item => item.module === filters.module);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.ticketNumber?.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    filteredItems.sort((a, b) => {
      const aValue = a[sortBy as keyof Helpdesk];
      const bValue = b[sortBy as keyof Helpdesk];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === "asc" ? -1 : 1;
      if (bValue == null) return sortOrder === "asc" ? 1 : -1;

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      page,
      limit,
      total: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / limit),
    };
  },

  async getById(id: string): Promise<Helpdesk> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const ticket = MOCK_HELPDESK.find(t => t.id === id);
    if (!ticket) {
      throw new Error("Helpdesk ticket not found");
    }
    return ticket;
  },

  async create(ticket: CreateHelpdeskInput): Promise<Helpdesk> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTicket: Helpdesk = {
      id: `mock-${Date.now()}`,
      ticketNumber: `TKT-2025-${String(MOCK_HELPDESK.length + 1).padStart(3, '0')}`,
      clientId: ticket.clientId,
      userId: ticket.userId || null,
      assignedUserId: null, // Novos tickets não têm responsável atribuído
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority || "BAIXA",
      status: "ABERTO",
      module: ticket.module || null,
      environment: ticket.environment || "WEB",
      bucketPath: `helpdesk/client_${ticket.clientId}/ticket_mock-${Date.now()}`,
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
    };

    MOCK_HELPDESK.push(newTicket);
    return newTicket;
  },

  async update(id: string, updates: UpdateHelpdeskInput): Promise<Helpdesk> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const ticketIndex = MOCK_HELPDESK.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      throw new Error("Helpdesk ticket not found");
    }

    MOCK_HELPDESK[ticketIndex] = {
      ...MOCK_HELPDESK[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return MOCK_HELPDESK[ticketIndex];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const ticketIndex = MOCK_HELPDESK.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      throw new Error("Helpdesk ticket not found");
    }

    MOCK_HELPDESK.splice(ticketIndex, 1);
  },
};