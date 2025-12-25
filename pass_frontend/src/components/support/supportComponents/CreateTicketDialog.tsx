"use client";

import React, { use, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TicketData, Priority, Category, Module } from "../types";
import { ticketAPI } from "@/components/support/api/ticketAPI";
import { BiSupport } from "react-icons/bi";
import { useI18n } from "@/lib/i18n/i18n-context";

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (ticket: TicketData) => void;
}

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [module, setModule] = useState<Module | "">("");
  const [clientName, setClientName] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !module || !clientName.trim() || !priority) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const newTicketData = {
      ticketNumber: `TKT-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`,
      title: title.trim(),
      category: category as Category,
      module: module as Module,
      clientName: clientName.trim(),
      priority: priority as Priority,
      status: "Aberto" as const,
      createdAt: new Date(),
      assignedTo: assignedTo ? {
        id: "temp-" + Date.now(),
        name: assignedTo,
        avatarFallback: assignedTo.split(" ").map(n => n[0]).join("").toUpperCase(),
        role: "Desenvolvedor",
        email: "",
        phone: "",
      } : null,
      attachmentCount: 0,
      messageCount: 0,
    };
    try {
      const newTicket = await ticketAPI.create(newTicketData);
      onCreate(newTicket);
      setTitle("");
      setCategory("");
      setModule("");
      setClientName("");
      setPriority("");
      setAssignedTo("");
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        showCloseButtonClean={true}
        className="p-0 gap-0 overflow-hidden border-border flex flex-col rounded-lg max-w-none sm:max-w-xl! max-h-none"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6">
          <div className="p-3 bg-background border border-border rounded-full">
            <BiSupport className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <DialogTitle className="text-md font-semibold">
              Criar Novo Chamado
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Preencha os detalhes abaixo para abrir um novo chamado de suporte.
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col   sm:max-h-[80vh]  "
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 overflow-y-auto h-full  ">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="font-medium">
                  Título
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do chamado"
                  required
                  className="h-10"
                />
              </div>
               {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="clientName" className="font-medium">
                  Cliente
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                  className="h-10"
                />
              </div>


              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium">
                  Categoria
                </Label>
                <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                  <SelectTrigger id="category" className="h-10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent >
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Acesso">Acesso</SelectItem>
                    <SelectItem value="Dúvida">Dúvida</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Module */}
              <div className="space-y-2">
                <Label htmlFor="module" className="font-medium">
                  Módulo
                </Label>
                <Select value={module} onValueChange={(value) => setModule(value as Module)}>
                  <SelectTrigger id="module" className="h-10">
                    <SelectValue placeholder="Selecione o módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Checkout">Checkout</SelectItem>
                    <SelectItem value="Integração">Integração</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

             
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="font-medium">
                  Prioridade
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  <SelectTrigger id="priority" className="h-10 ">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assignedTo" className="font-medium">
                  Responsável
                </Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignedTo" className="h-10">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="João Silva">João Silva</SelectItem>
                    <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                    <SelectItem value="Pedro Oliveira">Pedro Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons */}
            <div className="sticky bottom-0 flex justify-between gap-3 px-6 pb-6 pt-4 mt-4 border-t bg-background backdrop-blur-sm">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[100px]"
              >
                {t.common.close}
              </Button>
              <Button type="submit" variant="modal" className="min-w-[100px]">
                {t.common.save}
              </Button>
            </div>
          </form>
          
        </div>
        
      </DialogContent>
    </Dialog>
  );
};
