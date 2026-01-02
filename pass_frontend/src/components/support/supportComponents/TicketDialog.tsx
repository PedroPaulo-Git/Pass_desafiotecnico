"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  displayToApiPriority,
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
  Check,
} from "lucide-react";
import { IoMdCopy } from "react-icons/io";
import StatusPriorityPopover from "./StatusPriorityPopover";
import { AssignUserPopover } from "./AssignDeveloperPopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HelpdeskStatus,
  HelpdeskPriority,
  HelpdeskCategory,
  HelpdeskModule,
  HelpdeskEnvironment,
} from "@/features/helpdesk/types/helpdesk";
import { useAuth } from "@/hooks/use-auth";
import { useTicketUpdates } from "./useTicketUpdates";
import { DialogTitle } from "@/components/ui/dialog";
import { TicketMessages } from "./TicketMessages";
import { useTicketMessages } from "@/features/helpdesk/hooks/use-ticket-messages";

interface TicketDialogProps {
  ticket: TicketData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: HelpdeskStatus) => void;
  onUpdatePriority?: (id: string, priority: HelpdeskPriority) => void;
  onUpdateAssignedUser?: (id: string, userId: string) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onUpdateDescription?: (id: string, description: string) => void;
  onUpdateCategory?: (id: string, category: HelpdeskCategory) => void;
  onUpdateModule?: (id: string, module: HelpdeskModule) => void;
  onUpdateEnvironment?: (id: string, environment: HelpdeskEnvironment) => void;
}

