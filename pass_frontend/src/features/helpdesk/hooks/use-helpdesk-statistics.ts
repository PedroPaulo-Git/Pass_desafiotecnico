// src/features/helpdesk/hooks/use-helpdesk-statistics.ts
import { useQuery } from "@tanstack/react-query";
import { helpdeskAPI, helpdeskMockAPI } from "../api/helpdeskAPI";
import { useBackendStatus } from "./use-backend-status";
import { HelpdeskStatistics } from "../types/helpdesk";
import { useAuth } from "@/hooks/use-auth";

export function useHelpdeskStatistics() {
  const { currentUser } = useAuth();
  const { status: backendStatus } = useBackendStatus();

  return useQuery({
    queryKey: ["helpdesk-statistics", currentUser?.id, currentUser?.role, backendStatus],
    queryFn: async (): Promise<HelpdeskStatistics> => {
      console.log("📊 [STATS] Fetching statistics...", {
        userId: currentUser?.id,
        role: currentUser?.role,
        backendStatus,
      });

      if (backendStatus === "online") {
        try {
          console.log("📊 [STATS] Backend is ONLINE, calling real API...");
          const result = await helpdeskAPI.getStatistics(currentUser?.id, currentUser?.role);
          console.log("📊 [STATS] Real API response:", result);
          return result;
        } catch (error) {
          console.error("📊 [STATS] API call FAILED, falling back to mock:", (error as Error).message);
          const mockResult = await helpdeskMockAPI.getStatistics(currentUser?.id, currentUser?.role);
          console.log("📊 [STATS] Mock API response:", mockResult);
          return mockResult;
        }
      } else {
        console.log("📊 [STATS] Backend is OFFLINE, using mock API...");
        const mockResult = await helpdeskMockAPI.getStatistics(currentUser?.id, currentUser?.role);
        console.log("📊 [STATS] Mock API response:", mockResult);
        return mockResult;
      }
    },
    staleTime: backendStatus === "online" ? 60000 : Infinity,
    gcTime: backendStatus === "online" ? 300000 : Infinity,
    enabled: !!currentUser,
    refetchInterval: backendStatus === "online" ? 120000 : false,
  });
}
