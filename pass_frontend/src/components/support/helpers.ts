import { Priority, Status } from "./types";
import { AlertCircle, CheckCircle2, HelpCircle, UserPlus, Play, XCircle, Eye, UserCheck, FileText, Search, Clock, User, CircleCheckBig, Calendar, Zap, MoreHorizontal, Settings } from "lucide-react";
import { IoTimerOutline } from "react-icons/io5";


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

export const getPriorityColor = (p: Priority): any => {
  switch (p) {
    case "Alta": return "red";
    case "Média": return "amber";
    case "Baixa": return "blue";
    default: return "gray";
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
    case "Agendamento":
      return {
        icon: Calendar,
        className: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      };
    case "Treinamento":
      return {
        icon: Play,
        className: "bg-purple-500/10 border-purple-500/20 text-purple-500",
      };
    case "Performance":
      return {
        icon: Zap,
        className: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      };
    case "Ajuste/Melhoria":
      return {
        icon: CircleCheckBig,
        className: "bg-green-500/10 border-green-500/20 text-green-500",
      };
    case "Outro":
      return {
        icon: MoreHorizontal,
        className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
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
    case "Performance":
      return "Alta";
    case "Agendamento":
      return "Média";
    case "Treinamento":
      return "Baixa";
    case "Ajuste/Melhoria":
      return "Baixa";
    case "Outro":
      return "Baixa";
    default:
      return "Baixa";
  }
};

export const getStatusIconAndColor = (status: Status) => {
  switch (status) {
    case "Aberto":
      return {
        icon: AlertCircle,
        color: "text-amber-500",
      };
    case "Em Análise":
      return {
        icon: Search,
        color: "text-blue-500",
      };
    case "Em Andamento":
      return {
        icon: IoTimerOutline,
        color: "text-purple-400",
      };
    case "Aguardando Usuário":
      return {
        icon: User,
        color: "text-rose-500",
      };
    case "Resolvido":
      return {
        icon: CircleCheckBig,
        color: "text-emerald-400",
      };
    case "Fechado":
      return {
        icon: XCircle,
        color: "text-foreground/50",
      };
    default:
      return null;
  }
};

export const getStatusContainerClass = (status: Status) => {
  switch (status) {
    case "Aberto":
      return "bg-amber-500/10 border-amber-500/20 text-amber-500";
    case "Em Análise":
      return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    case "Em Andamento":
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    case "Aguardando Usuário":
      return "bg-rose-500/10 border-rose-500/20 text-rose-500";
    case "Resolvido":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "Fechado":
      return "bg-background border-border text-foreground/50";
    default:
      return "bg-background border-border text-foreground/50";
  }
};

export const getStatusBorderColor = (status: Status) => {
  switch (status) {
    case "Aberto":
      return "border-l-amber-500";
    case "Em Análise":
      return "border-l-blue-500";
    case "Em Andamento":
      return "border-l-purple-500";
    case "Aguardando Usuário":
      return "border-l-rose-500";
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
      return "text-amber-500 border-amber-500 bg-amber-500/10";
    case "Em Análise":
      return "text-blue-500 border-blue-500 bg-blue-500/10";
    case "Em Andamento":
      return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    case "Aguardando Usuário":
      return "text-rose-500 border-rose-500 bg-rose-500/10";
    case "Resolvido":
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    case "Fechado":
      return "text-foreground/50 border-border bg-background line-through decoration-zinc-500";
    default:
      return "";
  }
};

export const getStatusColor = (s: Status): any => {
  switch (s) {
    case "Aberto": return "amber";
    case "Em Análise": return "blue";
    case "Em Andamento": return "purple";
    case "Aguardando Usuário": return "rose";
    case "Resolvido": return "emerald";
    case "Fechado": return "gray";
    default: return "gray";
  }
};

export const displayToApiStatus: Record<string, string> = {
  Aberto: "ABERTO",
  "Em Análise": "EM_ANALISE",
  "Em Andamento": "EM_ANDAMENTO",
  "Aguardando Usuário": "AGUARDANDO_USUARIO",
  Resolvido: "RESOLVIDO",
  Fechado: "ENCERRADO",
};

export const displayToApiPriority: Record<string, string> = {
  Baixa: "BAIXA",
  Média: "MEDIA",
  Alta: "ALTA",
};