'use client';

import { motion } from 'motion/react';
import { ArrowRightLeft, Home, LayoutDashboard, LogIn, LogOut, MapPinned } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { MunicipalitySearch } from './municipality-search';

const NAV = [
  { href: '/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/comparar', label: 'Comparar', icon: ArrowRightLeft },
  { href: '/mapa', label: 'Mapa de empresas', icon: MapPinned },
];

function useSession() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    fetch('/api/session')
      .then((response) => response.json())
      .then((body: { authenticated?: boolean }) => setAuthenticated(Boolean(body.authenticated)))
      .catch(() => setAuthenticated(false));
  }, []);
  return authenticated;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useSession();

  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <div className="min-h-dvh">
      {/* Trilho lateral de ícones (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[68px] flex-col items-center border-r border-line bg-surface py-4 md:flex">
        <Link href="/" aria-label="LicitaData — início" className="mb-6">
          <LogoMark className="size-9" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Navegação principal">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className="group relative flex size-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:text-ink"
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-line"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <item.icon className={cn('relative size-[18px]', active && 'text-ink')} />
                <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 rounded-lg bg-ink px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-canvas opacity-0 shadow-pop transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col items-center gap-1.5">
          <Link href="/" aria-label="Página inicial" className="flex size-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink">
            <Home className="size-[18px]" />
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      <div className="md:pl-[68px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="md:hidden" aria-label="LicitaData — início">
              <LogoMark className="size-7" />
            </Link>
            <span className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-ink">
              <span className="size-2.5 rounded-full bg-gradient-to-br from-[var(--data-3)] to-[var(--data-4)]" />
              Ceará · TCE-CE
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MunicipalitySearch />
            <span className="md:hidden">
              <ThemeToggle />
            </span>
            {authenticated === null ? (
              <span className="skeleton size-9 rounded-full" />
            ) : authenticated ? (
              <button
                type="button"
                onClick={logout}
                className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pr-3 pl-1 text-[12.5px] font-medium text-ink-2 hover:text-ink"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--data-1)] to-[var(--data-6)] text-[11px] font-semibold text-white">
                  LD
                </span>
                <LogOut className="size-3.5" />
                Sair
              </button>
            ) : (
              <Link href="/entrar" className="flex h-9 items-center gap-2 rounded-full bg-ink px-3.5 text-[12.5px] font-medium text-canvas hover:opacity-90">
                <LogIn className="size-3.5" />
                Entrar
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-28 md:px-6 md:pb-12">{children}</main>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-around rounded-2xl border border-line bg-surface/90 shadow-pop backdrop-blur-xl md:hidden" aria-label="Navegação principal">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-0.5 px-3 text-[10.5px] font-medium', active ? 'text-ink' : 'text-muted')}>
              <item.icon className="size-[18px]" />
              {item.label.split(' ')[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-ink">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1 text-[13.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
