"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useBackendStatus } from "../hooks/use-backend-status";
import { toast } from "sonner";

export function BackendStatus({ allowToggle = false, initialVisible = true }: { allowToggle?: boolean; initialVisible?: boolean }) {
  const { status, lastChecked, error, checkBackendStatus } = useBackendStatus();
  const [visible, setVisible] = useState(initialVisible);

  // If parent disallows toggling, always ensure visible
  useEffect(() => {
    if (!allowToggle) setVisible(true);
  }, [allowToggle]);

  const handleManualCheck = async () => {
    toast.info("Verificando conexão com o backend...");
    await checkBackendStatus();
  };

  const getStatusInfo = () => {
    switch (status) {
      case "online":
        return {
          icon: <Wifi className="w-4 h-4" />,
          label: "Online",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "offline":
        return {
          icon: <WifiOff className="w-4 h-4" />,
          label: "Offline",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case "checking":
      default:
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          label: "Verificando...",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800",
        };
    }
  };

  const statusInfo = getStatusInfo();

  // If hidden, render nothing at all
  if (!visible) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <Badge variant={statusInfo.variant} className={statusInfo.className}>
          <div className="flex items-center gap-1">
            {statusInfo.icon}
            <span className="text-xs font-medium">{statusInfo.label}</span>
          </div>
        </Badge>

        {status === "offline" && (
          <>
            <div className="flex-1 text-xs text-muted-foreground">
              <div>Sistema funcionando em modo offline</div>
              {error && <div className="text-red-600">Erro: {error}</div>}
              {lastChecked && (
                <div>Última verificação: {lastChecked.toLocaleTimeString()}</div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualCheck}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Tentar Conectar
            </Button>
          </>
        )}

        {status === "online" && lastChecked && (
          <div className="text-xs text-muted-foreground">
            Última verificação: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {allowToggle && status === "online" && (
          <Button variant="ghost" size="sm" onClick={() => setVisible(false)} className="ml-auto">
            Esconder
          </Button>
        )}
      </div>
    </div>
  );
}