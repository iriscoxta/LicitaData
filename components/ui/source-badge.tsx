import { cn } from '@/lib/utils';
import type { DataSource } from '@/lib/types';

export function SourceBadge({
  source,
  reason,
  className,
}: {
  source: DataSource | null;
  reason?: string;
  className?: string;
}) {
  if (!source) {
    return <span className={cn('skeleton inline-block h-6 w-28 rounded-full', className)} aria-hidden />;
  }
  const live = source === 'live';
  return (
    <span
      title={reason}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium',
        live
          ? 'bg-[var(--tag-green-bg)] text-[var(--tag-green-fg)]'
          : 'bg-[var(--tag-amber-bg)] text-[var(--tag-amber-fg)]',
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {live && (
          <span
            className="absolute inset-0 rounded-full bg-current"
            style={{ animation: 'pulse-ring 1.6s ease-out infinite' }}
          />
        )}
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      {live ? 'Dados ao vivo' : 'Demonstração'}
      {!live && reason && <span className="hidden font-normal opacity-80 md:inline">· {reason}</span>}
    </span>
  );
}
