"use client";

import React, { useState } from "react";
import type { TicketData } from "../types";
import type {
  HelpdeskStatus,
  HelpdeskPriority,
  HelpdeskCategory,
  HelpdeskModule,
  HelpdeskEnvironment,
} from "@/features/helpdesk/types/helpdesk";

interface UseTicketUpdatesProps {
  initialTicket: TicketData | null;
  onUpdateStatus?: (id: string, status: HelpdeskStatus) => void | Promise<void>;
  onUpdatePriority?: (id: string, priority: HelpdeskPriority) => void | Promise<void>;
  onUpdateAssignedUser?: (id: string, userId: string) => void | Promise<void>;
  onUpdateTitle?: (id: string, title: string) => void | Promise<void>;
  onUpdateDescription?: (id: string, description: string) => void | Promise<void>;
  onUpdateCategory?: (id: string, category: HelpdeskCategory) => void | Promise<void>;
  onUpdateModule?: (id: string, module: HelpdeskModule) => void | Promise<void>;
  onUpdateEnvironment?: (id: string, environment: HelpdeskEnvironment) => void | Promise<void>;
  // Para compatibilidade com mutation functions
  updateMutation?: {
    mutate: (params: { id: string; updates: Record<string, any> }) => void;
    isLoading?: boolean;
  };
}

export type { UseTicketUpdatesProps };

