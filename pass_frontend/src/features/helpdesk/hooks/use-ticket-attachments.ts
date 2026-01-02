import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helpdeskAPI } from "../api/helpdeskAPI";
import { toast } from "sonner";

export function useTicketAttachments(helpdeskId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["helpdesk", helpdeskId, "attachments"],
    queryFn: () => helpdeskAPI.listAttachments(helpdeskId),
    enabled: !!helpdeskId,
    staleTime: 30000, // 30 seconds
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => helpdeskAPI.uploadAttachment(helpdeskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk", helpdeskId, "attachments"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] }); // Update attachment count
      toast.success("Anexo enviado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao enviar anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    },
  });

  const getAttachmentBlob = async (filename: string) => {
    return helpdeskAPI.downloadAttachment(helpdeskId, filename);
  };

  const downloadAttachment = async (filename: string) => {
    try {
      const blob = await getAttachmentBlob(filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
      return blob;
    } catch (error) {
      toast.error(`Erro ao baixar anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  return {
    attachments: query.data || [],
    isLoading: query.isLoading,
    isUploading: uploadMutation.isPending,
    uploadAttachment: uploadMutation.mutateAsync,
    downloadAttachment,
    getAttachmentBlob,
    refetch: query.refetch,
  };
}
