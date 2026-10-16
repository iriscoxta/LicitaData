'use client';

import { motion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from '@/components/charts/chart-tooltip';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Card, IconBadge } from '@/components/ui/card';
import { Tag, type TagTone } from '@/components/ui/tag';
import { compactMoney, count, money, percent } from '@/lib/format';
import type { OverviewView } from '@/lib/overview-view';
import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;

/** Cartão de meta: anel de progresso com a participação de ME/MEI. */
export function TargetCard({
  view,
  goal,
  onGoalChange,
}: {
  view: OverviewView;
  goal: number;
  onGoalChange: (goal: number) => void;
}) {
  const value = view.mePercent ?? 0;
  const reached = value >= goal;
  const circumference = 2 * Math.PI * 22;
  return (
    <section className="flex flex-col justify-between rounded-[14px] border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] leading-tight font-semibold tracking-[-0.02em]">
          {reached ? 'Meta atingida' : 'Meta incompleta'}
        </h2>
        <div className="-mr-1.5 flex items-center" title="Meta de gestão: ajuste para o seu município">
          <button
            type="button"
            aria-label="Diminuir meta"
            onClick={() => onGoalChange(Math.max(5, goal - 5))}
            className="flex size-6 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
          >
            −
          </button>
          <Tag tone={reached ? 'green' : 'amber'} dot>
            Meta {goal}%
          </Tag>
          <button
            type="button"
            aria-label="Aumentar meta"
            onClick={() => onGoalChange(Math.min(95, goal + 5))}
            className="flex size-6 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-[60px] shrink-0">
          <svg viewBox="0 0 52 52" className="size-full -rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" strokeWidth="5" className="stroke-line" />
            <motion.circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              stroke={reached ? 'var(--data-2)' : 'var(--data-3)'}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - Math.min(value, 100) / 100) }}
              transition={{ duration: 1.3, ease }}
            />
          </svg>
          <span className="num absolute inset-0 flex items-center justify-center text-[12px] font-semibold">
            {Math.round(value)}%
          </span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">{view.mePercent === null ? '—' : percent(value)}</span> das compras de{' '}
          {view.municipality} foram para ME e MEI.{' '}
          {reached ? 'Acima da meta definida para o período.' : `Faltam ${percent(goal - value)} para a meta.`}
        </p>
      </div>
    </section>
  );
}

