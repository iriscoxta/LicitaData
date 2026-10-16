'use client';

import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, ArrowRightLeft, Check, Info, Link2, RotateCw } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/charts/chart-tooltip';
import { PageHeader } from '@/components/shell/app-shell';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SourceBadge } from '@/components/ui/source-badge';
import { Tag } from '@/components/ui/tag';
import { compactMoney, count, money, monthShort, percent } from '@/lib/format';
import { byIbge, EXERCISES, MUNICIPALITIES } from '@/lib/municipalities';
import { DESTINATION_META, SIZE_META } from '@/lib/overview-view';
import type { ComparisonMode, ComparisonRequest, ComparisonResponse, ComparisonSideRequest, SideResult } from '@/lib/types';
import { useApi } from '@/lib/use-api';
import { cn } from '@/lib/utils';

type SideKey = 'left' | 'right';
type Tab = 'overview' | 'sizes' | 'expenses' | 'destinations';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'sizes', label: 'Porte' },
  { value: 'expenses', label: 'Despesas' },
  { value: 'destinations', label: 'Destino' },
];

const SIDE_STYLE: Record<SideKey, { color: string; soft: string; tone: 'green' | 'amber' }> = {
  left: { color: 'var(--data-2)', soft: 'rgb(124 207 154 / 0.18)', tone: 'green' },
  right: { color: 'var(--data-3)', soft: 'rgb(255 201 96 / 0.2)', tone: 'amber' },
};

const MODE_LABEL: Record<ComparisonMode, string> = {
  PERIODS: 'Mesmo município, períodos diferentes',
  MUNICIPALITIES: 'Municípios diferentes, mesmo período',
  MIXED: 'Municípios e períodos diferentes',
};

function buildSide(ibge: string, year: string): ComparisonSideRequest {
  return {
    label: `${byIbge(ibge)?.name ?? ibge} ${year}`,
    filters: {
      uf: 'CE',
      municipality_ibge_code: ibge,
      start_date: `${year}-01-01`,
      end_date: `${year}-12-31`,
      company_sizes: [],
      supplier_origins: [],
      expense_element_codes: [],
    },
  };
}

function mode(left: { city: string; year: string }, right: { city: string; year: string }): ComparisonMode | null {
  if (left.city === right.city && left.year === right.year) return null;
  if (left.city === right.city) return 'PERIODS';
  if (left.year === right.year) return 'MUNICIPALITIES';
  return 'MIXED';
}

export function Compare() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const left = { city: byIbge(params.get('a'))?.ibge ?? '2300754', year: params.get('anoA') ?? '2025' };
  const right = { city: byIbge(params.get('b'))?.ibge ?? '2312908', year: params.get('anoB') ?? '2025' };
  const comparisonMode = mode(left, right);
  const [copied, setCopied] = useState(false);

  const request = useMemo<ComparisonRequest | null>(
    () =>
      comparisonMode
        ? { comparison_mode: comparisonMode, left: buildSide(left.city, left.year), right: buildSide(right.city, right.year) }
        : null,
    [comparisonMode, left.city, left.year, right.city, right.year],
  );
  const result = useApi<ComparisonResponse>(request ? '/api/comparisons' : null, { method: 'POST', body: request ?? undefined });

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([key, value]) => next.set(key, value));
    router.replace(`${pathname}?${next}`, { scroll: false });
  };
  const swap = () => update({ a: right.city, anoA: right.year, b: left.city, anoB: left.year });

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const data = result.data;

  return (
    <>
      <PageHeader
        title="Comparação"
        description={comparisonMode ? MODE_LABEL[comparisonMode] : 'Escolha dois recortes diferentes para comparar.'}
        badge={<SourceBadge source={result.status === 'ready' ? result.source : null} reason={result.status === 'ready' ? result.reason : undefined} />}
        actions={
          <Button variant="outline" onClick={share}>
            {copied ? <Check /> : <Link2 />}
            {copied ? 'Link copiado' : 'Copiar link'}
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
        <div className="relative grid lg:grid-cols-2">
          {(['left', 'right'] as const).map((side) => {
            const selection = side === 'left' ? left : right;
            return (
              <SidePanel
                key={side}
                side={side}
                selection={selection}
                result={data ? data[side] : null}
                other={data ? data[side === 'left' ? 'right' : 'left'] : null}
                response={data}
                loading={result.status === 'loading'}
                onCity={(city) => update(side === 'left' ? { a: city } : { b: city })}
                onYear={(year) => update(side === 'left' ? { anoA: year } : { anoB: year })}
              />
            );
          })}
          <motion.button
            type="button"
            onClick={swap}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            aria-label="Inverter lados da comparação"
            className="absolute top-1/2 left-1/2 z-10 hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-pop lg:flex"
          >
            <ArrowRightLeft className="size-4" />
          </motion.button>
        </div>

        <AnimatePresence>
          {!comparisonMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
              <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                <Info className="size-5 text-muted" />
                <p className="font-medium">Os dois lados estão iguais</p>
                <p className="text-[13px] text-muted">Mude o município ou o exercício de um dos lados para comparar.</p>
              </div>
            </motion.div>
          )}
          {result.status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-surface/85 backdrop-blur-sm">
              <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                <AlertTriangle className="size-5 text-[var(--tag-rose-fg)]" />
                <p className="font-medium">Não foi possível comparar</p>
                <p className="text-[13px] text-muted">{result.message}</p>
                <Button variant="outline" onClick={result.retry}>
                  <RotateCw /> Tentar novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {data && comparisonMode && <DifferenceStrip response={data} />}
    </>
  );
}

