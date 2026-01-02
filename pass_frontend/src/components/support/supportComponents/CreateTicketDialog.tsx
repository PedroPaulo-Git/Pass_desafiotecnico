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
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

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
  const [showError, setShowError] = useState(false);

  const isInvalid = (value: string) => showError && !value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !category ||
      !module ||
      !clientName.trim() ||
      !priority
    ) {
      setShowError(true);
      return;
    }
    const newTicketData = {
      ticketNumber: `TKT-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`,
      title: title.trim(),
      description: "", // Adicionando descrição vazia
      category: category as Category,
      categoryApi: category as Category, // Valor original do backend
      module: module as Module,
      moduleApi: module as Module, // Valor original do backend
      environment: "WEB" as const, // Adicionando ambiente padrão
      clientName: clientName.trim(),
      priority: priority as Priority,
      status: "Aberto" as const,
      createdAt: new Date(),
      assignedTo: assignedTo
        ? {
            id: "temp-" + Date.now(),
            name: assignedTo,
            avatarFallback: assignedTo
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
            role: "Desenvolvedor",
            email: "",
            phone: "",
          }
        : null,
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
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 overflow-y-auto h-full  ">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="title"
                  className={cn(
                    "font-medium",
                    isInvalid(title) && "text-destructive"
                  )}
                >
                  Título
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do chamado"
                  className={cn(
                    "h-10",
                    isInvalid(title) &&
                      "border-destructive focus-visible:ring-destructive/30"
                  )}
                />
              </div>
              {/* Client */}
              <div className="space-y-2">
                <Label
                  htmlFor="clientName"
                  className={cn(
                    "font-medium",
                    isInvalid(clientName) && "text-destructive"
                  )}
                >
                  Cliente
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className={cn(
                    "h-10",
                    isInvalid(clientName) &&
                      "border-destructive focus-visible:ring-destructive/30"
                  )}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className={cn(
                    "font-medium",
                    isInvalid(category) && "text-destructive"
                  )}
                >
                  Categoria
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as Category)}
                >
                  <SelectTrigger
                    id="category"
                    className={cn(
                      "h-10",
                      isInvalid(category) &&
                        "border-destructive focus:ring-destructive/30"
                    )}
                  >
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Acesso">Acesso</SelectItem>
                    <SelectItem value="Dúvida">Dúvida</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Module */}
              <div className="space-y-2">
                <Label
                  htmlFor="module"
                  className={cn(
                    "font-medium",
                    isInvalid(module) && "text-destructive"
                  )}
                >
                  Módulo
                </Label>
                <Select
                  value={module}
                  onValueChange={(value) => setModule(value as Module)}
                >
                  <SelectTrigger
                    id="module"
                    className={cn(
                      "h-10",
                      isInvalid(module) &&
                        "border-destructive focus:ring-destructive/30"
                    )}
                  >
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
                <Label
                  htmlFor="priority"
                  className={cn(
                    "font-medium",
                    isInvalid(priority) && "text-destructive"
                  )}
                >
                  Prioridade
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  <SelectTrigger
                    id="priority"
                    className={cn(
                      "h-10",
                      isInvalid(priority) &&
                        "border-destructive focus:ring-destructive/30"
                    )}
                  >
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
                    <SelectItem value="Pedro Oliveira">
                      Pedro Oliveira
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons */}
            {showError && (
              <div className="mx-6 mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">
                  Por favor, preencha os campos obrigatórios.
                </span>
              </div>
            )}
            <div className="sticky bottom-0 flex justify-between gap-3 px-6 pb-6 pt-4 mt-4 border-t bg-background backdrop-blur-sm">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-25"
              >
                {t.common.close}
              </Button>
              <Button type="submit" variant="modal" className="min-w-25">
                {t.common.save}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
