"use client";

import { useAuthContext } from "@/lib/auth/auth-context";

// Re-export constants and types for backward compatibility
export type { User, UserRole } from "@/lib/auth/auth-context";

export function useAuth() {
  return useAuthContext();
}