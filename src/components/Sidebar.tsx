"use client";

import { useEffect, useState } from "react";
import { LogOut, Lock, Menu, Disc, List, X, LayoutDashboard, User, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from "@vandrei/finance-ui";
import { clearAuth } from "@/lib/auth-storage";

type User = {
  id: number;
  name: string;
  email: string;
  initials?: string;
  plan?: string;
  avatar?: string | null;
};

// Links apontam para outras zonas (host/auth). No multizone a navegação entre
// zonas é hard navigation (<a>), senão o basePath /transacoes prefixaria as URLs.
const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Transações",
    href: "/transacoes",
    icon: <List className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Planejamento",
    href: "/planejamento",
    icon: <Disc className="h-5 w-5 shrink-0" />,
    disabled: true,
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: <User className="h-5 w-5 shrink-0" />,
    disabled: true,
  },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar() {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("finance-app-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsMounted(true);
  }, []);

  function handleLogout() {
    clearAuth();
    setOpenLogoutModal(false);
    setOpenMobileMenu(false);
    // Navegação entre zonas (transacoes -> auth) é hard navigation.
    window.location.href = "/auth/login";
  }

  const userName = user?.name || "Usuário";
  const userInitials =
    user?.initials || (user?.name ? getInitials(user.name) : "U");
  const userPlan = user?.plan || "Plano Grátis";

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full bg-[var(--color-brand-tertiary)] px-4 py-4 text-white shadow-md lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Wallet className="h-5 w-5 text-[var(--color-brand-primary)]" />
            </div>

            <span className="text-[20px] font-semibold leading-[24px]">
              FinanceApp
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpenMobileMenu((prev) => !prev)}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            {openMobileMenu ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </header>

      {openMobileMenu && (
        <>
          <div className="fixed left-0 top-[72px] z-50 w-full bg-[var(--color-brand-tertiary)] px-4 pb-5 text-white shadow-lg lg:hidden">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = item.href === "/transacoes";
                const isDisabled = item.disabled;

                const baseClass =
                  "flex h-12 items-center gap-3 rounded-lg px-4 transition-all duration-200";

                const activeClass = isActive
                  ? "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
                  : "text-white hover:bg-[var(--color-brand-secondary)]/20";

                const disabledClass =
                  "text-white/40 cursor-not-allowed opacity-60";

                if (isDisabled) {
                  return (
                    <div
                      key={item.label}
                      title="Disponível em breve"
                      className={`${baseClass} ${disabledClass}`}
                    >
                      {item.icon}

                      <span className="text-[16px] font-medium leading-[20px]">
                        {item.label}
                      </span>

                      <Lock className="ml-auto h-4 w-4 opacity-70" />
                    </div>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpenMobileMenu(false)}
                    className={`${baseClass} ${activeClass}`}
                  >
                    {item.icon}

                    <span className="text-[16px] font-medium leading-[20px]">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[var(--color-brand-primary)]">
                  {isMounted ? userInitials : "U"}
                </div>

                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold leading-[18px]">
                    {isMounted ? userName : "Usuário"}
                  </span>

                  <span className="text-[11px] font-medium leading-[14px] text-white/75">
                    {isMounted ? userPlan : "Plano Grátis"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenLogoutModal(true)}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <LogOut className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div
            onClick={() => setOpenMobileMenu(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        </>
      )}

      <div className="max-lg:hidden flex h-full min-h-screen flex-col justify-between bg-[var(--color-brand-tertiary)] px-4 py-5 text-white">
        <div>
          {/* LOGO */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Wallet className="h-5 w-5 text-[var(--color-brand-primary)]" />
            </div>

            <span className="text-[20px] font-semibold leading-[24px]">
              FinanceApp
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = item.href === "/transacoes";
              const isDisabled = item.disabled;

              const baseClass =
                "flex h-12 items-center gap-3 rounded-lg px-4 transition-all duration-200";

              const activeClass = isActive
                ? "bg-[var(--color-brand-secondary)] text-[var(--color-brand-primary)]"
                : "text-white hover:bg-[var(--color-brand-secondary)]/20";

              const disabledClass =
                "text-white/40 cursor-not-allowed opacity-60";

              if (isDisabled) {
                return (
                  <div
                    key={item.label}
                    title="Disponível em breve"
                    className={`${baseClass} ${disabledClass}`}
                  >
                    {item.icon}

                    <span className="text-[16px] font-medium leading-[20px]">
                      {item.label}
                    </span>

                    <Lock className="ml-auto h-4 w-4 opacity-70" />
                  </div>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`${baseClass} ${activeClass}`}
                >
                  {item.icon}

                  <span className="text-[16px] font-medium leading-[20px]">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[var(--color-brand-primary)]">
              {isMounted ? userInitials : "U"}
            </div>

            <div className="flex flex-col">
              <span className="text-[14px] font-semibold leading-[18px]">
                {isMounted ? userName : "Usuário"}
              </span>

              <span className="text-[11px] font-medium leading-[14px] text-white/75">
                {isMounted ? userPlan : "Plano Grátis"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenLogoutModal(true)}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <LogOut className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Deseja sair?</DialogTitle>
            <DialogDescription>
              Você será redirecionado para a tela de login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button onClick={handleLogout}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
