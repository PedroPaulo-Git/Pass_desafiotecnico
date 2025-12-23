"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // Assumindo que você tem este componente
import { TicketData } from "../types";
import {
  getPriorityStyles,
  getStatusStyles,
  getCategoryIconAndColor,
  getPriorityFromCategory,
  getStatusIconAndColor,
} from "../helpers";
import {
  MessageSquare,
  Paperclip,
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  Share2,
  Download,
  Briefcase,
  Layers,
  XIcon,
} from "lucide-react";

interface TicketDialogProps {
  ticket: TicketData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDialog: React.FC<TicketDialogProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!ticket) return null;

  const effectivePriority =
    ticket.priority || getPriorityFromCategory(ticket.category);
  const categoryIcon = getCategoryIconAndColor(ticket.category);
  // const statusIcon = getStatusIconAndColor(ticket.status); // Opcional se quiser usar ícone no status

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-[95vw] md:max-w-6xl h-[90vh]  md:max-h-[85vh] p-0 gap-0 overflow-hidden border-border bg-card flex flex-col rounded-xl"
      >
        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto min-h-full ">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full ">
            {/* LEFT COLUMN (MAIN INFO) */}
            <div className="lg:col-span-2 space-y-6 border-r border-border ">
              {/* --- HEADER --- */}
              <div className="px-6 py-5 border-b border-border bg-card shrink-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                      {categoryIcon.icon && (
                        <div
                          className={`mt-1 p-2 rounded-full border ${getPriorityStyles(
                            effectivePriority
                          )}`}
                        >
                          <categoryIcon.icon className={` w-5 h-5`} />
                        </div>
                      )}
                      {ticket.title}
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="font-mono">{ticket.ticketNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <Badge
                        variant="outline"
                        className={`${getStatusStyles(
                          ticket.status
                        )} capitalize`}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {ticket.createdAt instanceof Date
                          ? ticket.createdAt.toLocaleDateString()
                          : new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div> */}
                  <Button variant="ghost" onClick={onClose} className="p-2 hidden md:flex">
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>

                {/* Fake Tabs Navigation mimicking the image */}
                <div className="flex items-center gap-6 mt-6 border-b border-transparent">
                  <button className="text-sm font-medium text-primary border-b-2 border-primary pb-2 px-1">
                    Informações
                  </button>
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pb-2 px-1">
                    Histórico
                  </button>
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pb-2 px-1">
                    Anexos ({ticket.attachmentCount})
                  </button>
                </div>
              </div>

              {/* LEFT CONTENT*/}
              <div className="px-4 flex flex-col gap-4">
                {/* Card 1: Dados do Ticket */}
                <div className="bg-muted/50 border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">
                        Dados do Ticket
                      </h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs text-primary bg-primary/10 hover:bg-primary/20 border-primary/20"
                    >
                      Detalhes Técnicos
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground tracking-wider">
                        Categoria
                      </label>
                      <p className="mt-0.5  text-sm font-medium flex items-center gap-2">
                        {ticket.category}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground tracking-wider">
                        Módulo
                      </label>
                      <p className="mt-0.5 text-sm font-medium">
                        {ticket.module}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground tracking-wider">
                        Descrição / Assunto
                      </label>
                      <p className="mt-0.5 text-sm text-foreground/90 leading-relaxed">
                        {ticket.title} - Este ticket refere-se a uma solicitação
                        de suporte.
                        {/* Aqui entraria a descrição longa se existisse no tipo */}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Dados do Cliente */}
                <div className="bg-muted/50 border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">
                        Dados do Cliente
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-primary cursor-pointer hover:underline">
                      Ver perfil completo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground tracking-wider">
                        Nome do Cliente
                      </label>
                      <p className="mt-0.5 font-medium text-sm">
                        {ticket.clientName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contato
                      </label>
                      <div className="mt-1.5 space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          email@exemplo.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          +55 11 99999-9999
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (SIDEBAR) */}
            <div className="lg:col-span-1 space-y-4 px-2 py-4 flex flex-col">
              {/* Resumo Box */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Resumo da Solicitação
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Prioridade
                    </span>
                    <Badge
                      variant="outline"
                      className={getPriorityStyles(effectivePriority)}
                    >
                      {effectivePriority}
                    </Badge>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Tempo Resposta
                    </span>
                    <span className="text-sm font-medium">
                      {ticket.responseTime || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Abertura
                    </span>
                    <span className="text-sm font-medium">
                      {ticket.createdAt instanceof Date
                        ? ticket.createdAt.toLocaleDateString()
                        : new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground mb-4">
                  Métricas
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>Mensagens</span>
                    </div>
                    <span className="font-bold">{ticket.messageCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/40">
                    <div className="flex items-center gap-2 text-sm">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span>Anexos</span>
                    </div>
                    <span className="font-bold">{ticket.attachmentCount}</span>
                  </div>
                </div>
              </div>

              {/* Assigned To Box */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    Responsável
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Atribuído para resolução
                  </p>
                </div>

                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {ticket.assignedTo.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {ticket.assignedTo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suporte Técnico
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <User className="w-4 h-4" /> Não atribuído
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-4 px-5 bg-card border border-border rounded-xl">
                <div>
                  <p className="text-sm font-medium">Status Atual</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.status} desde a abertura
                  </p>
                </div>
                <CheckCircle2
                  className={`w-6 h-6 ${
                    ticket.status === "Resolvido"
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              {/* Actions */}
              <div className="pt-2 space-y-3 mt-auto">
                <Button className="w-full" variant="default">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
                <Button className="w-full" variant="secondary">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
