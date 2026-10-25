import type { User } from "@/domain";
import { API_BASE_URL, createHttpClient } from "./http-client";

const request = createHttpClient(API_BASE_URL);

export const authApi = {
  /** Usuário da sessão (cookie httpOnly emitido pelo host). `null` se não autenticado. */
  me: () =>
    request<{ user: User | null }>("/auth/me")
      .then((data) => data?.user ?? null)
      .catch(() => null),
};