export const TicketDialog: React.FC<TicketDialogProps> = ({
  ticket: initialTicket,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignedUser,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateCategory,
  onUpdateModule,
  onUpdateEnvironment,
}) => {
  const { currentUser } = useAuth();

  // Get real message count
  const { messages } = useTicketMessages(initialTicket?.id || "");
  const realMessageCount = messages?.length || 0;

  const {
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
    handleUpdateStatus,
    handleUpdateAssignedUser,
    handleUpdateDescription,
    handleUpdateTitle,
    startEditingTitle,
    cancelEditingTitle,
    saveTitle,
    startEditingDescription,
    cancelEditingDescription,
    saveDescription,
  } = useTicketUpdates({
    initialTicket,
    onUpdateStatus,
    onUpdatePriority,
    onUpdateAssignedUser,
    onUpdateTitle,
    onUpdateDescription,
    onUpdateCategory,
    onUpdateModule,
    onUpdateEnvironment,
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ticket?.ticketNumber || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Bloquear scroll do body quando o dialog estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup: garantir que o scroll seja restaurado quando o componente for desmontado
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!ticket) return null;

  const effectivePriority =
    ticket.priority || getPriorityFromCategory(ticket.category);
  const categoryIcon = getCategoryIconAndColor(ticket.category);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* Custom Overlay with delayed animation */}
      <SheetPrimitive.Portal>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: 0.1, // Aparece logo antes do dialog começar a aparecer
            duration: 0.3,
            ease: "easeOut",
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
        <SheetPrimitive.Content
          asChild
          className="p-0 h-full w-full sm:max-w-3xl overflow-hidden border-border bg-card flex flex-col fixed z-50 inset-y-0 right-0 shadow-lg"
        >
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25, // Aumentado de 20 para 25 (mais suave)
              stiffness: 250, // Diminuído de 300 para 250 (mais lento)
              mass: 0.8, // Aumentado de 0.6 para 0.8 (mais pesado, mais lento)
              opacity: { duration: 0.3 }, // Aumentado de 0.2 para 0.3
            }}
            className="h-full flex flex-col"
          >
            {/* --- CONTENT SCROLL AREA --- */}
            <div className="flex-1 min-h-0 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* LEFT COLUMN (MAIN INFO) */}
                <div className=" lg:col-span-2 flex flex-col h-full py-6 border-r border-border overflow-hidden">
                  {/* --- HEADER --- */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1, // Aumentado de 0.05 para 0.1
                      duration: 0.4, // Aumentado de 0.3 para 0.4
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="flex-1 border-b border-border bg-card shrink-0"
                  >
                    <div className="flex flex-col  md:flex-row md:items-start md:justify-between gap-4 px-4">
                      <div>
                        <div className="text-xl font-semibold flex items-center gap-2">
                          {categoryIcon.icon && (
                            <div
                              className={`mt-1 p-2 rounded-full border ${getPriorityStyles(
                                effectivePriority
                              )}`}
                            >
                              <categoryIcon.icon className={`w-5 h-5`} />
                            </div>
                          )}
                          {isEditingTitle ? (
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onBlur={saveTitle}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveTitle();
                                if (e.key === "Escape") cancelEditingTitle();
                              }}
                              className="text-xl font-semibold bg-transparent border-none outline-none focus:border-b-2 focus:border-primary transition-colors px-1 flex-1"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={startEditingTitle}
                              className={`cursor-pointer hover:text-primary transition-colors flex-1 ${
                                !(
                                  currentUser?.role === "CLIENT" &&
                                  (ticket?.status === "Resolvido" ||
                                    ticket?.status === "Fechado")
                                )
                                  ? "hover:underline"
                                  : ""
                              }`}
                            >
                              {ticket.title}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={copyToClipboard}
                          className="flex items-center flex-nowrap text-xs 2xl:text-xs text-muted-foreground cursor-pointer border-none bg-transparent p-0"
                        >
                          <div className="flex mt-2">
                            <span className="font-medium mr-1">
                              Código do ticket:
                            </span>
                            {ticket.ticketNumber}{" "}
                            {copied ? (
                              <Check className="ml-1 mb-0.5 w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <IoMdCopy className="ml-1 mb-0.5 w-3.5 h-3.5 border-border" />
                            )}
                          </div>
                        </button>

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
                            {ticket.createdAt instanceof Date
                              ? ticket.createdAt.toLocaleDateString("pt-BR")
                              : new Date(ticket.createdAt).toLocaleDateString(
                                  "pt-BR"
                                )}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={onClose}
                        className="p-2 hidden md:flex"
                      >
                        <XIcon className="w-5 h-5" />
                      </Button>
                    </div>

                    <Tabs
                      className=" flex-1 flex flex-col min-h-0 w-full pb-32 h-screen  "
                      defaultValue="info"
                    >
                      <TabsList className="mt-6 flex border-t px-4 w-full bg-transparent rounded-none first:pl-10 border-b overflow-x-auto scrollbar-hidden">
                        <TabsTrigger
                          supportTab={true}
                          value="info"
                          className="text-sm font-medium px-3 py-1.5"
                        >
                          <User className="w-4 h-4 mb-0.5 mr-1 text-inherit" />
                          Informações
                        </TabsTrigger>
                        <TabsTrigger
                          supportTab={true}
                          value="mensagens"
                          className="text-sm font-medium px-3 py-1.5"
                        >
                          <MessageSquare className="w-4 h-4 mb-0.5 mr-1 text-inherit" />
                          Mensagens ({realMessageCount})
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

                      {/* LEFT CONTENT AREA */}
                      <div
                        className="flex-1 min-h-0 flex flex-col 
                      overflow-auto  h-full  "
                      >
                        <TabsContent
                          value="info"
                          className="px-4  overflow-y-auto scrollbar-hidden space-y-4 py-4 "
                        >
                          {/* Card 1: Dados do Ticket */}
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.1,
                              duration: 0.4,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="bg-muted/30 border border-border rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-violet-600" />
                                <h3 className="text-sm font-semibold text-foreground">
                                  Dados do Ticket
                                </h3>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400"
                              >
                                Detalhes Técnicos
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 gap-x-8 p-4 bg-muted/20 rounded-lg border border-border/30">
                              <div className="flex gap-2">
                                <Tag className="w-3 h-3 mt-1 text-violet-600" />
                                <span className="mt-0.5 text-sm font-medium flex-1">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Categoria
                                  </label>
                                  <Select
                                    value={ticket?.categoryApi || ""}
                                    onValueChange={(value) =>
                                      handleUpdateCategory(
                                        ticket!.id,
                                        value as any
                                      )
                                    }
                                    disabled={
                                      !currentUser ||
                                      (currentUser?.role === "CLIENT" &&
                                        (ticket?.status === "Resolvido" ||
                                          ticket?.status === "Fechado"))
                                    }
                                  >
                                    <SelectTrigger className="w-full h-6 text-sm border-none bg-transparent p-0 focus:ring-0">
                                      <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                      <SelectItem
                                        className="bg-popover"
                                        value="BUG"
                                      >
                                        Bug
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="AGENDAMENTO"
                                      >
                                        Agendamento
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="TREINAMENTO"
                                      >
                                        Treinamento
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="PERFORMANCE"
                                      >
                                        Performance
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="AJUSTE_MELHORIA"
                                      >
                                        Ajuste/Melhoria
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="OUTRO"
                                      >
                                        Outro
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Package className="w-3 h-3 mt-1 text-violet-600" />
                                <span className="mt-0.5 text-sm font-medium flex-1">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Módulo
                                  </label>
                                  <Select
                                    value={ticket?.moduleApi || ""}
                                    onValueChange={(value) =>
                                      handleUpdateModule(
                                        ticket!.id,
                                        value as any
                                      )
                                    }
                                    disabled={
                                      !currentUser ||
                                      (currentUser?.role === "CLIENT" &&
                                        (ticket?.status === "Resolvido" ||
                                          ticket?.status === "Fechado"))
                                    }
                                  >
                                    <SelectTrigger className="w-full h-6 text-sm border-none bg-transparent p-0 focus:ring-0">
                                      <SelectValue placeholder="Selecione um módulo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                      <SelectItem
                                        className="bg-popover"
                                        value="AGENDAMENTO"
                                      >
                                        Agendamento
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="TREINAMENTOS"
                                      >
                                        Treinamentos
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="FINANCEIRO"
                                      >
                                        Financeiro
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="USUARIOS"
                                      >
                                        Usuários
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Play className="w-3 h-3 mt-1 text-violet-600" />
                                <span className="mt-0.5 text-sm font-medium flex-1">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Ambiente
                                  </label>
                                  <Select
                                    value={ticket?.environment || ""}
                                    onValueChange={(value) =>
                                      handleUpdateEnvironment(
                                        ticket!.id,
                                        value as any
                                      )
                                    }
                                    disabled={
                                      !currentUser ||
                                      (currentUser?.role === "CLIENT" &&
                                        (ticket?.status === "Resolvido" ||
                                          ticket?.status === "Fechado"))
                                    }
                                  >
                                    <SelectTrigger className="w-full h-6 text-sm border-none bg-transparent p-0 focus:ring-0">
                                      <SelectValue placeholder="Selecione um ambiente" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover">
                                      <SelectItem
                                        className="bg-popover"
                                        value="WEB"
                                      >
                                        Web
                                      </SelectItem>
                                      <SelectItem
                                        className="bg-popover"
                                        value="MOBILE"
                                      >
                                        Mobile
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </span>
                              </div>
                              <Separator
                                orientation="horizontal"
                                className="md:col-span-2 bg-border/50"
                              />

                              <div className="md:col-span-2 flex gap-2">
                                <FileText className="w-3 h-3 mt-1 text-violet-600" />
                                <span className="mt-0.5 text-sm font-medium flex-1">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Descrição / Assunto
                                  </label>
                                  {isEditingDescription ? (
                                    <textarea
                                      value={editedDescription}
                                      onChange={(e) =>
                                        setEditedDescription(e.target.value)
                                      }
                                      onBlur={saveDescription}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          saveDescription();
                                        }
                                        if (e.key === "Escape")
                                          cancelEditingDescription();
                                      }}
                                      className="w-full text-foreground/90 leading-relaxed bg-transparent border-none outline-none focus:ring-1 focus:ring-border/80 transition-all rounded px-1 resize-none"
                                      rows={3}
                                      autoFocus
                                    />
                                  ) : (
                                    <p
                                      onClick={startEditingDescription}
                                      className={`text-foreground/90 leading-relaxed cursor-pointer hover:text-primary transition-colors ${
                                        !(
                                          currentUser?.role === "CLIENT" &&
                                          (ticket?.status === "Resolvido" ||
                                            ticket?.status === "Fechado")
                                        )
                                          ? "hover:underline"
                                          : ""
                                      }`}
                                    >
                                      {ticket.description || "Sem descrição"}
                                    </p>
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>

                          {/* Card 2: Dados do Cliente */}
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.2,
                              duration: 0.4,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-semibold text-foreground">
                                  Dados do Cliente
                                </h3>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                              >
                                Informações do Cliente
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 gap-x-8 p-4 bg-muted/20 rounded-lg border border-border/30">
                              <div className="flex gap-2">
                                <User className="w-3 h-3 mt-1 text-blue-600" />
                                <span className="mt-0.5 text-sm font-medium">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Nome do Cliente
                                  </label>
                                  <p>{ticket.clientName}</p>
                                </span>
                              </div>
                              <Separator
                                orientation="horizontal"
                                className="md:col-span-2 bg-border/50"
                              />

                              <div className="flex gap-2">
                                <Phone className="w-3 h-3 mt-1 text-blue-600" />
                                <span className="mt-0.5 text-sm font-medium">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Telefone
                                  </label>
                                  <p className="text-sm">
                                    {ticket.user?.telefone ||
                                      "+55 11 99999-9999"}
                                  </p>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Mail className="w-3 h-3 mt-1 text-blue-600" />
                                <span className="mt-0.5 text-sm font-medium">
                                  <label className="text-xs font-medium text-muted-foreground tracking-wider flex items-center gap-1">
                                    Email
                                  </label>
                                  <p className="text-sm">
                                    {ticket.user?.email || "email@exemplo.com"}
                                  </p>
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </TabsContent>

                        <TabsContent
                          value="mensagens"
                          className="px-4 flex-1 flex flex-col min-h-0 overflow-auto"
                        >
                          <TicketMessages
                            ticketId={ticket.id}
                            ticketStatus={ticket.status}
                          />
                        </TabsContent>

                        <TabsContent value="historico" className="px-4 mt-4">
                          <div className="text-center py-10 text-muted-foreground italic">
                            Em breve: Histórico de alterações do ticket.
                          </div>
                        </TabsContent>

                        <TabsContent value="anexos" className="px-4 mt-4">
                          <div className="text-center py-10 text-muted-foreground italic">
                            Em breve: Gerenciamento de arquivos e anexos.
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </motion.div>
                </div>

                {/* RIGHT COLUMN (SIDEBAR) */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="overflow-y-auto scrollbar-hidden lg:col-span-1 space-y-4 px-3 py-4 flex flex-col"
                >
                  {/* Resumo Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2, // Aumentado de 0.1 para 0.2
                      duration: 0.4, // Aumentado de 0.3 para 0.4
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    whileHover={{
                      transition: { duration: 0.2 },
                    }}
                    className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Resumo da Solicitação
                    </h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Prioridade
                        </span>
                        <div className="flex items-center gap-2">
                          <Select
                            value={
                              ticket?.priorityApi ||
                              (ticket?.priority
                                ? displayToApiPriority[ticket.priority]
                                : "")
                            }
                            onValueChange={(value) =>
                              handleUpdatePriority(ticket!.id, value as any)
                            }
                            disabled={
                              !currentUser ||
                              (currentUser?.role === "CLIENT" &&
                                (ticket?.status === "Resolvido" ||
                                  ticket?.status === "Fechado"))
                            }
                          >
                            <SelectTrigger
                              iconRight={true}
                              className="w-4 h-6 px-0! -mr-2! border-none bg-transparent p-0! focus:ring-0 shadow-none hover:bg-transparent [&_svg]:transition-transform [&_svg]:duration-200 data-[state=open]:[&_svg]:rotate-180"
                            >
                              {/* <SelectValue /> */}
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              <SelectItem className="bg-popover" value="BAIXA">
                                Baixa
                              </SelectItem>
                              <SelectItem className="bg-popover" value="MEDIA">
                                Média
                              </SelectItem>
                              <SelectItem className="bg-popover" value="ALTA">
                                Alta
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge
                            variant="outline"
                            className={`${getPriorityStyles(
                              ticket?.priority || effectivePriority
                            )} text-xs`}
                          >
                            {ticket?.priority || effectivePriority}
                          </Badge>
                        </div>
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
                  </motion.div>

                  {/* Metrics Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3, // Aumentado de 0.2 para 0.3
                      duration: 0.4, // Aumentado de 0.3 para 0.4
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    whileHover={{
                      transition: { duration: 0.2 },
                    }}
                    className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h4 className="flex gap-2 text-sm font-semibold text-foreground mb-4">
                      <GiHistogram className="w-4 h-4 text-muted-foreground" />
                      Métricas
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4 text-yellow-500" />
                          <span className="">Mensagens</span>
                        </div>
                        <span className="font-semibold text-xs">
                          {realMessageCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span>Anexos</span>
                        </div>
                        <span className="font-semibold text-xs">
                          {ticket.attachmentCount}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Assigned To Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5, // Reduzido de 0.7 para 0.5
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    whileHover={{
                      transition: { duration: 0.2 },
                    }}
                    className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
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
                    ) : currentUser?.role === "ADMIN" ||
                      currentUser?.role === "DEVELOPER" ? (
                      <AssignUserPopover
                        data={ticket}
                        onAssign={(user) =>
                          handleUpdateAssignedUser(ticket.id, user)
                        }
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-0 text-muted-foreground hover:text-purple-400 hover:bg-transparent text-xs justify-start gap-1"
                        >
                          <User className="w-3 h-3" /> Atribuir
                        </Button>
                      </AssignUserPopover>
                    ) : (
                      <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <User className="w-4 h-4" /> Não atribuído
                      </div>
                    )}
                  </motion.div>

                  {/* Status Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4, // Reduzido de 0.6 para 0.4
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    whileHover={{
                      transition: { duration: 0.2 },
                    }}
                    className="bg-muted/30 flex items-center justify-between py-4 px-5 border border-border rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="text-sm font-medium">Status Atual</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.status} desde a abertura
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const statusIcon = getStatusIconAndColor(ticket.status);
                        return statusIcon ? (
                          <statusIcon.icon
                            className={`w-6 h-6 ${statusIcon.color}`}
                          />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                        );
                      })()}

                      {!(
                        currentUser?.role === "CLIENT" &&
                        (ticket?.status === "Resolvido" ||
                          ticket?.status === "Fechado")
                      ) && (
                        <StatusPriorityPopover
                          data={ticket}
                          onStatusChange={(status) =>
                            handleUpdateStatus(ticket.id, status)
                          }
                          onPriorityChange={(priority) =>
                            handleUpdatePriority(ticket.id, priority)
                          }
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.8, // Reduzido de 1.6 para 0.8
                      duration: 0.4, // Reduzido de 0.5 para 0.4
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="pt-2 space-y-3 mt-auto"
                  >
                    <Button
                      className="w-full bg-foreground text-background"
                      variant="default"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Relatório
                    </Button>
                    <Button className="w-full" variant="secondary">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </Sheet>
  );
};
