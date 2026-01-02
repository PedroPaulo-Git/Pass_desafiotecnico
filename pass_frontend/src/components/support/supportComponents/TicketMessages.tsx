"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTicketMessages } from "@/features/helpdesk/hooks/use-ticket-messages";
import { useTicketAttachments } from "@/features/helpdesk/hooks/use-ticket-attachments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  User,
  ShieldCheck,
  Clock,
  Paperclip,
  Lock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Download,
  Trash2,
  X,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TicketMessagesProps {
  ticketId: string;
  ticketStatus?: string;
  assignedTo?: any | null;
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
  if (["pdf", "doc", "docx", "txt"].includes(ext || "")) {
    return { icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
  }
  return { icon: File, color: "text-gray-500", bg: "bg-gray-500/10" };
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const isImage = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
};

const ImagePreview: React.FC<{
  ticketId: string;
  filename: string;
  getAttachmentBlob: (filename: string) => Promise<Blob>;
}> = ({ ticketId, filename, getAttachmentBlob }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchImage = async () => {
      try {
        const blob = await getAttachmentBlob(filename);
        if (blob && mounted) {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Error loading image preview:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      mounted = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [filename, ticketId]);

  if (isLoading) {
    return <Skeleton className="w-full aspect-video rounded-lg" />;
  }

  if (!imageUrl) {
    return (
      <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center border border-dashed text-muted-foreground text-xs">
        Erro ao carregar imagem
      </div>
    );
  }

  return (
    <div className="relative group/img rounded-lg overflow-hidden border border-border/50 bg-background/50 w-full max-w-[320px]">
      <img
        src={imageUrl}
        alt={filename}
        className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in"
        onClick={() => window.open(imageUrl, "_blank")}
      />
    </div>
  );
};

export const TicketMessages: React.FC<TicketMessagesProps> = ({
  ticketId,
  ticketStatus,
  assignedTo,
}) => {
  const { currentUser } = useAuth();
  const { messages, isLoading, isSending, sendMessage, deleteMessage } =
    useTicketMessages(ticketId);
  const {
    uploadAttachment,
    downloadAttachment,
    getAttachmentBlob,
    isUploading,
  } = useTicketAttachments(ticketId);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTicketClosed =
    ticketStatus === "Resolvido" || ticketStatus === "Fechado";
  const isUnassigned = !assignedTo && !isTicketClosed;

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSending || isTicketClosed || isUnassigned) return;

    try {
      // Upload attachments first
      const attachmentPaths: string[] = [];
      for (const file of selectedFiles) {
        const result = await uploadAttachment(file);
        attachmentPaths.push(result.path);
      }

      // Send message with attachments
      await sendMessage({
        authorId: currentUser.id,
        authorType: currentUser.role === "CLIENT" ? "user" : "support",
        message: newMessage.trim() || "(Anexo)",
        attachments: attachmentPaths,
      });

      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleDeleteMessage = async (messageIndex: number) => {
    try {
      await deleteMessage(messageIndex);
      toast.success("Mensagem apagada com sucesso!");
    } catch (error) {
      toast.error("Erro ao apagar mensagem");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 h-[400px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50 rounded-lg border border-border overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-60">
            {isTicketClosed ? (
              <>
                <div className="relative">
                  <CheckCircle2 className="w-12 h-12 text-green-500/60" />
                  <Lock className="w-5 h-5 absolute -bottom-1 -right-1 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold">
                    Chamado {ticketStatus}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Não é mais possível enviar mensagens
                  </p>
                </div>
              </>
            ) : isUnassigned ? (
              <>
                <div className="relative">
                  <UserPlus className="w-12 h-12 text-yellow-500/60" />
                  <Clock className="w-5 h-5 absolute -bottom-1 -right-1 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold">
                    Aguardando Responsável
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Atribua um responsável para iniciar o atendimento
                  </p>
                </div>
              </>
            ) : (
              <>
                <Clock className="w-8 h-8" />
                <p className="text-sm">Nenhuma mensagem ainda.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = msg.AuthorId === currentUser?.id;
              const isSupport = msg.AuthorType === "support";
              const date = new Date(msg.CreatedAt);
              const hasAttachments =
                msg.Attachments && msg.Attachments.length > 0;

              return (
                <div
                  key={idx}
                  className={`flex gap-3 group ${
                    isMe ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0 border border-border">
                    <AvatarFallback
                      className={
                        isSupport
                          ? "bg-purple-900/20 text-purple-400"
                          : "bg-blue-900/20 text-blue-400"
                      }
                    >
                      {isSupport ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col max-w-[75%] ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {isSupport ? "Suporte" : "Cliente"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(date, "HH:mm", { locale: ptBR })}
                      </span>
                      {(isMe ||
                        currentUser?.role === "ADMIN" ||
                        currentUser?.role === "DEVELOPER") && (
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                              title="Apagar mensagem"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-52 p-3! bg-background/95 backdrop-blur-sm border shadow-xl z-[100]"
                            align="end"
                            sideOffset={8}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-bold tracking-tight">
                                  Apagar Mensagem?
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-snug">
                                Isso removerá a mensagem permanentemente para
                                todos.
                              </p>
                              <Button
                                size="sm"
                                className="w-full h-8 text-xs font-semibold py-0 shadow-md bg-destructive/80 hover:bg-destructive/40 hover:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(idx);
                                }}
                              >
                                Confirmar Exclusão
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>

                    <div
                      className={`
                      p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words w-full
                      ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none border border-border/50"
                      }
                    `}
                    >
                      {msg.Message}

                      {/* Attachments */}
                      {hasAttachments && (
                        <div className="mt-3 space-y-3">
                          {msg.Attachments.map((attachment: string, attIdx) => {
                            const filename =
                              attachment.split("/").pop() || attachment;
                            const fileInfo = getFileIcon(filename);
                            const FileIconComponent = fileInfo.icon;
                            const isImg = isImage(filename);

                            return (
                              <div key={attIdx} className="space-y-2">
                                {isImg && (
                                  <ImagePreview
                                    ticketId={ticketId}
                                    filename={filename}
                                    getAttachmentBlob={getAttachmentBlob}
                                  />
                                )}

                                <div
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    isMe
                                      ? "bg-primary-foreground/10"
                                      : "bg-background/50"
                                  } border border-border/30`}
                                >
                                  <div className={`p-2 rounded ${fileInfo.bg}`}>
                                    <FileIconComponent
                                      className={`w-4 h-4 ${fileInfo.color}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {filename}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => downloadAttachment(filename)}
                                    className="p-1.5 hover:bg-background/50 rounded transition-colors group/btn"
                                    title="Baixar arquivo"
                                  >
                                    <Download className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Unassigned Ticket Indicator inside message list if needed, or just handle in footer */}
          </>
        )}
      </div>

      {/* Input Area */}
      {isTicketClosed ? (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted/50 border border-border/50">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Este chamado foi {ticketStatus?.toLowerCase()} e não aceita mais
              mensagens
            </p>
          </div>
        </div>
      ) : isUnassigned ? (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <UserPlus className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Aguardando atribuição de um responsável para habilitar o chat
            </p>
          </div>
        </div>
      ) : (
        <div className="border-t border-border bg-muted/20">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-2 border-b border-border bg-background/50">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => {
                  const fileInfo = getFileIcon(file.name);
                  const FileIconComponent = fileInfo.icon;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted border border-border"
                    >
                      <div className={`p-1.5 rounded ${fileInfo.bg}`}>
                        <FileIconComponent
                          className={`w-3.5 h-3.5 ${fileInfo.color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate max-w-[120px]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <button className="p-0.5 hover:bg-background rounded transition-colors text-muted-foreground hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-0 overflow-hidden bg-background/95 backdrop-blur-md border shadow-xl"
                          side="top"
                          align="end"
                          sideOffset={12}
                        >
                          <div className="p-3 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center border border-orange-500/20">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              </div>
                              <div className="space-y-1 pt-0.5">
                                <p className="text-xs font-bold text-foreground">
                                  Remover anexo?
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  O arquivo será removido da lista de upload.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 p-2 border-t border-border/50">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 w-full text-[10px] font-bold shadow-md shadow-red-500/10 hover:shadow-red-500/20 transition-all hover:scale-[1.01]"
                              onClick={() => removeSelectedFile(idx)}
                            >
                              Confirmar Remoção
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isSending || isUploading}
                className="w-full bg-background border border-border rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={
                (!newMessage.trim() && selectedFiles.length === 0) ||
                isSending ||
                isUploading
              }
              className="rounded-full h-9 w-9 shrink-0"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
