'use client';

/** Tooltip compartilhado pelos gráficos Recharts. */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, unknown> }>;
  label?: string;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-xl border border-line bg-surface px-3 py-2.5 text-[12px] shadow-pop">
      {label && <p className="mb-1.5 font-semibold text-ink">{label}</p>}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="size-2 rounded-full" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="num font-medium text-ink">{format(Number(item.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
