import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({
  value,
  onChange,
  options,
  label,
  className,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className={cn('relative inline-flex h-9 items-center', className)}>
      <span className="sr-only">{label}</span>
      {icon && <span className="pointer-events-none absolute left-3 text-muted [&_svg]:size-4">{icon}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-full w-full cursor-pointer appearance-none rounded-[10px] border border-line-strong bg-surface pr-9 text-[13px] font-medium text-ink outline-none transition-colors hover:border-ink/30 focus-visible:border-brand',
          icon ? 'pl-9' : 'pl-3',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" />
    </label>
  );
}
