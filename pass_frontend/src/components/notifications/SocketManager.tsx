"use client";

import { useSocket } from "@/hooks/use-socket";

export function SocketManager() {
  useSocket();
  return null;
}
