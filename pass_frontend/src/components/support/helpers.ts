import { Priority, Status } from "./types";
import { AlertCircle, CheckCircle2, HelpCircle, UserPlus } from "lucide-react";

// --- Helpers de Estilo ---
export const getPriorityStyles = (p: Priority) => {
  switch (p) {
    case "Alta":
      return "text-red-400 border-red-500/30 bg-red-500/10";
    case "Média":
      return "text-orange-400 border-orange-500/30 bg-orange-500/10";
    case "Baixa":
      return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    default:
      return "text-zinc-400";
  }
};

export const getPriorityBorderColor = (p: Priority) => {
  switch (p) {
    case "Alta":
      return "border-l-red-500";
    case "Média":
      return "border-l-orange-500";
    case "Baixa":
      return "border-l-blue-500";
    default:
      return "border-l-purple-400";
  }
};

export const getCategoryIconAndColor = (category: string) => {
  switch (category) {
    case "Bug":
      return {
        icon: AlertCircle,
        className: "bg-red-500/10 border-red-500/20 text-red-500",
      };
    case "Acesso":
      return {
        icon: UserPlus,
        className: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      };
    case "Dúvida":
      return {
        icon: HelpCircle,
        className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
      };
    case "Visual":
      return {
        icon: CheckCircle2,
        className: "bg-green-500/10 border-green-500/20 text-green-500",
      };
    default:
      return {
        icon: HelpCircle,
        className: "bg-background border-border text-foreground/50",
      };
  }
};

export const getPriorityFromCategory = (category: string): Priority => {
  switch (category) {
    case "Bug":
      return "Alta";
    case "Acesso":
      return "Baixa";
    case "Dúvida":
      return "Média";
    case "Visual":
      return "Baixa";
    default:
      return "Baixa";
  }
};

export const getStatusIconAndColor = (status: Status) => {
  switch (status) {
    case "Resolvido":
      return {
        icon: CheckCircle2,
        className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      };
    case "Fechado":
      return {
        icon: CheckCircle2,
        className: "bg-background border-border text-foreground/50",
      };
    default:
      return null;
  }
};

export const getStatusBorderColor = (status: Status) => {
  switch (status) {
    case "Resolvido":
      return "border-l-emerald-500";
    case "Fechado":
      return "border-l-gray-500";
    default:
      return null;
  }
};

export const getStatusStyles = (s: Status) => {
  switch (s) {
    case "Aberto":
      return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
    case "Em Andamento":
      return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    case "Resolvido":
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    case "Fechado":
      return "text-foreground/50 border-border bg-background line-through decoration-zinc-500";
    default:
      return "";
  }
};