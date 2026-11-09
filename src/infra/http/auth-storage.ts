import { API_BASE_URL } from "./http-client";

// A sessão vive num cookie httpOnly emitido pelo host (não acessível via JS).
// Logout = pedir ao servidor para invalidar o cookie.
export async function clearAuth(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" });
  } finally {
    // Limpa resquícios de versões antigas que guardavam token/usuário no browser.
    try {
      localStorage.removeItem("finance-app-token");
      localStorage.removeItem("finance-app-user");
      document.cookie = "finance-app-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}
  }
}
