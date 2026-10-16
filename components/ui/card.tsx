import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Cartão com faixa de cabeçalho cinza e corpo branco, como no painel de referência. */
export function Card({
  title,
  hint,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('card flex min-w-0 flex-col', className)}>
      <header className="flex min-h-12 items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          {title}
          {hint && (
            <span title={hint} className="text-muted">
              <Info className="size-3.5" aria-label={hint} />
            </span>
          )}
        </h2>
        {action}
      </header>
      <div className={cn('card-body flex-1 p-4', bodyClassName)}>{children}</div>
    </section>
  );
}

export function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-line bg-surface text-ink-2 [&_svg]:size-4">
      {children}
    </span>
  );
}
