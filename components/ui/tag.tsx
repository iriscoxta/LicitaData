import { cn } from '@/lib/utils';

export type TagTone = 'green' | 'amber' | 'rose' | 'violet' | 'sky' | 'teal' | 'gray' | 'blue';

const tones: Record<TagTone, string> = {
  green: 'bg-[var(--tag-green-bg)] text-[var(--tag-green-fg)]',
  amber: 'bg-[var(--tag-amber-bg)] text-[var(--tag-amber-fg)]',
  rose: 'bg-[var(--tag-rose-bg)] text-[var(--tag-rose-fg)]',
  violet: 'bg-[var(--tag-violet-bg)] text-[var(--tag-violet-fg)]',
  sky: 'bg-[var(--tag-sky-bg)] text-[var(--tag-sky-fg)]',
  teal: 'bg-[var(--tag-teal-bg)] text-[var(--tag-teal-fg)]',
  gray: 'bg-[var(--tag-gray-bg)] text-[var(--tag-gray-fg)]',
  blue: 'bg-[var(--tag-blue-bg)] text-[var(--tag-blue-fg)]',
};

export function Tag({
  tone = 'gray',
  dot = false,
  className,
  children,
}: {
  tone?: TagTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Tons fixos por porte empresarial, usados em todo o produto. */
export const SIZE_TAG: Record<string, { label: string; tone: TagTone }> = {
  MEI: { label: 'MEI', tone: 'teal' },
  ME: { label: 'ME', tone: 'green' },
  EPP: { label: 'EPP', tone: 'sky' },
  DEMAIS: { label: 'Demais', tone: 'violet' },
  OUTROS_PORTES: { label: 'Outros portes', tone: 'violet' },
  OTHER: { label: 'Outros', tone: 'violet' },
  NAO_IDENTIFICADO: { label: 'Não identificado', tone: 'gray' },
  UNKNOWN: { label: 'Não identificado', tone: 'gray' },
};

export const ORIGIN_TAG: Record<string, { label: string; tone: TagTone }> = {
  NO_MUNICIPIO_COMPRADOR: { label: 'Local', tone: 'green' },
  EM_OUTRO_MUNICIPIO: { label: 'Outro município', tone: 'amber' },
  FORA_DO_CEARA: { label: 'Fora do CE', tone: 'rose' },
  ORIGEM_NAO_IDENTIFICADA: { label: 'Não identificada', tone: 'gray' },
};
