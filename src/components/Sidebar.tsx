"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Lock,
  Menu,
  Disc,
  List,
  X,
  LayoutDashboard,
  User,
  Wallet,
  UserIcon,
} from "lucide-react";
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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transações", href: "/transacoes", icon: List },
  { label: "Planejamento", href: "/planejamento", icon: Disc, disabled: true },
  { label: "Perfil", href: "/perfil", icon: User, disabled: true },
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

const navItemClass =
  "flex h-12 items-center gap-3 rounded-lg px-4 transition-all duration-200";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
        <Wallet className="h-5 w-5 text-[var(--color-brand-tertiary)]" aria-hidden />
      </span>
      <span className="text-[20px] font-semibold leading-[24px]">FinanceApp</span>
    </div>
  );
}

function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação principal">
      <ul className="flex flex-col gap-2">
        {menuItems.map((item) => {
          // Esta zona é sempre a de transações: o item ativo é fixo.
          const isActive = item.href === "/transacoes";
          const Icon = item.icon;
          return (
            <li key={item.label}>
              {item.disabled ? (
                <span
                  title="Disponível em breve"
                  aria-disabled="true"
                  className={`${navItemClass} text-white cursor-not-allowed opacity-70`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="text-[16px] font-medium leading-[20px]">
                    {item.label}
                  </span>
                  <Lock className="ml-auto h-4 w-4 opacity-70" aria-hidden />
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`${navItemClass} ${
                    isActive
                      ? "bg-[var(--color-brand-secondary)] text-[var(--color-brand-tertiary)]"
                      : "text-white hover:bg-[var(--color-brand-secondary)]/20"
                  }`}
                >
                  <span
                    aria-hidden="true" className={
                      isActive ? "text-[var(--color-brand-tertiary)]" : "text-white"
                    }
                  >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <span className={`text-[16px] leading-[20px] ${
                    isActive ? "font-bold text-[var(--color-brand-tertiary)]" : "font-medium text-white"
                  }` }>

                    {item.label}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserBox({
  initials,
  name,
  plan,
  onLogout,
  className,
}: {
  initials: string;
  name: string;
  plan: string;
  onLogout: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[var(--color-brand-primary)]">
          {initials}
        </span>
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold leading-[18px]">{name}</span>
          <span className="text-[11px] font-medium leading-[14px] text-white/75">
            {plan}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onLogout}
        aria-label="Sair"
        className="rounded-lg p-2 transition hover:bg-white/10"
      >
        <LogOut className="h-5 w-5 text-white" aria-hidden />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Lido apenas no cliente para não divergir da hidratação do servidor.
    const loadUser = async () => {
      const storedUser = localStorage.getItem("finance-app-user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setIsMounted(true);
    };
    loadUser();
  }, []);

  function handleLogout() {
    clearAuth();
    setOpenLogoutModal(false);
    setOpenMobileMenu(false);
    // Navegação entre zonas (transacoes -> auth) é hard navigation.
    window.location.href = "/auth/login";
  }

  const userName = isMounted ? user?.name || "Usuário" : "Usuário";
  const userInitials = isMounted
    ? user?.initials || (user?.name ? getInitials(user.name) : "U")
    : "U";
  const userPlan = isMounted ? user?.plan || "Plano Grátis" : "Plano Grátis";

  return (
    <>
      {/* Topbar mobile */}
      <header className="fixed left-0 top-0 z-50 w-full bg-[var(--color-brand-tertiary)] px-4 py-4 text-white shadow-md lg:hidden">
        <div className="flex items-center justify-between">
          <Logo />

          <button
            type="button"
            onClick={() => setOpenMobileMenu((prev) => !prev)}
            aria-label={openMobileMenu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={openMobileMenu}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            {openMobileMenu ? (
              <X className="h-6 w-6 text-white" aria-hidden />
            ) : (
              <Menu className="h-6 w-6 text-white" aria-hidden />
            )}
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {openMobileMenu && (
        <>
          <div
            id="mobile-menu"
            className="fixed left-0 top-[72px] z-50 w-full bg-[var(--color-brand-tertiary)] px-4 pb-5 text-white shadow-lg lg:hidden"
          >
            <NavMenu onNavigate={() => setOpenMobileMenu(false)} />

            <UserBox
              initials={userInitials}
              name={userName}
              plan={userPlan}
              onLogout={() => setOpenLogoutModal(true)}
              className="mt-4 border-t border-white/15 pt-4"
            />
          </div>

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpenMobileMenu(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        </>
      )}

      {/* Sidebar desktop */}
      <div className="flex h-full min-h-screen flex-col justify-between bg-[var(--color-brand-tertiary)] px-4 py-5 text-white max-lg:hidden">
        <div>
          <div className="mb-8">
            <Logo />
          </div>

          <NavMenu />
        </div>

        <UserBox
          initials={userInitials}
          name={userName}
          plan={userPlan}
          onLogout={() => setOpenLogoutModal(true)}
        />
      </div>

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader tabIndex={0}>
            <DialogTitle>Deseja sair?</DialogTitle>
            <DialogDescription>
              Você será redirecionado para a tela de login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleLogout}>Sair</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
