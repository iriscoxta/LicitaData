'use client';

import { AlertTriangle, Building2, CalendarDays, Download, FileText, MapPin, RotateCw, Wallet } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shell/app-shell';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { SourceBadge } from '@/components/ui/source-badge';
import { compactMoney, count, percent } from '@/lib/format';
import { byTce, EXERCISES, MUNICIPALITIES } from '@/lib/municipalities';
import { delta, overviewView, type OverviewView } from '@/lib/overview-view';
import type { MunicipalOverview, SupplierListResponse } from '@/lib/types';
import { useApi } from '@/lib/use-api';
import { SuppliersTable } from './suppliers-table';
import {
  CommitmentsFooter,
  DestinationPipeline,
  ExpenseBars,
  KpiCard,
  MonthlyArea,
  PeriodReading,
  SizeDonut,
  TargetCard,
} from './widgets';

const DEFAULT_MUNICIPALITY = '010'; // Amontada

function useGoal(municipality: string) {
  const key = `licitadata-goal-${municipality}`;
  const [goal, setGoal] = useState(30);
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(key));
      setGoal(Number.isFinite(stored) && stored > 0 ? stored : 30);
    } catch {
      setGoal(30);
    }
  }, [key]);
  const update = (value: number) => {
    setGoal(value);
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // sem armazenamento: meta vale apenas nesta sessão
    }
  };
  return [goal, update] as const;
}

function downloadCsv(view: OverviewView, year: string) {
  const lines = [
    ['Município', view.municipality],
    ['Exercício', year],
    [],
    ['Competência', 'Compras consideradas (R$)', 'Microempresas (R$)'],
    ...view.monthly.map((item) => [item.period, (item.total / 100).toFixed(2), (item.me / 100).toFixed(2)]),
    [],
    ['Porte', 'Valor (R$)', '%'],
    ...view.sizes.map((item) => [item.label, (item.value / 100).toFixed(2), item.percent.toFixed(1)]),
    [],
    ['Destino', 'Valor (R$)', '%'],
    ...view.destinations.map((item) => [item.label, (item.value / 100).toFixed(2), item.percent.toFixed(1)]),
  ];
  const csv = lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `licitadata-${view.municipality.toLowerCase().replace(/\s+/g, '-')}-${year}.csv`,
  });
  link.click();
  URL.revokeObjectURL(url);
}

export function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const municipality = byTce(params.get('municipio'))?.tce ?? DEFAULT_MUNICIPALITY;
  const year = (EXERCISES as readonly string[]).includes(params.get('ano') ?? '') ? params.get('ano')! : '2025';
  const previousYear = String(Number(year) - 1);
  const [goal, setGoal] = useGoal(municipality);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      next.set(key, value);
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const overview = useApi<MunicipalOverview>(`/api/overview?municipio=${municipality}&ano=${year}`);
  const previous = useApi<MunicipalOverview>(`/api/overview?municipio=${municipality}&ano=${previousYear}`);
  const suppliers = useApi<SupplierListResponse>(`/api/suppliers?municipio=${municipality}&ano=${year}`);

  const view = useMemo(() => (overview.data ? overviewView(overview.data) : null), [overview.data]);
  const before = useMemo(
    () => (previous.status === 'ready' ? overviewView(previous.data) : null),
    [previous.status, previous.data],
  );

  return (
    <>
      <PageHeader
        title="Panorama de compras"
        description={`Compras municipais de ${byTce(municipality)?.name ?? '—'} em ${year}, com foco na participação de pequenos negócios.`}
        badge={<SourceBadge source={overview.status === 'ready' ? overview.source : null} reason={overview.status === 'ready' ? overview.reason : undefined} />}
        actions={
          <>
            <Select
              label="Município"
              value={municipality}
              onChange={(value) => setParam('municipio', value)}
              options={MUNICIPALITIES.map((item) => ({ value: item.tce, label: item.name }))}
              icon={<MapPin />}
              className="w-48"
            />
            <Segmented
              label="Exercício"
              value={year}
              onChange={(value) => setParam('ano', value)}
              options={EXERCISES.slice(0, 4).map((value) => ({ value, label: value }))}
            />
            <Button variant="primary" onClick={() => view && downloadCsv(view, year)} disabled={!view}>
              <Download />
              Exportar
            </Button>
          </>
        }
      />

      {overview.status === 'error' ? (
        <div className="card card-body flex flex-col items-center gap-3 rounded-[14px] px-6 py-16 text-center">
          <AlertTriangle className="size-6 text-[var(--tag-rose-fg)]" />
          <p className="font-medium">Não foi possível carregar o panorama.</p>
          <p className="max-w-md text-[13px] text-muted">{overview.message}</p>
          <Button variant="outline" onClick={overview.retry}>
            <RotateCw /> Tentar novamente
          </Button>
        </div>
      ) : !view ? (
        <DashboardSkeleton />
      ) : (
        <div className={overview.status === 'loading' ? 'pointer-events-none opacity-60 transition-opacity' : 'transition-opacity'}>
          {view.missing.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--tag-amber-bg)] bg-[var(--tag-amber-bg)]/50 px-4 py-2.5 text-[12.5px] text-[var(--tag-amber-fg)]">
              <CalendarDays className="size-4" />
              Competências ainda não publicadas: {view.missing.join(', ')}.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <TargetCard view={view} goal={goal} onGoalChange={setGoal} />
            <KpiCard label="Total de compras" icon={<Wallet />} value={view.total} format={compactMoney} change={delta(view.total, before?.total)} />
            <KpiCard label="Compras com ME" icon={<Building2 />} value={view.meTotal} format={compactMoney} change={delta(view.meTotal, before?.meTotal)} />
            <KpiCard
              label="Empenhos analisados"
              icon={<FileText />}
              value={view.commitments}
              format={(value) => count(Math.round(value))}
              change={null}
              footer={<CommitmentsFooter view={view} />}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SizeDonut view={view} />
            <ExpenseBars view={view} />
            <DestinationPipeline view={view} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <MonthlyArea
                view={view}
                action={
                  <div className="hidden gap-3 text-[12px] text-muted sm:flex">
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--data-1)]" />Total</span>
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--data-2)]" />Microempresas</span>
                    {view.localPercent !== null && <span>· local {percent(view.localPercent)}</span>}
                  </div>
                }
              />
            </div>
            <PeriodReading view={view} />
          </div>

          <div className="mt-3">
            <SuppliersTable
              items={suppliers.data?.items ?? []}
              total={suppliers.data?.pagination.total_items ?? null}
              loading={suppliers.status === 'loading'}
              badge={suppliers.status === 'ready' && suppliers.source === 'demo' ? <SourceBadge source="demo" /> : undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando panorama">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton h-[132px] rounded-[14px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="skeleton h-[380px] rounded-[14px]" />
        ))}
      </div>
      <div className="skeleton h-[330px] rounded-[14px]" />
    </div>
  );
}
