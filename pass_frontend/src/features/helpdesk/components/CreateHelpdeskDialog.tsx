// src/features/helpdesk/components/CreateHelpdeskDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BiSupport } from "react-icons/bi";
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
import { toast } from "sonner";

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
      // Show error toast with the exact message from the API
      const errorMessage = (error as any)?.response?.data?.message || (error instanceof Error ? error.message : "Erro desconhecido ao criar chamado");
      toast.error(errorMessage);
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        showCloseButtonClean={true}
        className="p-0 gap-0 overflow-hidden border-border flex flex-col rounded-lg max-w-none sm:max-w-xl! max-h-none"
      >
        <div className="flex items-center gap-3 p-6">
          <div className="p-3 bg-background border border-border rounded-full">
            <BiSupport className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <DialogTitle className="text-md font-semibold">Criar Novo Chamado</DialogTitle>
            <p className="text-sm text-muted-foreground">Preencha os detalhes abaixo para abrir um novo chamado de suporte.</p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:max-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 overflow-y-auto h-full">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="font-medium">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Descreva brevemente o problema"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="font-medium">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger id="category" className="h-10">
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

              <div className="space-y-2">
                <Label htmlFor="priority" className="font-medium">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger id="priority" className="h-10">
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

              <div className="space-y-2">
                <Label htmlFor="module" className="font-medium">Módulo</Label>
                <Select
                  value={formData.module || "NONE"}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    module: value === "NONE" ? undefined : value as HelpdeskModule
                  }))}
                >
                  <SelectTrigger id="module" className="h-10">
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

              <div className="space-y-2">
                <Label htmlFor="environment" className="font-medium">Ambiente</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value as any }))}
                >
                  <SelectTrigger id="environment" className="h-10">
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB">Web</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-between gap-3 px-6 pb-6 pt-4 mt-4 border-t bg-background backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">Cancelar</Button>
              <Button type="submit" className="min-w-[100px]" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Chamado"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}