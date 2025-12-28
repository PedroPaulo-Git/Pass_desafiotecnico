// src/features/helpdesk/components/CreateHelpdeskDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHelpdesk } from "../hooks/use-helpdesk";
import { CreateHelpdeskInput, Helpdesk, HelpdeskModule } from "../types/helpdesk";
import { useAuth } from "@/hooks/use-auth";

interface CreateHelpdeskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (ticket: Helpdesk) => void;
}

export function CreateHelpdeskDialog({
  isOpen,
  onClose,
  onCreate
}: CreateHelpdeskDialogProps) {
  const { currentUser } = useAuth();
  const createMutation = useCreateHelpdesk();

  const [formData, setFormData] = useState<Partial<CreateHelpdeskInput>>({
    title: "",
    description: "",
    category: "BUG",
    priority: "MEDIA",
    module: undefined,
    environment: "WEB",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      alert("Usuário não autenticado");
      return;
    }

    if (!formData.title || !formData.description) {
      alert("Título e descrição são obrigatórios");
      return;
    }

    try {
      const ticketData: CreateHelpdeskInput = {
        clientId: currentUser.id, // Assume que o usuário logado é o cliente
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        priority: formData.priority as any,
        module: formData.module as any,
        environment: formData.environment as any,
      };

      const newTicket = await createMutation.mutateAsync(ticketData);

      onCreate?.(newTicket);
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "BUG",
        priority: "MEDIA",
        module: undefined,
        environment: "WEB",
      });
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Chamado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Descreva brevemente o problema"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhadamente o problema ou solicitação"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="AGENDAMENTO">Agendamento</SelectItem>
                  <SelectItem value="TREINAMENTO">Treinamento</SelectItem>
                  <SelectItem value="PERFORMANCE">Performance</SelectItem>
                  <SelectItem value="AJUSTE_MELHORIA">Ajuste/Melhoria</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

         <div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="module">Módulo</Label>
    <Select
      value={formData.module || "NONE"}
      onValueChange={(value) => setFormData(prev => ({
        ...prev,
        module: value === "NONE" ? undefined : value as HelpdeskModule
      }))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione o módulo (opcional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NONE">Nenhum</SelectItem>
        <SelectItem value="AGENDAMENTO">Agendamento</SelectItem>
        <SelectItem value="TREINAMENTOS">Treinamentos</SelectItem>
        <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
        <SelectItem value="USUARIOS">Usuários</SelectItem>
      </SelectContent>
    </Select>
  </div>
            <div>
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Criando..." : "Criar Chamado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}