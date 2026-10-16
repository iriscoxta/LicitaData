import { cn } from '@/lib/utils';

/** Marca provisória do LicitaData: três barras ascendentes, a última na cor da marca. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-ink" />
      <rect x="8" y="17" width="4" height="7" rx="2" className="fill-canvas" />
      <rect x="14" y="12" width="4" height="12" rx="2" className="fill-canvas" />
      <rect x="20" y="8" width="4" height="16" rx="2" className="fill-brand" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="size-7" />
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Licita<span className="text-muted">Data</span>
        </span>
      )}
    </span>
  );
}
