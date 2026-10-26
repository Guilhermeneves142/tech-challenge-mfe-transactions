const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function clearAuth(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: "POST" });
  } finally {
    try {
      localStorage.removeItem("finance-app-token");
      localStorage.removeItem("finance-app-user");
    } catch {}
  }
}
