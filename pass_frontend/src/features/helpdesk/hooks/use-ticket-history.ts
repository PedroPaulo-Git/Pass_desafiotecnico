import { useQuery } from "@tanstack/react-query";
import { helpdeskAPI } from "../api/helpdeskAPI";

export function useTicketHistory(helpdeskId: string) {
  const query = useQuery({
    queryKey: ["helpdesk", helpdeskId, "history"],
    queryFn: () => helpdeskAPI.getHistory(helpdeskId),
    enabled: !!helpdeskId,
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    history: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
