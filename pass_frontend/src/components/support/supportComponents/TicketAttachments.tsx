"use client";

import React, { useRef } from "react";
import { useTicketAttachments } from "@/features/helpdesk/hooks/use-ticket-attachments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Plus,
  Loader2,
  AlertCircle,
  FileIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TicketAttachmentsProps {
  ticketId: string;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
    return { icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
  if (["mp4", "avi", "mov", "wmv", "webm"].includes(ext || "")) {
    return { icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" };
  }
  if (["mp3", "wav", "ogg", "flac"].includes(ext || "")) {
    return { icon: Music, color: "text-pink-500", bg: "bg-pink-500/10" };
  }
  if (["pdf", "doc", "docx", "txt", "csv", "xlsx"].includes(ext || "")) {
    return { icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
  }
  return { icon: File, color: "text-gray-500", bg: "bg-gray-500/10" };
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const TicketAttachments: React.FC<TicketAttachmentsProps> = ({
  ticketId,
}) => {
  const {
    attachments,
    isLoading,
    isUploading,
    uploadAttachment,
    downloadAttachment,
  } = useTicketAttachments(ticketId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        await uploadAttachment(file);
      } catch (error) {
        // Error handled by hook
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          Documentos e Mídias
        </h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs border-dashed hover:border-primary hover:text-primary transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Anexar arquivo
        </Button>
      </div>

      {attachments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20"
        >
          <div className="p-3 rounded-full bg-muted mb-3">
            <Paperclip className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum anexo encontrado
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Clique no botão acima para enviar arquivos
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {attachments.map((file, index) => {
            const fileInfo = getFileIcon(file.filename);
            return (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:shadow-md hover:border-primary/50 transition-all cursor-default"
              >
                <div
                  className={`p-2.5 rounded-lg ${fileInfo.bg} ${fileInfo.color}`}
                >
                  <fileInfo.icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate pr-2 group-hover:text-primary transition-colors">
                    {file.filename}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>
                      {format(new Date(file.uploadedAt), "dd 'de' MMM, HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => downloadAttachment(file.filename)}
                >
                  <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
              Dica de Segurança
            </p>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/70 leading-relaxed">
              Evite enviar arquivos executáveis (.exe, .bat). O sistema aceita
              imagens, PDFs, vídeos e documentos de texto até 50MB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
