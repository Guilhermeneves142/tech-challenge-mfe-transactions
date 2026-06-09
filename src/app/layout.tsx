import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanceApp — Transações",
  description: "Gestão de transações do FinanceApp",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="flex min-h-screen max-lg:pt-[88px]">
          <aside className="max-lg:w-0 w-[255px] shrink-0">
            <div className="fixed left-0 top-0 h-screen w-[255px] flex flex-col justify-between">
              <Sidebar />
            </div>
          </aside>

          <section className="flex flex-col flex-1 px-6">
            <main className="py-4">{children}</main>
            <footer className="text-center mt-auto">
              <span className="text-[12px] text-text-tertiary">
                © 2023 FinanceApp - Sua Gestão Financeira Profissional.
              </span>
            </footer>
          </section>
        </div>
      </body>
    </html>
  );
}
