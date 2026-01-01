import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helpdeskAPI } from "../api/helpdeskAPI";
import { HelpdeskMessage, CreateMessageInput } from "../types/helpdesk";
import { toast } from "sonner";

export function useTicketMessages(helpdeskId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["helpdesk", helpdeskId, "messages"],
    queryFn: () => helpdeskAPI.getMessages(helpdeskId),
    enabled: !!helpdeskId,
    staleTime: 5000, // 5 seconds
  });

  const mutation = useMutation({
    mutationFn: (input: CreateMessageInput) => helpdeskAPI.sendMessage(helpdeskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesk", helpdeskId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] }); // To update lastMessageAt
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    },
  });

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isSending: mutation.isPending,
    sendMessage: mutation.mutateAsync,
    refetch: query.refetch,
  };
}
