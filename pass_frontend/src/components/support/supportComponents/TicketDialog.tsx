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

  const effectivePriority = ticket.priority || getPriorityFromCategory(ticket.category);
  const categoryIcon = getCategoryIconAndColor(ticket.category);
  const statusIcon = getStatusIconAndColor(ticket.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {categoryIcon.icon && <categoryIcon.icon className="w-5 h-5" />}
            {ticket.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Ticket Number and Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground">
              {ticket.ticketNumber}
            </span>
            <Badge
              variant="outline"
              className={getPriorityStyles(effectivePriority)}
            >
              {effectivePriority}
            </Badge>
            <Badge
              variant="outline"
              className={getStatusStyles(ticket.status)}
            >
              {ticket.status}
            </Badge>
          </div>

          <Separator />

          {/* Client and Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cliente
              </label>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                <span>{ticket.clientName}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Módulo
              </label>
              <p className="mt-1">{ticket.module}</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Categoria
            </label>
            <p className="mt-1">{ticket.category}</p>
          </div>

          {/* Assigned To */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Responsável
            </label>
            <div className="mt-1">
              {ticket.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {ticket.assignedTo.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <span>{ticket.assignedTo.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Não atribuído</span>
              )}
            </div>
          </div>

          {/* Created At */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Data de Abertura
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              <span>
                {ticket.createdAt instanceof Date
                  ? ticket.createdAt.toLocaleString()
                  : new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Response Time */}
          {ticket.responseTime && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tempo de Resposta
              </label>
              <p className="mt-1">{ticket.responseTime}</p>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{ticket.messageCount} mensagens</span>
            </div>
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              <span>{ticket.attachmentCount} anexos</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};