function SidePanel({
  side,
  selection,
  result,
  other,
  response,
  loading,
  onCity,
  onYear,
}: {
  side: SideKey;
  selection: { city: string; year: string };
  result: SideResult | null;
  other: SideResult | null;
  response: ComparisonResponse | null;
  loading: boolean;
  onCity: (city: string) => void;
  onYear: (year: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const municipality = byIbge(selection.city);
  const style = SIDE_STYLE[side];
  const kpis = result?.overview.kpis ?? {};
  const initials = (municipality?.name ?? '?').split(' ').filter((word) => word.length > 2).slice(0, 2).map((word) => word[0]).join('');

  return (
    <div className={cn('flex min-w-0 flex-col p-5 sm:p-7', side === 'left' && 'border-b border-line lg:border-r lg:border-b-0')}>
      {/* Cabeçalho do lado: avatar, nome e seletores */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="flex size-[72px] items-center justify-center rounded-full border border-line text-[22px] font-semibold tracking-tight"
              style={{ background: `radial-gradient(circle at 30% 25%, ${style.soft}, transparent 70%), var(--surface-2)` }}
            >
              {initials}
            </div>
            <span
              className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold text-white"
              style={{ background: style.color }}
            >
              {side === 'left' ? 'A' : 'B'}
            </span>
          </div>
          <div>
            <p className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">{municipality?.name ?? '—'}</p>
            <p className="text-[13px] text-muted">
              {municipality?.region} · CE · {selection.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            label={`Município do lado ${side === 'left' ? 'A' : 'B'}`}
            value={selection.city}
            onChange={onCity}
            options={MUNICIPALITIES.map((item) => ({ value: item.ibge, label: item.name }))}
            className="w-40"
          />
          <Select
            label={`Exercício do lado ${side === 'left' ? 'A' : 'B'}`}
            value={selection.year}
            onChange={onYear}
            options={EXERCISES.map((value) => ({ value, label: value }))}
            className="w-24"
          />
        </div>
      </div>

      {/* Abas */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              'h-9 rounded-[10px] border px-3.5 text-[13px] font-medium transition-colors',
              tab === item.value ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-ink hover:border-line-strong',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!result ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_200px]">
          <div className="skeleton h-48" />
          <div className="skeleton h-48" />
          <div className="skeleton h-64 sm:col-span-2" />
        </div>
      ) : (
        <div className={cn('transition-opacity', loading && 'opacity-50')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              {tab === 'overview' && (
                <div className="grid gap-5 sm:grid-cols-[1fr_210px]">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start">
                    <Attribute label="Participação de ME" value={kpis.percentual_participacao_me !== undefined ? percent(kpis.percentual_participacao_me) : '—'} />
                    <Attribute label="Compras com ME" value={kpis.total_compras_ME_centavos !== undefined ? compactMoney(kpis.total_compras_ME_centavos) : '—'} />
                    <Attribute label="Total de compras" value={kpis.total_compras_centavos !== undefined ? compactMoney(kpis.total_compras_centavos) : '—'} />
                    <Attribute label="Empenhos" value={count(result.overview.totais_filtrados?.empenhos ?? result.overview.totais_brutos.empenhos)} />
                    <Attribute label="Fornecedores locais" value={kpis.percentual_compras_fornecedores_locais !== undefined ? percent(kpis.percentual_compras_fornecedores_locais) : '—'} />
                    <Attribute
                      label="Situação"
                      value={
                        <Tag tone={result.overview.competencias_ausentes.length ? 'amber' : 'green'} dot>
                          {result.overview.competencias_publicadas.length}/{result.overview.competencias_solicitadas.length} meses
                        </Tag>
                      }
                    />
                  </dl>
                  <RadarCard side={side} result={result} other={other} />
                </div>
              )}
              {tab === 'sizes' && response && (
                <BreakdownList
                  side={side}
                  rows={response.sections.participacao_por_porte_empresarial.map((item) => ({
                    key: item.porte,
                    label: SIZE_META[item.porte]?.label ?? item.porte,
                    color: SIZE_META[item.porte]?.color ?? 'var(--data-6)',
                    value: item.percentual[side].value,
                    otherValue: item.percentual[side === 'left' ? 'right' : 'left'].value,
                    detail: item.valor_centavos[side].value,
                  }))}
                  unit="pct"
                />
              )}
              {tab === 'expenses' && response && (
                <BreakdownList
                  side={side}
                  rows={response.sections.elementos_despesa.map((item, index) => ({
                    key: item.codigo,
                    label: item.nome,
                    color: `var(--data-${(index % 7) + 1})`,
                    value: item[side].value,
                    otherValue: item[side === 'left' ? 'right' : 'left'].value,
                    detail: null,
                  }))}
                  unit="money"
                />
              )}
              {tab === 'destinations' && response && (
                <BreakdownList
                  side={side}
                  rows={response.sections.destino_recursos.map((item) => ({
                    key: item.destino,
                    label: DESTINATION_META[item.destino]?.label ?? item.destino,
                    color: DESTINATION_META[item.destino]?.color ?? 'var(--data-6)',
                    value: item.percentual[side].value,
                    otherValue: item.percentual[side === 'left' ? 'right' : 'left'].value,
                    detail: item.valor_centavos[side].value,
                  }))}
                  unit="pct"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {response && <EvolutionCard side={side} response={response} />}
        </div>
      )}
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className="num mt-1 truncate text-[15px] font-medium text-ink">{value}</dd>
    </div>
  );
}

/** Indicadores normalizados (0–100) para o radar, sempre na mesma escala dos dois lados. */
function radarData(result: SideResult, other: SideResult | null) {
  const k = result.overview.kpis;
  const o = other?.overview.kpis ?? {};
  const relative = (a?: number, b?: number) => (a === undefined ? 0 : Math.round((a / Math.max(a, b ?? 0, 1)) * 100));
  const published = result.overview.competencias_solicitadas.length
    ? (result.overview.competencias_publicadas.length / result.overview.competencias_solicitadas.length) * 100
    : 0;
  return [
    { axis: 'ME', short: 'ME', value: Math.round(k.percentual_participacao_me ?? 0) },
    { axis: 'Local', short: 'LOC', value: Math.round(k.percentual_compras_fornecedores_locais ?? 0) },
    { axis: 'Volume', short: 'VOL', value: relative(k.total_compras_centavos, o.total_compras_centavos) },
    { axis: 'Compras ME', short: 'CME', value: relative(k.total_compras_ME_centavos, o.total_compras_ME_centavos) },
    { axis: 'Cadastro', short: 'CAD', value: Math.round(result.overview.cobertura_cadastral?.percentual ?? 0) },
    { axis: 'Publicação', short: 'PUB', value: Math.round(published) },
  ];
}

function RadarCard({ side, result, other }: { side: SideKey; result: SideResult; other: SideResult | null }) {
  const style = SIDE_STYLE[side];
  const mine = radarData(result, other);
  const theirs = other ? radarData(other, result) : [];
  const data = mine.map((item, index) => ({ ...item, other: theirs[index]?.value ?? 0 }));
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-semibold">Indicadores</p>
        <span title="Percentuais em escala 0–100. Volume e Compras ME são relativos ao outro lado." className="text-muted">
          <Info className="size-3.5" />
        </span>
      </div>
      <p className="text-[11px] text-muted">Escala 0–100</p>
      <div className="h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="var(--line-strong)" />
            <PolarAngleAxis
              dataKey="short"
              tick={({ x, y, payload, index }: { x?: number | string; y?: number | string; payload?: { value?: unknown }; index?: number }) => (
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={9.5}>
                  <tspan fill="var(--ink)" fontWeight={600}>{data[index ?? 0]?.value}</tspan>
                  <tspan fill="var(--muted)" dx={3}>{String(payload?.value ?? '')}</tspan>
                </text>
              )}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="other" stroke="var(--muted)" strokeDasharray="3 3" fill="var(--muted)" fillOpacity={0.08} isAnimationActive={false} />
            <Radar dataKey="value" stroke={style.color} strokeWidth={2} fill={style.color} fillOpacity={0.35} animationDuration={800} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BreakdownList({
  side,
  rows,
  unit,
}: {
  side: SideKey;
  rows: Array<{ key: string; label: string; color: string; value: number | null; otherValue: number | null; detail: number | null }>;
  unit: 'pct' | 'money';
}) {
  const max = Math.max(...rows.flatMap((row) => [row.value ?? 0, row.otherValue ?? 0]), 1);
  const format = unit === 'pct' ? percent : compactMoney;
  return (
    <ul className="space-y-3.5">
      {rows.map((row, index) => {
        const diff = row.value !== null && row.otherValue !== null ? row.value - row.otherValue : null;
        return (
          <li key={row.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: row.color }} />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {diff !== null && Math.abs(diff) > 0.0001 && (
                  <Tag tone={diff > 0 ? SIDE_STYLE[side].tone : 'gray'} className="h-5 px-2 text-[10.5px]">
                    {diff > 0 ? '+' : '−'}
                    {unit === 'pct' ? `${Math.abs(diff).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.` : compactMoney(Math.abs(diff))}
                  </Tag>
                )}
                <span className="num font-medium">{row.value === null ? '—' : format(row.value)}</span>
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-surface-2">
              {row.otherValue !== null && (
                <span className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-muted/60" style={{ left: `${(row.otherValue / max) * 100}%` }} title="Outro lado" />
              )}
              <motion.div
                className="h-full rounded-full"
                style={{ background: SIDE_STYLE[side].color }}
                initial={{ width: 0 }}
                animate={{ width: `${((row.value ?? 0) / max) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {row.detail !== null && <p className="num mt-1 text-[11px] text-muted">{money(row.detail)}</p>}
          </li>
        );
      })}
      <li className="flex items-center gap-2 pt-1 text-[11px] text-muted">
        <span className="h-3 w-0.5 rounded-full bg-muted/60" /> marcador = valor do outro lado
      </li>
    </ul>
  );
}

/** Evolução mensal deste lado (linha cheia) contra o outro lado (tracejada). */
function EvolutionCard({ side, response }: { side: SideKey; response: ComparisonResponse }) {
  const otherSide: SideKey = side === 'left' ? 'right' : 'left';
  const style = SIDE_STYLE[side];
  const gradientId = `evo-${side}`;
  const data = response.sections.evolucao_compras_consideradas.map((item) => {
    const period = side === 'left' ? item.left_period : item.right_period;
    return {
      label: period ? monthShort(period) : `M${item.position}`,
      mine: (side === 'left' ? item.left_published : item.right_published) ? item.compras_consideradas_centavos[side].value : null,
      other: (side === 'left' ? item.right_published : item.left_published) ? item.compras_consideradas_centavos[otherSide].value : null,
    };
  });
  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold">Evolução das compras</p>
          <p className="text-[11.5px] text-muted">Valor mensal considerado, comparado ao outro lado</p>
        </div>
        <span title="Meses alinhados pela posição no exercício" className="text-muted">
          <Info className="size-3.5" />
        </span>
      </div>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={style.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={style.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={6} interval="preserveStartEnd" />
            <YAxis tickLine={false} axisLine={false} width={58} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(value: number) => compactMoney(value)} />
            <Tooltip content={<ChartTooltip format={money} />} cursor={{ stroke: 'var(--line-strong)' }} />
            <Line type="monotone" dataKey="other" name="Outro lado" stroke="var(--muted)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
            <Area
              type="monotone"
              dataKey="mine"
              name="Este lado"
              stroke={style.color}
              strokeWidth={2.2}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: 'var(--surface)', stroke: style.color, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex gap-5 text-[11.5px] text-muted">
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 rounded-full" style={{ background: style.color }} />Este lado</span>
        <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-muted" />Outro lado</span>
      </div>
    </div>
  );
}

/** Faixa final com as diferenças dos KPIs entre os dois lados. */
function DifferenceStrip({ response }: { response: ComparisonResponse }) {
  const labels: Record<string, string> = {
    percentual_participacao_me: 'Participação de ME',
    total_compras_ME_centavos: 'Compras com ME',
    total_compras_centavos: 'Total de compras',
    percentual_compras_fornecedores_locais: 'Fornecedores locais',
    percentual_recursos_fora_municipio: 'Fora do município',
  };
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {response.sections.kpis
        .filter((item) => labels[item.indicator])
        .map((item, index) => {
          const pct = item.unit === 'PONTOS_PERCENTUAIS';
          const leader = item.ordering === 'LEFT_HIGHER' ? 'left' : item.ordering === 'RIGHT_HIGHER' ? 'right' : null;
          return (
            <motion.div
              key={item.indicator}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[14px] border border-line bg-surface p-4 shadow-card"
            >
              <p className="text-[12px] text-muted">{labels[item.indicator]}</p>
              <p className="num mt-1.5 text-[18px] font-semibold tracking-tight">
                {item.absolute_difference === null
                  ? '—'
                  : pct
                    ? `${item.absolute_difference.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.`
                    : compactMoney(item.absolute_difference)}
              </p>
              <div className="mt-2">
                {leader ? (
                  <Tag tone={SIDE_STYLE[leader].tone} dot>
                    {item[leader].label} à frente
                  </Tag>
                ) : (
                  <Tag tone="gray">{item.ordering === 'TIE' ? 'Empate' : 'Indisponível'}</Tag>
                )}
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}
