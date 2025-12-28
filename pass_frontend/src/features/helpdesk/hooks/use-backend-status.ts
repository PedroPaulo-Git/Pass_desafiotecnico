// src/features/helpdesk/hooks/use-backend-status.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/axios";
import { BackendStatus, BackendStatusInfo } from "../types/helpdesk";

export function useBackendStatus() {
  const [statusInfo, setStatusInfo] = useState<BackendStatusInfo>({
    status: "checking",
    lastChecked: null,
  });

  const lastStatusChangeRef = useRef<number>(Date.now());
  const consecutiveFailuresRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const checkBackendStatus = useCallback(async () => {
    try {
      setStatusInfo(prev => ({ ...prev, status: "checking" }));

      // Try to hit a health endpoint or a simple GET request
      await api.get("/health", { timeout: 5000 });
      // Reset consecutive failures on success
      consecutiveFailuresRef.current = 0;
      setStatusInfo(prev => {
        // Prevent rapid status changes (minimum 5 seconds between changes)
        const now = Date.now();
        const timeSinceLastChange = now - lastStatusChangeRef.current;
        if (prev.status === "online" && timeSinceLastChange < 5000) {
          return prev; // Keep current status if changed too recently
        }
        lastStatusChangeRef.current = now;
        // If we became online, stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return {
          status: "online",
          lastChecked: new Date(),
        };
      });
    } catch (error) {
      // Increase consecutive failures and only mark offline after 2 consecutive failures
      consecutiveFailuresRef.current += 1;
      const shouldMarkOffline = consecutiveFailuresRef.current >= 2;

      setStatusInfo(prev => {
        // Prevent rapid status changes (minimum 5 seconds between changes)
        const now = Date.now();
        const timeSinceLastChange = now - lastStatusChangeRef.current;
        if (!shouldMarkOffline) {
          // Do not change status yet, but update lastChecked
          return {
            ...prev,
            lastChecked: new Date(),
            error: error instanceof Error ? error.message : "Backend unavailable",
          };
        }

        if (prev.status === "offline" && timeSinceLastChange < 5000) {
          return prev; // Keep current status if changed too recently
        }
        lastStatusChangeRef.current = now;
        return {
          status: "offline",
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : "Backend unavailable",
        };
      });
    }
  }, []);

  // Check status on mount and set up polling
  useEffect(() => {
    // Start by checking once
    checkBackendStatus();

    // Start polling, but we'll stop polling once we detect the backend is online
    intervalRef.current = window.setInterval(() => {
      checkBackendStatus();
    }, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkBackendStatus]);

  return {
    ...statusInfo,
    checkBackendStatus,
  };
}