export function useTicketUpdates({
  initialTicket,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignedUser,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateCategory,
  onUpdateModule,
  onUpdateEnvironment,
  updateMutation,
}: UseTicketUpdatesProps) {
  // Estado local para atualização otimista
  const [ticket, setTicket] = useState<TicketData | null>(initialTicket);

  // Estados para edição inline
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  // Atualizar estado local quando initialTicket muda
  React.useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  // Helper para executar updates (callback ou mutation)
  const executeUpdate = async (
    id: string,
    field: string,
    value: any,
    callback?: (id: string, value: any) => void | Promise<void>
  ) => {
    if (updateMutation) {
      // Verificar se está carregando
      if (updateMutation.isLoading) return;
      // Usar mutation
      updateMutation.mutate({ id, updates: { [field]: value } });
    } else if (callback) {
      // Usar callback
      await callback(id, value);
    }
  };

  // Funções de atualização com otimização
  const handleUpdateCategory = async (
    id: string,
    category: HelpdeskCategory
  ) => {
    if (!ticket) return;

    // Atualização otimista - atualizar estado local imediatamente
    const categoryMap: Record<string, TicketData["category"]> = {
      BUG: "Bug",
      AGENDAMENTO: "Acesso",
      TREINAMENTO: "Dúvida",
      PERFORMANCE: "Visual",
      AJUSTE_MELHORIA: "Visual",
      OUTRO: "Dúvida",
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            category: categoryMap[category] || prev.category,
            categoryApi: category,
          }
        : null
    );

    try {
      await executeUpdate(id, "category", category, onUpdateCategory);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar categoria:", error);
    }
  };

  const handleUpdateModule = async (id: string, module: HelpdeskModule) => {
    if (!ticket) return;

    // Atualização otimista
    const moduleMap: Record<string, TicketData["module"]> = {
      AGENDAMENTO: "Financeiro",
      TREINAMENTOS: "Admin",
      FINANCEIRO: "Financeiro",
      USUARIOS: "Admin",
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            module: moduleMap[module] || prev.module,
            moduleApi: module,
          }
        : null
    );

    try {
      await executeUpdate(id, "module", module, onUpdateModule);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar módulo:", error);
    }
  };

  const handleUpdateEnvironment = async (
    id: string,
    environment: HelpdeskEnvironment
  ) => {
    if (!ticket) return;

    // Atualização otimista
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            environment: environment,
          }
        : null
    );

    try {
      await executeUpdate(id, "environment", environment, onUpdateEnvironment);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar ambiente:", error);
    }
  };

  const handleUpdatePriority = async (
    id: string,
    priority: HelpdeskPriority
  ) => {
    if (!ticket) return;

    // Mapeamento de prioridade da API para display
    const priorityDisplayMap: Record<HelpdeskPriority, string> = {
      BAIXA: "Baixa",
      MEDIA: "Média",
      ALTA: "Alta",
      CRITICA: "Crítica",
    };

    // Atualização otimista
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            priority: priorityDisplayMap[priority] as any,
          }
        : null
    );

    try {
      await executeUpdate(id, "priority", priority, onUpdatePriority);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar prioridade:", error);
    }
  };

  const handleUpdateAssignedUser = async (id: string, user: any) => {
    if (!ticket) return;

    // Atualização otimista - atualizar estado local imediatamente
    const assignedUser = {
      id: user.id,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "DEVELOPER",
      avatarFallback:
        user.avatarFallback ||
        user.name
          ?.split(" ")
          .map((s: string) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() ||
        "DE",
    };

    setTicket((prev) =>
      prev
        ? {
            ...prev,
            assignedTo: assignedUser,
          }
        : null
    );

    try {
      await executeUpdate(id, "assignedUserId", user.id, onUpdateAssignedUser);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar responsável:", error);
    }
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    if (!ticket) return;

    // Validação do título
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle === ticket.title || trimmedTitle.length < 1) {
      return; // Não fazer nada se a validação falhar
    }

    // Atualização otimista
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            title: trimmedTitle,
          }
        : null
    );

    try {
      await executeUpdate(id, "title", trimmedTitle, onUpdateTitle);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar título:", error);
    }
  };

  const handleUpdateDescription = async (id: string, description: string) => {
    if (!ticket) return;

    // Validação da descrição
    const trimmedDescription = description.trim();
    if (!trimmedDescription || trimmedDescription === ticket.description) {
      return; // Não fazer nada se a validação falhar
    }

    // Atualização otimista
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            description: trimmedDescription,
          }
        : null
    );

    try {
      await executeUpdate(id, "description", trimmedDescription, onUpdateDescription);
    } catch (error) {
      // Em caso de erro, reverter a mudança
      setTicket(initialTicket);
      console.error("Erro ao atualizar descrição:", error);
    }
  };

  // Funções padronizadas para componentes que precisam de handlers diretos
  const handleStatusChange = async (status: HelpdeskStatus) => {
    if (!ticket) return;
    await executeUpdate(ticket.id, "status", status, onUpdateStatus);
  };

  const handlePriorityChange = async (priority: HelpdeskPriority) => {
    if (!ticket) return;
    await executeUpdate(ticket.id, "priority", priority, onUpdatePriority);
  };

  const handleAssign = async (user: any) => {
    if (!ticket) return;
    await handleUpdateAssignedUser(ticket.id, user);
  };

  // Funções para controle de edição
  const startEditingTitle = () => {
    if (ticket) {
      setEditedTitle(ticket.title || "");
      setIsEditingTitle(true);
    }
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const saveTitle = async () => {
    if (ticket && editedTitle.trim()) {
      await handleUpdateTitle(ticket.id, editedTitle);
    }
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const startEditingDescription = () => {
    if (ticket) {
      setEditedDescription(ticket.description || "");
      setIsEditingDescription(true);
    }
  };

  const cancelEditingDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  const saveDescription = async () => {
    if (ticket && editedDescription.trim()) {
      await handleUpdateDescription(ticket.id, editedDescription);
    }
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  return {
    ticket,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    isEditingDescription,
    editedDescription,
    setEditedDescription,
    handleUpdateCategory,
    handleUpdateModule,
    handleUpdateEnvironment,
    handleUpdatePriority,
    handleUpdateAssignedUser,
    handleUpdateDescription,
    handleUpdateTitle,
    startEditingTitle,
    cancelEditingTitle,
    saveTitle,
    startEditingDescription,
    cancelEditingDescription,
    saveDescription,
    handleStatusChange,
    handlePriorityChange,
    handleAssign,
  };
}