export function KpiCard({
  label,
  icon,
  value,
  format,
  change,
  changeLabel = 'vs. ano anterior',
  inverse = false,
  footer,
}: {
  label: string;
  icon: React.ReactNode;
  value: number | null;
  format: (value: number) => string;
  change?: number | null;
  changeLabel?: string;
  inverse?: boolean;
  footer?: React.ReactNode;
}) {
  const positive = (change ?? 0) >= 0;
  const good = inverse ? !positive : positive;
  return (
    <section className="card flex flex-col">
      <header className="flex h-12 items-center justify-between px-4">
        <h2 className="text-[13px] font-semibold">{label}</h2>
        <IconBadge>{icon}</IconBadge>
      </header>
      <div className="card-body flex flex-1 flex-col justify-end p-4">
        <p className="num text-[28px] leading-none font-semibold tracking-[-0.03em]">
          {value === null ? '—' : <AnimatedNumber value={value} format={format} />}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
          {change === null || change === undefined ? (
            footer ?? <span>Sem base de comparação</span>
          ) : (
            <>
              <span className={cn('inline-flex items-center gap-0.5 font-medium', good ? 'text-[var(--tag-green-fg)]' : 'text-[var(--tag-rose-fg)]')}>
                {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {positive ? '+' : ''}
                {change.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%
              </span>
              {changeLabel}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Donut com total no centro e legenda numérica abaixo (como "Leads by Source"). */
export function SizeDonut({ view }: { view: OverviewView }) {
  const [active, setActive] = useState<number | null>(null);
  const focus = active === null ? null : view.sizes[active];
  return (
    <Card title="Participação por porte" hint="Valor considerado no exercício, por porte do fornecedor" bodyClassName="flex flex-col">
      <div className="relative mx-auto aspect-square w-full max-w-[230px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={view.sizes}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="96%"
              paddingAngle={2}
              cornerRadius={6}
              stroke="none"
              onMouseEnter={(_, index) => setActive(index)}
              onMouseLeave={() => setActive(null)}
              animationDuration={900}
            >
              {view.sizes.map((item, index) => (
                <Cell key={item.key} fill={item.color} opacity={active === null || active === index ? 1 : 0.35} className="transition-opacity" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="num text-[24px] font-semibold tracking-[-0.03em]">
            {focus ? percent(focus.percent) : compactMoney(view.total)}
          </span>
          <span className="max-w-[110px] text-[11.5px] leading-tight text-muted">{focus ? focus.label : 'total considerado'}</span>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-3 pt-5 sm:grid-cols-4">
        {view.sizes.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            className="rounded-lg text-left"
          >
            <span className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide text-muted uppercase">
              <span className="size-2 rounded-full" style={{ background: item.color }} />
              <span className="truncate">{item.key === 'NAO_IDENTIFICADO' ? 'N/ident.' : item.key === 'OUTROS_PORTES' ? 'Outros' : item.key}</span>
            </span>
            <span className="num mt-0.5 block text-[16px] font-semibold">{percent(item.percent)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/** Ranking de elementos de despesa em barras horizontais. */
export function ExpenseBars({ view }: { view: OverviewView }) {
  const max = Math.max(...view.expenses.map((item) => item.value), 1);
  const total = view.expenses.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card title="Elementos de despesa" hint="Valores líquidos empenhados com microempresas" bodyClassName="space-y-3">
      {view.expenses.map((item, index) => (
        <div key={item.code} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="num shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted">{item.code}</span>
              <span className="truncate text-ink-2 group-hover:text-ink">{item.name}</span>
            </span>
            <span className="num shrink-0 font-medium">{compactMoney(item.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.9, delay: index * 0.05, ease }}
              title={`${percent((item.value / total) * 100)} do total`}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}

/** Barra empilhada + linhas com progresso (como "Sales Pipeline"). */
export function DestinationPipeline({ view }: { view: OverviewView }) {
  return (
    <Card title="Destino dos recursos" hint="Onde estão os fornecedores ME em relação ao município comprador">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {view.destinations.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: Math.max(item.percent, 0.5) }}
            transition={{ duration: 1, delay: index * 0.08, ease }}
            style={{ background: item.color, flexBasis: 0 }}
            className="first:rounded-l-full last:rounded-r-full"
            title={`${item.label}: ${percent(item.percent)}`}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-4">
        {view.destinations.map((item, index) => (
          <li key={item.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{item.label}</p>
                <p className="num text-[11.5px] text-muted">{money(item.value)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + index * 0.06, ease }}
                />
              </div>
              <span className="num w-11 text-right text-[12px] text-muted">{percent(item.percent)}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function MonthlyArea({ view, action }: { view: OverviewView; action?: React.ReactNode }) {
  return (
    <Card
      title="Evolução mensal das compras"
      hint="Compras consideradas e parcela destinada a microempresas, mês a mês, sem acumulação"
      action={action}
      bodyClassName="pt-5"
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer>
          <AreaChart data={view.monthly} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="fill-total" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--data-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--data-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fill-me" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--data-2)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--data-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11.5 }} dy={6} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: 'var(--muted)', fontSize: 11.5 }}
              tickFormatter={(value: number) => compactMoney(value)}
            />
            <Tooltip
              cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '4 4' }}
              content={<ChartTooltip format={money} />}
            />
            <Area type="monotone" dataKey="total" name="Compras consideradas" stroke="var(--data-1)" strokeWidth={2} fill="url(#fill-total)" activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }} animationDuration={1000} />
            <Area type="monotone" dataKey="me" name="Microempresas" stroke="var(--data-2)" strokeWidth={2} fill="url(#fill-me)" activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Leitura do período: frases curtas derivadas dos dados, com tags coloridas. */
export function PeriodReading({ view }: { view: OverviewView }) {
  const topExpense = view.expenses[0];
  const local = view.destinations.find((item) => item.key === 'NO_MUNICIPIO_COMPRADOR');
  const items: Array<{ tone: TagTone; tag: string; text: React.ReactNode }> = [
    {
      tone: 'violet',
      tag: 'Pico',
      text: view.peak ? (
        <>
          <b className="font-semibold text-ink">{view.peak.label}</b> concentrou {compactMoney(view.peak.total)} em compras.
        </>
      ) : (
        'Sem meses publicados.'
      ),
    },
    {
      tone: 'blue',
      tag: 'Média',
      text: (
        <>
          Média mensal de <b className="font-semibold text-ink">{compactMoney(view.monthlyAverage)}</b>.
        </>
      ),
    },
    {
      tone: 'green',
      tag: 'Despesa',
      text: topExpense ? (
        <>
          <b className="font-semibold text-ink">{topExpense.name}</b> lidera as compras com ME.
        </>
      ) : (
        '—'
      ),
    },
    {
      tone: (local?.percent ?? 0) >= 40 ? 'teal' : 'amber',
      tag: 'Local',
      text: (
        <>
          <b className="font-semibold text-ink">{local ? percent(local.percent) : '—'}</b> do recurso fica no próprio município.
        </>
      ),
    },
    {
      tone: 'gray',
      tag: 'Cobertura',
      text: (
        <>
          {view.published}/{view.requested} competências publicadas
          {view.coverage !== null && <> · cadastro {percent(view.coverage)}</>}.
        </>
      ),
    },
  ];
  return (
    <Card title="Leitura do período" hint="Destaques calculados a partir do recorte selecionado" bodyClassName="space-y-2.5">
      {items.map((item, index) => (
        <motion.div
          key={item.tag}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease }}
          className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3 text-[12.5px] leading-relaxed text-ink-2"
        >
          <Tag tone={item.tone} className="mt-px w-[78px] justify-center">
            {item.tag}
          </Tag>
          <p>{item.text}</p>
        </motion.div>
      ))}
    </Card>
  );
}

export function CommitmentsFooter({ view }: { view: OverviewView }) {
  return (
    <span>
      {view.commitments === null ? '—' : count(view.commitments)} empenhos ·{' '}
      {view.coverage === null ? 'cobertura n/d' : `${percent(view.coverage)} com cadastro`}
    </span>
  );
}
