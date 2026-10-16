'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  MapPinned,
  Sparkles,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { buttonClass } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Tag, type TagTone } from '@/components/ui/tag';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import {
  Magnetic,
  Parallax,
  Reveal,
  RotatingWord,
  SpotlightCard,
  TiltFrame,
  usePointerParallax,
} from './interactions';
import { ParticleBrazil } from './particle-brazil';
import { SourceLogos } from './source-logos';

export function LandingPage() {
  return (
    <div className="relative overflow-x-clip">
      <Nav />
      <Hero />
      <Preview />
      <Features />
      <TagMarquee />
      <ApiSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <nav
        className={cn(
          'flex h-14 w-full max-w-6xl items-center justify-between rounded-full px-3 pl-5 transition-all duration-500',
          scrolled ? 'border border-line bg-surface/75 shadow-pop backdrop-blur-xl' : 'border border-transparent',
        )}
      >
        <Link href="/" aria-label="LicitaData — início">
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 text-[13.5px] text-ink-2 md:flex">
          {[
            ['Painel', '#produto'],
            ['Recursos', '#recursos'],
            ['API', '#api'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-full px-3.5 py-2 transition-colors hover:bg-surface-2 hover:text-ink">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/entrar" className={buttonClass('ghost', 'md', 'hidden rounded-full sm:inline-flex')}>
            Entrar
          </Link>
          <Link href="/painel" className={buttonClass('primary', 'md', 'rounded-full')}>
            Abrir painel
          </Link>
        </div>
      </nav>
    </header>
  );
}

const FLOATING_TAGS: Array<{ label: string; tone: TagTone; className: string; depth: number }> = [
  { label: 'ME · 38,2%', tone: 'green', className: 'left-[2%] top-[18%]', depth: 26 },
  { label: 'Pregão eletrônico', tone: 'violet', className: 'right-[4%] top-[8%]', depth: -18 },
  { label: 'Fortaleza', tone: 'sky', className: 'right-[0%] top-[34%]', depth: 34 },
  { label: 'R$ 2,4 mi empenhados', tone: 'amber', className: 'left-[8%] bottom-[22%]', depth: -28 },
  { label: 'Fornecedor local', tone: 'teal', className: 'right-[12%] bottom-[12%]', depth: 22 },
  { label: 'Dispensa', tone: 'rose', className: 'left-[30%] top-[2%]', depth: 14 },
];

function Hero() {
  const pointer = usePointerParallax();
  const { scrollY } = useScroll();
  const mapY = useTransform(scrollY, [0, 600], [0, 90]);
  const mapOpacity = useTransform(scrollY, [0, 500], [1, 0.25]);

  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 pt-32 pb-10 md:pt-40 lg:grid-cols-[1.05fr_1fr] lg:gap-2">
      <div className="relative z-10">
        <div className="rise">
          <Link
            href="/mapa"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-[12.5px] text-ink-2 shadow-card transition-colors hover:border-line-strong"
          >
            <Tag tone="blue">Novo</Tag>
            Mapa das empresas cadastradas
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <h1
          style={{ animationDelay: '80ms' }}
          className="rise mt-7 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] text-ink sm:text-[64px] lg:text-[76px]"
        >
          Compras públicas,
          <br />
          lidas como{' '}
          <RotatingWord
            words={['um painel.', 'um mapa.', 'uma comparação.']}
            className="font-serif font-normal tracking-[-0.02em] text-brand italic"
          />
        </h1>

        <p style={{ animationDelay: '200ms' }} className="rise mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-2"
        >
          O LicitaData transforma empenhos, contratos e cadastros públicos em painéis, comparações e mapas — para
          pequenos negócios que vendem ao governo e para quem acompanha cada real investido.
        </p>

        <div style={{ animationDelay: '300ms' }} className="rise mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <Link href="/painel" className={buttonClass('primary', 'lg', 'group h-12 px-6')}>
              Explorar o painel
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
          <Magnetic strength={0.2}>
            <Link href="/comparar" className={buttonClass('outline', 'lg', 'h-12 px-6')}>
              <ArrowRightLeft />
              Comparar municípios
            </Link>
          </Magnetic>
        </div>

        <div style={{ animationDelay: '550ms' }} className="rise mt-14">
          <p className="mb-4 text-[11.5px] font-medium tracking-[0.14em] text-muted uppercase">Construído sobre dados públicos de</p>
          <SourceLogos />
        </div>
      </div>

      <motion.div style={{ y: mapY, opacity: mapOpacity }} className="relative -mx-5 aspect-square sm:mx-0 lg:-mr-10">
        <div style={{ animationDelay: '100ms', animationDuration: '1.4s' }} className="rise absolute inset-0">
          <ParticleBrazil className="size-full touch-none" />
        </div>
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {FLOATING_TAGS.map((tag, index) => (
            <motion.div
              key={tag.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              className={cn('absolute', tag.className)}
            >
              <Parallax depth={tag.depth} pointer={pointer}>
                <Tag tone={tag.tone} dot className="h-7 px-3 text-[12px] shadow-pop">
                  {tag.label}
                </Tag>
              </Parallax>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Preview() {
  const bars = [42, 58, 51, 66, 61, 74, 69, 83, 77, 88, 92, 100];
  return (
    <section id="produto" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
      <div
        className="pointer-events-none absolute inset-x-10 top-24 -z-10 h-[420px] rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgb(111 123 255 / 0.28), rgb(124 207 154 / 0.12), transparent)' }}
      />
      <Reveal>
        <TiltFrame className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-[22px] border border-line bg-canvas p-2 shadow-pop">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="ml-3 rounded-md bg-surface px-3 py-1 font-mono text-[11px] text-muted">licitadata.app/painel</span>
            </div>
            <div className="grid gap-2 p-1 sm:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-4 sm:col-span-1">
                <p className="text-[12px] font-semibold">Participação de ME</p>
                <div className="mt-3 flex items-center gap-3">
                  <svg viewBox="0 0 36 36" className="size-12 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" className="stroke-line" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="stroke-brand"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 0.38 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <p className="text-[11px] leading-snug text-muted">
                    <span className="font-semibold text-ink">38,2%</span> das compras foram para pequenos negócios
                  </p>
                </div>
              </div>
              {[
                ['Total de compras', 1_254_300_000, '+6,1%', 'green'],
                ['Compras com ME', 479_100_000, '+12,4%', 'green'],
                ['Fornecedores locais', 41.7, '−1,3 p.p.', 'rose'],
              ].map(([label, value, delta, tone]) => (
                <div key={label as string} className="rounded-2xl border border-line bg-surface p-4">
                  <p className="text-[12px] font-semibold">{label}</p>
                  <p className="num mt-3 text-[22px] font-semibold tracking-tight">
                    <AnimatedNumber
                      value={value as number}
                      format={(n) =>
                        label === 'Fornecedores locais'
                          ? `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`
                          : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(n)
                      }
                    />
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    <span className={tone === 'green' ? 'text-[var(--tag-green-fg)]' : 'text-[var(--tag-rose-fg)]'}>{delta}</span> vs. ano anterior
                  </p>
                </div>
              ))}
              <div className="rounded-2xl border border-line bg-surface p-4 sm:col-span-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold">Evolução mensal das compras</p>
                  <div className="flex gap-1.5">
                    <Tag tone="blue" dot>Total</Tag>
                    <Tag tone="green" dot>ME</Tag>
                  </div>
                </div>
                <div className="mt-5 flex h-36 items-end gap-2">
                  {bars.map((height, index) => (
                    <div key={index} className="flex h-full flex-1 flex-col justify-end gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full overflow-hidden rounded-md bg-[var(--data-1)]/85"
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-[var(--data-2)]" style={{ height: `${30 + (index % 4) * 6}%` }} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
                <p className="text-[12px] font-semibold">Destino dos recursos</p>
                <div className="mt-1 flex h-2.5 overflow-hidden rounded-full">
                  {[
                    ['var(--data-1)', 42],
                    ['var(--data-2)', 31],
                    ['var(--data-3)', 19],
                    ['var(--data-4)', 8],
                  ].map(([color, width]) => (
                    <motion.span
                      key={color as string}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: color as string }}
                    />
                  ))}
                </div>
                {[
                  ['Local', 'green', '42%'],
                  ['Outro município', 'amber', '31%'],
                  ['Fora do CE', 'rose', '19%'],
                ].map(([label, tone, value]) => (
                  <div key={label} className="flex items-center justify-between text-[11.5px]">
                    <Tag tone={tone as TagTone}>{label}</Tag>
                    <span className="num text-muted">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TiltFrame>
      </Reveal>
    </section>
  );
}

function Features() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <Reveal className="max-w-2xl">
        <Tag tone="violet" dot>
          Recursos
        </Tag>
        <h2 className="mt-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.04em] sm:text-[48px]">
          Tudo o que a compra pública revela, <span className="font-serif font-normal text-muted italic">num só lugar.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-3 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <SpotlightCard className="h-full p-7">
            <FeatureHead icon={<BarChart3 />} title="Panorama municipal" text="KPIs, porte empresarial, elementos de despesa e destino dos recursos de cada município, mês a mês." href="/painel" />
            <MiniBars />
          </SpotlightCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.08}>
          <SpotlightCard className="h-full p-7">
            <FeatureHead icon={<ArrowRightLeft />} title="Comparação lado a lado" text="Dois municípios ou dois exercícios, com radar de indicadores." href="/comparar" />
            <MiniCompare />
          </SpotlightCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.04}>
          <SpotlightCard className="h-full p-7">
            <FeatureHead icon={<MapPinned />} title="Mapa de empresas" text="Onde estão as empresas cadastradas, com filtro por estado e cidade." href="/mapa" />
            <MiniMap />
          </SpotlightCard>
        </Reveal>
        <Reveal className="md:col-span-4" delay={0.12}>
          <SpotlightCard className="h-full p-7">
            <FeatureHead icon={<Tags />} title="Recortes que fazem sentido" text="Filtre por porte, origem do fornecedor e elemento de despesa — e compartilhe o recorte." />
            <TagCloud />
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureHead({ icon, title, text, href }: { icon: React.ReactNode; title: string; text: string; href?: string }) {
  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink [&_svg]:size-[18px]">{icon}</span>
        {href && (
          <Link href={href} aria-label={title} className="flex size-8 items-center justify-center rounded-full text-muted transition-all group-hover:bg-ink group-hover:text-canvas">
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
      <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

function MiniBars() {
  const data = [
    ['Material de consumo', 92, 'var(--data-1)'],
    ['Serviços de terceiros', 74, 'var(--data-2)'],
    ['Obras e instalações', 55, 'var(--data-3)'],
    ['Equipamentos', 38, 'var(--data-4)'],
    ['Serviços de TI', 22, 'var(--data-5)'],
  ] as const;
  return (
    <div className="relative mt-8 space-y-2.5">
      {data.map(([label, value, color], index) => (
        <div key={label} className="grid grid-cols-[150px_1fr] items-center gap-3 text-[12px]">
          <span className="truncate text-ink-2">{label}</span>
          <div className="h-6 rounded-md bg-surface-2">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-md transition-[filter] group-hover:saturate-150"
              style={{ background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniCompare() {
  const [swapped, setSwapped] = useState(false);
  const sides = swapped ? ['Sobral', 'Amontada'] : ['Amontada', 'Sobral'];
  const values = swapped ? ['41,2%', '33,8%'] : ['33,8%', '41,2%'];
  return (
    <div className="relative mt-8 flex items-center gap-2">
      {[0, 1].map((index) => (
        <motion.div key={sides[index]} layout transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="flex-1 rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-[11px] text-muted">{sides[index]}</p>
          <p className="num mt-1 text-[20px] font-semibold tracking-tight">{values[index]}</p>
          <Tag tone={index === 0 ? 'green' : 'violet'} className="mt-2">ME</Tag>
        </motion.div>
      ))}
      <button
        type="button"
        onClick={() => setSwapped((value) => !value)}
        aria-label="Inverter lados"
        className="absolute left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-pop transition-transform hover:rotate-180"
      >
        <ArrowRightLeft className="size-3.5" />
      </button>
    </div>
  );
}

function MiniMap() {
  const points = [
    [62, 22], [70, 30], [55, 35], [72, 46], [40, 40], [48, 62], [58, 70], [66, 58], [35, 25], [50, 50], [62, 80],
  ];
  return (
    <div className="relative mt-6 h-36 overflow-hidden rounded-xl border border-line bg-surface-2">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(var(--line-strong) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
      {points.map(([x, y], index) => (
        <span key={index} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
          <span className="absolute -inset-2 rounded-full bg-[var(--data-1)]/40" style={{ animation: `pulse-ring 2.2s ${index * 0.2}s ease-out infinite` }} />
          <span className="relative block size-2 rounded-full border border-surface bg-[var(--data-1)]" />
        </span>
      ))}
      <div className="absolute right-2 bottom-2 flex gap-1">
        <Tag tone="sky">CE</Tag>
        <Tag tone="gray">Fortaleza</Tag>
      </div>
    </div>
  );
}

const CLOUD: Array<[string, TagTone]> = [
  ['ME', 'green'], ['MEI', 'teal'], ['EPP', 'sky'], ['Demais portes', 'violet'], ['Local', 'green'], ['Outro município', 'amber'],
  ['Fora do CE', 'rose'], ['Material de consumo', 'blue'], ['Obras e instalações', 'amber'], ['Serviços de TI', 'sky'],
  ['Consultoria', 'violet'], ['2025', 'gray'], ['2024', 'gray'], ['Cariri', 'teal'], ['Litoral Oeste', 'blue'],
];

function TagCloud() {
  const [active, setActive] = useState<Set<string>>(() => new Set(['ME', 'Local', '2025']));
  return (
    <div className="relative mt-8 flex flex-wrap gap-2">
      {CLOUD.map(([label, tone]) => {
        const on = active.has(label);
        return (
          <motion.button
            key={label}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() =>
              setActive((current) => {
                const next = new Set(current);
                if (next.has(label)) next.delete(label);
                else next.add(label);
                return next;
              })
            }
            aria-pressed={on}
            className={cn('rounded-full transition-opacity', on ? 'opacity-100' : 'opacity-45 hover:opacity-80')}
          >
            <Tag tone={tone} dot={on} className="h-8 px-3.5 text-[12.5px]">
              {label}
            </Tag>
          </motion.button>
        );
      })}
    </div>
  );
}

function TagMarquee() {
  const rows: Array<Array<[string, TagTone]>> = [
    [['Pregão eletrônico', 'violet'], ['Dispensa de licitação', 'rose'], ['Concorrência', 'sky'], ['Ata de registro de preços', 'amber'], ['Inexigibilidade', 'teal'], ['Credenciamento', 'green'], ['Tomada de preços', 'blue']],
    [['Empenho', 'green'], ['Liquidação', 'sky'], ['Anulação', 'rose'], ['Contrato', 'violet'], ['Aditivo', 'amber'], ['CNPJ', 'gray'], ['Elemento 3.3.90.30', 'blue'], ['Fornecedor local', 'teal']],
  ];
  return (
    <section className="relative py-10 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" aria-label="Categorias acompanhadas">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="group flex overflow-hidden py-1.5">
          <div
            className="flex shrink-0 gap-2.5 pr-2.5 group-hover:[animation-play-state:paused]"
            style={{ animation: `marquee ${rowIndex ? 46 : 38}s linear infinite`, animationDirection: rowIndex ? 'reverse' : 'normal' }}
          >
            {[...row, ...row, ...row, ...row].map(([label, tone], index) => (
              <Tag key={index} tone={tone} dot className="h-9 px-4 text-[13px]">
                {label}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ApiSection() {
  return (
    <section id="api" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-12 px-5 py-24 lg:grid-cols-2">
      <Reveal>
        <Tag tone="blue" dot>
          Mesma API, nova leitura
        </Tag>
        <h2 className="mt-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.04em] sm:text-[44px]">
          Dados tratados, prontos para <span className="font-serif font-normal italic">decidir</span>.
        </h2>
        <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-ink-2">
          Cada número do LicitaData vem de uma API que consolida competências publicadas, identifica o porte do
          fornecedor e aponta a origem do recurso — com cobertura cadastral explícita.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
          {[
            [184, 'municípios do CE'],
            [7, 'elementos de despesa'],
            [12, 'competências por ano'],
          ].map(([value, label]) => (
            <div key={label as string}>
              <p className="num text-[30px] font-semibold tracking-tight">
                <AnimatedNumber value={value as number} format={(n) => Math.round(n).toString()} />
              </p>
              <p className="text-[12.5px] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <CodeCard />
      </Reveal>
    </section>
  );
}

function CodeCard() {
  const lines: Array<Array<[string, string]>> = [
    [['GET ', 'text-[var(--tag-green-fg)]'], ['/analytics/tce/overview/munipal', 'text-ink']],
    [['  ?codigo_municipio=', 'text-muted'], ['010', 'text-[var(--tag-amber-fg)]'], ['&data_inicial=', 'text-muted'], ['2025-01-01', 'text-[var(--tag-amber-fg)]']],
    [['', '']],
    [['{', 'text-muted']],
    [['  "municipio"', 'text-[var(--tag-violet-fg)]'], [': { ', 'text-muted'], ['"nome"', 'text-[var(--tag-violet-fg)]'], [': ', 'text-muted'], ['"Amontada"', 'text-[var(--tag-sky-fg)]'], [' },', 'text-muted']],
    [['  "kpis"', 'text-[var(--tag-violet-fg)]'], [': {', 'text-muted']],
    [['    "percentual_participacao_me"', 'text-[var(--tag-violet-fg)]'], [': ', 'text-muted'], ['33.8', 'text-[var(--tag-amber-fg)]'], [',', 'text-muted']],
    [['    "percentual_compras_fornecedores_locais"', 'text-[var(--tag-violet-fg)]'], [': ', 'text-muted'], ['41.7', 'text-[var(--tag-amber-fg)]']],
    [['  },', 'text-muted']],
    [['  "destino_recursos"', 'text-[var(--tag-violet-fg)]'], [': [ … ]', 'text-muted']],
    [['}', 'text-muted']],
  ];
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-2xl" style={{ background: 'conic-gradient(from 120deg, rgb(111 123 255 / 0.25), rgb(124 207 154 / 0.2), rgb(255 201 96 / 0.2), rgb(111 123 255 / 0.25))' }} />
      <div className="overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop">
        <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5">
          <div className="flex gap-1.5">
            <Tag tone="green">200 OK</Tag>
            <Tag tone="gray">142 ms</Tag>
          </div>
          <Sparkles className="size-4 text-muted" />
        </div>
        <pre className="scrollbar-thin overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.8]">
          {lines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.06, duration: 0.4 }}
            >
              {line.map(([text, className], i) => (
                <span key={i} className={className}>
                  {text || ' '}
                </span>
              ))}
            </motion.div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-20">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-ink px-6 py-16 text-center text-canvas sm:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.25) 1px, transparent 1px)', backgroundSize: '18px 18px', maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)' }} />
          <Building2 className="relative mx-auto size-8 opacity-80" />
          <h2 className="relative mx-auto mt-6 max-w-2xl text-[34px] leading-[1.05] font-semibold tracking-[-0.04em] sm:text-[48px]">
            Veja para onde vai cada real das <span className="font-serif font-normal italic">compras públicas</span>.
          </h2>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Link href="/painel" className="inline-flex h-12 items-center gap-2 rounded-full bg-canvas px-6 text-[14px] font-medium text-ink transition-opacity hover:opacity-90">
                Abrir o painel <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
            <Link href="/mapa" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-[14px] font-medium text-canvas transition-colors hover:bg-white/10">
              <MapPinned className="size-4" /> Ver mapa
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 border-t border-line px-5 py-10 text-[12.5px] text-muted sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Logo />
        <span>© {new Date().getFullYear()} · Dados públicos, leitura clara.</span>
      </div>
      <div className="flex gap-5">
        <Link href="/painel" className="hover:text-ink">Painel</Link>
        <Link href="/comparar" className="hover:text-ink">Comparar</Link>
        <Link href="/mapa" className="hover:text-ink">Mapa</Link>
        <Link href="/entrar" className="hover:text-ink">Entrar</Link>
      </div>
    </footer>
  );
}
