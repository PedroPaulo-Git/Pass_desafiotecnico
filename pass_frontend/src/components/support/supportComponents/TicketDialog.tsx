"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Sheet } from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketData } from "../types";
import {
  getPriorityStyles,
  getStatusStyles,
  getCategoryIconAndColor,
  getPriorityFromCategory,
  getStatusIconAndColor,
  getStatusColor,
  getPriorityColor,
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
  Check,
  Copy,
  PanelLeft,
  PanelRight,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
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
import { TicketMessages } from "./TicketMessages";
import { useTicketMessages } from "@/features/helpdesk/hooks/use-ticket-messages";
import { TicketHistory } from "./TicketHistory";
import { TicketAttachments } from "./TicketAttachments";
import { UserInfoPopover } from "./UserInfoPopover";

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
          onInteractOutside={(e) => {
            // Se existir um popover/select aberto (identificado pelo wrapper do popper), previne o fechamento do Sheet
            // Isso permite que o clique feche apenas o popover primeiro.
            const hasOpenPopover = document.querySelector(
              "[data-radix-popper-content-wrapper]"
            );
            if (hasOpenPopover) {
              e.preventDefault();
            }
          }}
          className="p-0 h-full w-full sm:max-w-3xl overflow-hidden border-border bg-card flex flex-col fixed z-50 inset-y-0 right-0 shadow-lg"
        >
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 250,
              mass: 0.8,
              opacity: { duration: 0.3 },
            }}
            className="h-full flex flex-col bg-background"
          >
            {/* Structure: 
               Root relative container
               > Sidebar (Absolute, z-50, covers header)
               > Flex Column
                 > Header (Behind sidebar)
                 > TabsContent (Pushed by sidebar)
           */}
            <div className="h-full flex flex-col bg-background relative overflow-hidden">
              <Tabs
                className="w-full h-full flex flex-col gap-0"
                defaultValue="info"
              >
                {/* --- SIDEBAR (Absolute, Full Height, Covers Header) --- */}
                <div
                  className={`absolute top-0 right-0 h-full z-50 bg-card border-l border-border transition-all duration-300 ease-in-out shadow-lg flex flex-col ${
                    isSidebarOpen ? "w-[300px]" : "w-[60px]"
                  }`}
                >
                  {/* Sidebar Header (Toggle) */}
                </div>

                {/* --- HEADER SECTION (Behind Sidebar) --- */}
                <div className="flex-shrink-0 border-b border-border bg-card z-20 relative">
                  <div
                    className={`flex flex-col md:flex-row md:items-start
                   md:justify-between gap-4 px-4 py-4 transition-all duration-300 ease-in-out ${
                     isSidebarOpen ? "mr-[300px]" : "mr-[64px]"
                   }`}
                  >
                    {/* Toggle Sidebar Button + Title Group */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Placeholder for spacing if needed, but flex-1 handles it */}

                      <div className="flex-1">
                        <div className="text-xl font-semibold flex items-center gap-2">
                          {/* Category Icon */}
                          {categoryIcon.icon && (
                            <div
                              className={`mt-1 p-2 rounded-full border ${getPriorityStyles(
                                effectivePriority
                              )}`}
                            >
                              <categoryIcon.icon className={`w-5 h-5`} />
                            </div>
                          )}

                          {/* Editable Title */}
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
                              className="text-xl font-semibold bg-transparent border-none outline-none focus:border-b-2 focus:border-primary transition-colors px-1 flex-1 min-w-0"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={startEditingTitle}
                              className={`cursor-pointer hover:text-primary transition-colors flex-1 min-w-0 truncate ${
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
                              <Copy className="ml-1 mb-0.5 w-3.5 h-3.5 border-border" />
                                  )}
                          </div>
                        </button>

                        <div className="flex items-center gap-3 mt-3">
                            {ticket.status && (
                            <Badge
                              variant="subtle"
                              color={getStatusColor(ticket.status)}
                            >
                              {(() => {
                                const statusInfo = getStatusIconAndColor(
                                  ticket.status
                                );
                                const StatusIcon = statusInfo?.icon;
                                return StatusIcon ? (
                                  <StatusIcon className="w-3 h-3" />
                                ) : null;
                              })()}
                              {ticket.status}
                            </Badge>
                          )}

                          {effectivePriority && (
                            <Badge
                              variant="subtle"
                              color={getPriorityColor(effectivePriority)}
                            >
                              {effectivePriority}
                            </Badge>
                          )}
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
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center">
                      <Button variant="ghost" onClick={onClose} className="p-2">
                        <XIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* TABS LIST */}
                  <div className="px-4">
                    <TabsList className="w-full bg-transparent justify-start h-auto p-0 rounded-none overflow-x-auto scrollbar-hidden">
                      <TabsTrigger
                        supportTab={true}
                        value="info"
                        className="text-sm font-medium px-4 py-3 data-[state=active]:border-b-2 rounded-none"
                      >
                        <User className="w-4 h-4 mr-2" /> Informações
                      </TabsTrigger>
                      <TabsTrigger
                        supportTab={true}
                        value="mensagens"
                        className="text-sm font-medium px-4 py-3 data-[state=active]:border-b-2 rounded-none"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> Mensagens{" "}
                        <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {realMessageCount}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        supportTab={true}
                        value="historico"
                        className="text-sm font-medium px-4 py-3 data-[state=active]:border-b-2 rounded-none"
                      >
                        <TbHistoryToggle className="w-4 h-4 mr-2" /> Histórico
                      </TabsTrigger>
                      <TabsTrigger
                        supportTab={true}
                        value="anexos"
                        className="text-sm font-medium px-4 py-3 data-[state=active]:border-b-2 rounded-none"
                      >
                        <Paperclip className="w-4 h-4 mr-2" /> Anexos
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* --- SIDEBAR (Absolute, Full Height, Covers Header) --- */}
                <div
                  className={`absolute top-0 right-0 h-full z-50 bg-card border-l border-border transition-all duration-300 ease-in-out shadow-lg flex flex-col ${
                    isSidebarOpen ? "w-[300px]" : "w-[64px]"
                  }`}
                >
                  {/* Sidebar Header (Toggle) */}
                  <div
                    className={`flex items-center ${
                      isSidebarOpen ? "justify-between px-4" : "justify-center"
                    } py-4 border-b border-border/50 min-h-[60px]`}
                  >
                    {isSidebarOpen && (
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        Detalhes doResumo
                      </h4>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(!isSidebarOpen)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <PanelRight
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isSidebarOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Sidebar Content Scrollable */}
                  <div className="flex-1 overflow-y-auto scrollbar-hidden  space-y-4">
                    {isSidebarOpen ? (
                      /* --- EXPANDED VIEW --- */
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 p-2">
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
                              <div className="flex items-center gap-2">
                                <StatusPriorityPopover
                                  data={ticket}
                                  onStatusChange={(status) =>
                                    handleUpdateStatus(ticket.id, status)
                                  }
                                  onPriorityChange={(priority) =>
                                    handleUpdatePriority(ticket.id, priority)
                                  }
                                >
                                  {/* <Badge
                                    variant="outline"
                                    className={`${getPriorityStyles(
                                      ticket?.priority || effectivePriority
                                    )} text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer`}
                                  >
                                    {ticket?.priority || effectivePriority}
                                  </Badge> */}
                                   {effectivePriority && (
                            <Badge
                              variant="subtle"
                              color={getPriorityColor(effectivePriority)}
                            >
                              {effectivePriority}
                            </Badge>
                          )}
                                </StatusPriorityPopover>
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
                                  : new Date(
                                      ticket.createdAt
                                    ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Box */}
                        <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
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
                        </div>

                        {/* Responsável Box */}
                        <div className="bg-muted/30 border border-border rounded-xl p-5 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              Responsável
                            </h4>
                            <AssignUserPopover
                              data={ticket}
                              onAssign={(user) =>
                                handleUpdateAssignedUser(ticket.id, user)
                              }
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </AssignUserPopover>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10  shadow-sm">
                              <AvatarFallback className="text-primary">
                                {ticket.assignedTo?.name
                                  ? ticket.assignedTo.name
                                      .substring(0, 2)
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {ticket.assignedTo?.name || "Não atribuído"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Suporte Técnico
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Box */}
                        <div className="bg-muted/30 flex items-center justify-between py-4 px-5 border border-border rounded-xl shadow-sm mt-auto">
                          <div>
                            <p className="text-sm font-medium">Status Atual</p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.status} desde a abertura
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!(
                              currentUser?.role === "CLIENT" &&
                              (ticket?.status === "Resolvido" ||
                                ticket?.status === "Fechado")
                            ) ? (
                              <StatusPriorityPopover
                                data={ticket}
                                onStatusChange={(status) =>
                                  handleUpdateStatus(ticket.id, status)
                                }
                                onPriorityChange={(priority) =>
                                  handleUpdatePriority(ticket.id, priority)
                                }
                              >
                                {(() => {
                                  const statusIcon = getStatusIconAndColor(
                                    ticket.status
                                  );
                                  return statusIcon ? (
                                    <statusIcon.icon
                                      className={`w-6 h-6 ${statusIcon.color} transition-transform hover:scale-110 active:scale-90`}
                                    />
                                  ) : (
                                    <CheckCircle2 className="w-8 h-8 text-muted-foreground transition-transform hover:scale-110 active:scale-90" />
                                  );
                                })()}
                              </StatusPriorityPopover>
                            ) : (
                              (() => {
                                const statusIcon = getStatusIconAndColor(
                                  ticket.status
                                );
                                return statusIcon ? (
                                  <statusIcon.icon
                                    className={`w-8 h-8 ${statusIcon.color}`}
                                  />
                                ) : (
                                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                                );
                              })()
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 space-y-3">
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
                        </div>
                      </div>
                    ) : (
                      /* --- COLLAPSED VIEW (Icons Only) --- */
                      <TooltipProvider delayDuration={0}>
                        <div className="flex flex-col items-center space-y-2 animate-in fade-in duration-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full flex justify-center">
                                <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-yellow-600 relative">
                                  <MessageSquare className="h-4 w-4" />
                                  {realMessageCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-yellow-500 text-[8px] font-bold text-white">
                                      {realMessageCount}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {realMessageCount} Mensagens
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full flex justify-center">
                                <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground relative">
                                  <Paperclip className="h-4 w-4" />
                                  {ticket.attachmentCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                                      {ticket.attachmentCount}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {ticket.attachmentCount} Anexos
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full flex justify-center">
                                <AssignUserPopover
                                  data={ticket}
                                  onAssign={(user) =>
                                    handleUpdateAssignedUser(ticket.id, user)
                                  }
                                >
                                  <button className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted">
                                    <Avatar className="h-6 w-6 border border-background shadow-xs">
                                      <AvatarFallback className="text-primary text-[10px] font-bold">
                                        {ticket.assignedTo?.name
                                          ? ticket.assignedTo.name
                                              .substring(0, 2)
                                              .toUpperCase()
                                          : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </button>
                                </AssignUserPopover>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              Responsável:{" "}
                              {ticket.assignedTo?.name || "Não atribuído"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full flex justify-center">
                                <StatusPriorityPopover
                                  data={ticket}
                                  onStatusChange={(status) =>
                                    handleUpdateStatus(ticket.id, status)
                                  }
                                  onPriorityChange={(priority) =>
                                    handleUpdatePriority(ticket.id, priority)
                                  }
                                >
                                  <button className="flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-muted active:scale-90">
                                    {(() => {
                                      const statusIcon = getStatusIconAndColor(
                                        ticket.status
                                      );
                                      return statusIcon ? (
                                        <statusIcon.icon
                                          className={`h-4 w-4 ${statusIcon.color}`}
                                        />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                      );
                                    })()}
                                  </button>
                                </StatusPriorityPopover>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              Status: {ticket.status}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* --- WRAPPER FOR HEADER & CONTENT (Pushed by Sidebar) --- */}
                <div
                  className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "mr-[300px]" : "mr-[64px]"
                  }`}
                >
                  {/* --- HEADER SECTION --- */}

                  {/* --- MAIN CONTENT AREA --- */}
                  <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-card scrollbar-hidden">
                    <TabsContent value="info" className="space-y-6 mt-0">
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
                                  handleUpdateCategory(ticket.id, value as any)
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
                                <SelectContent showSearch={true} className="bg-popover">
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
                                  handleUpdateModule(ticket.id, value as any)
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
                                <SelectContent  showSearch={true}className="bg-popover">
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
                                    ticket.id,
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
                                <SelectContent showSearch={true} className="bg-popover">
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
                                {ticket.user?.telefone || "+55 11 99999-9999"}
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

                    <TabsContent value="mensagens" className="h-full mt-0">
                      <TicketMessages
                        ticketId={ticket.id}
                        ticketStatus={ticket.status}
                        assignedTo={ticket.assignedTo}
                      />
                    </TabsContent>
                    <TabsContent value="historico" className="mt-0">
                      <TicketHistory ticket={ticket} />
                    </TabsContent>
                    <TabsContent value="anexos" className="mt-0">
                      <TicketAttachments ticketId={ticket.id} />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </Sheet>
  );
};
