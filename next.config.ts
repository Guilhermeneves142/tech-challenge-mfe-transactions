import type { NextConfig } from "next";

// Multizone: este MFE serve tudo sob /transacoes (páginas e assets _next).
// O host (shell) faz rewrite de /transacoes/:path* para cá.
const nextConfig: NextConfig = {
  basePath: "/transacoes",
};

export default nextConfig;
