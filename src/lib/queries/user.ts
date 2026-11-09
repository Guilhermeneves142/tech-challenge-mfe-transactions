"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/infra/http/auth-api";

/** Usuário da sessão (cookie httpOnly via /api/auth/me). */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000,
  });
}
