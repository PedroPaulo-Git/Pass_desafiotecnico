"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GiHistogram } from "react-icons/gi";
import { TbHistoryToggle } from "react-icons/tb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-support";
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
  Tag,
  Package,
  FileText,
  Phone,
  Mail,
  Play,
  XCircle,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="p-0 h-[90vh] gap-0 overflow-hidden border-border bg-card flex flex-col rounded-lg"
      >
        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 min-h-full ">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full ">
            {/* LEFT COLUMN (MAIN INFO) */}
            <div className="lg:col-span-2 space-y-4 border-r border-border pb-4 overflow-auto scrollbar-hidden">
              {/* --- HEADER --- */}
              <div className="pt-4 border-b border-border bg-card shrink-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-4 ">
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
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="text-sm">
                        <span className="font-medium">Código do ticket: </span>
                        <span className="font-semibold">
                          {ticket.ticketNumber}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge
                        variant="outline"
                        className={`${getStatusStyles(
                          ticket.status
                        )} capitalize`}
                      >
                        {ticket.status}
                      </Badge>
                      <span className="flex items-center text-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-4 h-4 mb-0.5" />
                        {ticket.createdAt instanceof Date &&
                          ticket.createdAt.toLocaleDateString("pt-BR")}
                      </span>
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
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="p-2 hidden md:flex"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>

                {/* Fake Tabs Navigation mimicking the image */}
                {/* <Tabs defaultValue="info">
                  <TabsList className="mt-6 border-b border-border/50 pb-1">
                    <TabsTrigger value="info" className="text-sm font-medium px-3 py-1.5">
                      Informações
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="text-sm font-medium px-3 py-1.5">
                      Histórico
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="text-sm font-medium px-3 py-1.5">
                      Anexos ({ticket.attachmentCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs> */}
                <Tabs className="w-full" defaultValue="info">
                  <TabsList className="mt-6 border-t px-4 w-full bg-transparent rounded-none">
                    <TabsTrigger
                      supportTab={true}
                      value="info"
                      className="text-sm font-medium px-3 py-1.5 "
                    >
                      <User className="w-4 h-4 mb-0.5 mr-1 text-inherit" />
                      Informações
                    </TabsTrigger>
                    <TabsTrigger
                      supportTab={true}
                      value="historico"
                      className="text-sm font-medium px-3 py-1.5"
                    >
                      <TbHistoryToggle className="w-4 h-4 text-inherit" />
                      Histórico
                    </TabsTrigger>
                    <TabsTrigger
                      supportTab={true}
                      value="anexos"
                      className="text-sm font-medium px-3 py-1.5"
                    >
                      <Paperclip className="w-4 h-4 text-inherit" />
                      Anexos ({ticket.attachmentCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* LEFT CONTENT*/}
              <div className="px-4 flex flex-col gap-4 ">
                {/* Card 1: Dados do Ticket */}
                <div className="bg-muted/30  border border-border rounded-xl py-6 px-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-violet-600" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Dados do Ticket
                      </h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 "
                    >
                      Detalhes Técnicos
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 space-y-3  gap-x-8 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex gap-2 ">
                      <Tag className="w-3 h-3 mt-1 text-violet-600" />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Categoria
                        </label>
                        <p> {ticket.category}</p>
                      </span>
                    </div>
                    <div className="flex gap-2 ">
                      <Package className="w-3 h-3 mt-1 text-violet-600" />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Módulo
                        </label>
                        <p> {ticket.module}</p>
                      </span>
                    </div>
                    <Separator
                      orientation="horizontal"
                      className="md:col-span-2 bg-border/50"
                    />

                    <div className="md:col-span-2 flex gap-2 ">
                      <FileText className="w-3 h-3 mt-1 text-violet-600" />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Descrição / Assunto
                        </label>
                        <p className="text-foreground/90 leading-relaxed">
                          {ticket.title} - Este ticket refere-se a uma
                          solicitação de suporte.
                          {/* Aqui entraria a descrição longa se existisse no tipo */}
                        </p>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Dados do Cliente */}
                <div className="bg-muted/30  border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Dados do Cliente
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-blue-600 "></span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 "
                    >
                      Informações do Cliente
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 gap-x-8 p-4 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex gap-2 ">
                      <User className="w-3 h-3 mt-1 text-blue-600 " />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Nome do Cliente
                        </label>
                        <p> {ticket.clientName}</p>
                      </span>
                    </div>
                    <Separator
                      orientation="horizontal"
                      className="md:col-span-2 bg-border/50"
                    />

                    <div className="flex gap-2 ">
                      <Phone className="w-3 h-3 mt-1 text-blue-600 " />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Telefone
                        </label>
                        <p className="text-sm">{ticket.user?.telefone || "+55 11 99999-9999"}</p>
                      </span>
                    </div>
                    <div className="flex gap-2 ">
                      <Mail className="w-3 h-3 mt-1 text-blue-600 " />

                      <span className="mt-0.5 text-sm font-medium">
                        <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                          Email
                        </label>
                        <p className="text-sm">{ticket.user?.email || "email@exemplo.com"}</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (SIDEBAR) */}
            <div className="overflow-y-auto scrollbar-hidden lg:col-span-1 space-y-4 px-3 py-4 flex flex-col">
              {/* Resumo Box */}
              <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
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
                      <Clock className="w-4 h-4 inline-block mb-0.5 mr-1 text-muted-foreground" />
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
              <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
                <h4 className="flex  gap-2 text-sm font-semibold text-foreground mb-4">
                  <GiHistogram className="w-4 h-4 text-muted-foreground" />
                  Métricas
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between  ">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4 text-yellow-500 " />
                      <span className="">Mensagens</span>
                    </div>
                    <span className="font-semibold text-xs">
                      {ticket.messageCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between  ">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span>Anexos</span>
                    </div>
                    <span className="font-semibold text-xs">
                      {ticket.attachmentCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned To Box */}
              <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="mb-4">
                  <h4 className="flex gap-2 text-sm font-semibold text-foreground mb-1">
                    <User className="w-4 h-4 text-muted-foreground" /> 
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
              <div className=" bg-muted/30 flex items-center justify-between py-4 px-5 border border-border rounded-xl">
                <div>
                  <p className="text-sm font-medium">Status Atual</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.status} desde a abertura
                  </p>
                </div>
                {(() => {
                  const statusIcon = getStatusIconAndColor(ticket.status);
                  return statusIcon ? (
                    <statusIcon.icon className={`w-6 h-6 ${statusIcon.color}`} />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                  );
                })()}
              </div>
              {/* Actions */}
              <div className="pt-2 space-y-3 mt-auto">
                <Button className="w-full bg-foreground text-background " variant="default">
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
