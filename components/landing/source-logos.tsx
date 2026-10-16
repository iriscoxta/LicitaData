import Image from 'next/image';
import { cn } from '@/lib/utils';

const SOURCES = [
  { src: '/logos/receita-federal.webp', alt: 'Receita Federal', width: 2000, height: 469, className: 'h-[22px]' },
  { src: '/logos/pncp.png', alt: 'Portal Nacional de Contratações Públicas', width: 300, height: 96, className: 'h-[30px]' },
  { src: '/logos/tce-ce.png', alt: 'Tribunal de Contas do Estado do Ceará', width: 1783, height: 358, className: 'h-[24px]' },
];

/**
 * Logos das fontes públicas, de forma discreta: em tons de cinza e baixa opacidade,
 * ganhando cor apenas no hover. No tema escuro são invertidas para manter o contraste.
 */
export function SourceLogos({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-10 gap-y-5', className)}>
      {SOURCES.map((source) => (
        <li key={source.src} className="group">
          <Image
            src={source.src}
            alt={source.alt}
            width={source.width}
            height={source.height}
            className={cn(
              'w-auto opacity-45 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 dark:opacity-55 dark:invert dark:group-hover:grayscale',
              source.className,
            )}
          />
        </li>
      ))}
    </ul>
  );
}
