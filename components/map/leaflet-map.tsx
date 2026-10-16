'use client';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { compactMoney, count, formatDate } from '@/lib/format';
import type { RegisteredCompany } from '@/lib/types';

export const SIZE_COLORS: Record<RegisteredCompany['size'], string> = {
  MEI: '#2bb3a3',
  ME: '#3fb86f',
  EPP: '#3a9be0',
  DEMAIS: '#8b6cf0',
};
const SIZE_LABEL: Record<RegisteredCompany['size'], string> = { MEI: 'MEI', ME: 'ME', EPP: 'EPP', DEMAIS: 'Demais' };
const STATUS_LABEL: Record<RegisteredCompany['status'], string> = {
  ATIVA: 'Ativa',
  EM_ANALISE: 'Em análise',
  PENDENTE: 'Pendente',
};

const TILES = {
  light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  lightLabels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  darkLabels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
};
const ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap';

export interface CityCluster {
  key: string;
  uf: string;
  city: string;
  lat: number;
  lng: number;
  companies: RegisteredCompany[];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function popupHtml(company: RegisteredCompany) {
  const color = SIZE_COLORS[company.size];
  return `
    <div style="min-width:220px;font-family:inherit">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="background:${color}22;color:${color};border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600">${SIZE_LABEL[company.size]}</span>
        <span style="color:var(--muted);font-size:11px">${STATUS_LABEL[company.status]}</span>
      </div>
      <div style="font-weight:600;font-size:13.5px;color:var(--ink)">${escapeHtml(company.tradeName)}</div>
      <div style="color:var(--muted);font-size:11.5px;font-family:var(--font-geist-mono)">${company.cnpj}</div>
      <div style="color:var(--ink-2);font-size:12px;margin-top:6px">${escapeHtml(company.segment)} · ${escapeHtml(company.city)}/${company.uf}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">
        <div><div style="color:var(--muted);font-size:10.5px">Licitações ganhas</div><div style="font-weight:600;font-size:13px">${count(company.wonBids)}</div></div>
        <div><div style="color:var(--muted);font-size:10.5px">Contratado</div><div style="font-weight:600;font-size:13px">${compactMoney(company.contractedCents)}</div></div>
      </div>
      <div style="color:var(--muted);font-size:10.5px;margin-top:8px">Cadastrada em ${formatDate(company.registeredAt)}</div>
    </div>`;
}

function clusterIcon(cluster: CityCluster, max: number) {
  const size = Math.round(26 + (cluster.companies.length / max) * 30);
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    html: `<div class="ld-cluster" style="width:${size}px;height:${size}px">${cluster.companies.length}</div>`,
  });
}

/**
 * Mapa Leaflet. Sem cidade selecionada, agrega por cidade (bolhas com contagem);
 * com cidade selecionada, mostra cada empresa como um ponto colorido por porte.
 */
export function LeafletMap({
  companies,
  clusters,
  mode,
  focusId,
  selectedId,
  onCluster,
  onCompany,
}: {
  companies: RegisteredCompany[];
  clusters: CityCluster[];
  mode: 'clusters' | 'companies';
  focusId: string | null;
  selectedId: string | null;
  onCluster: (cluster: CityCluster) => void;
  onCompany: (company: RegisteredCompany) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.CircleMarker>());
  const handlers = useRef({ onCluster, onCompany });
  handlers.current = { onCluster, onCompany };

  // Cria o mapa e mantém o fundo sincronizado com o tema.
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      center: [-14.5, -52],
      zoom: 4,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      minZoom: 3,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(instance);
    const isDark = () => document.documentElement.classList.contains('dark');
    // Fundo cinza + camada de rótulos (nomes de cidades e estados) abaixo dos marcadores.
    const labels = instance.createPane('labels');
    labels.style.zIndex = '350';
    labels.style.pointerEvents = 'none';
    const basemap = (dark: boolean) =>
      L.layerGroup([
        L.tileLayer(dark ? TILES.dark : TILES.light, { attribution: ATTRIBUTION, maxZoom: 16 }),
        L.tileLayer(dark ? TILES.darkLabels : TILES.lightLabels, { maxZoom: 16, pane: 'labels' }),
      ]);
    let dark = isDark();
    let tiles = basemap(dark).addTo(instance);
    const observer = new MutationObserver(() => {
      if (isDark() === dark) return;
      dark = isDark();
      tiles.remove();
      tiles = basemap(dark).addTo(instance);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    layer.current = L.layerGroup().addTo(instance);
    map.current = instance;
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => {
      observer.disconnect();
      resize.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);

  // Redesenha marcadores e ajusta o enquadramento quando o filtro muda.
  useEffect(() => {
    const instance = map.current;
    const group = layer.current;
    if (!instance || !group) return;
    group.clearLayers();
    markers.current.clear();

    const points: L.LatLngExpression[] = [];
    if (mode === 'clusters') {
      const max = Math.max(...clusters.map((cluster) => cluster.companies.length), 1);
      clusters.forEach((cluster) => {
        points.push([cluster.lat, cluster.lng]);
        L.marker([cluster.lat, cluster.lng], { icon: clusterIcon(cluster, max), riseOnHover: true })
          .bindTooltip(`<b>${escapeHtml(cluster.city)}</b>/${cluster.uf} · ${cluster.companies.length} empresas`, { direction: 'top', offset: [0, -12] })
          .on('click', () => handlers.current.onCluster(cluster))
          .addTo(group);
      });
    } else {
      companies.forEach((company) => {
        points.push([company.lat, company.lng]);
        const marker = L.circleMarker([company.lat, company.lng], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: SIZE_COLORS[company.size],
          fillOpacity: 0.95,
        })
          .bindPopup(popupHtml(company), { closeButton: false, offset: [0, -4] })
          .on('click', () => handlers.current.onCompany(company))
          .addTo(group);
        markers.current.set(company.id, marker);
      });
    }

    if (points.length === 1) instance.flyTo(points[0]!, mode === 'companies' ? 12 : 9, { duration: 0.8 });
    else if (points.length > 1) instance.flyToBounds(L.latLngBounds(points).pad(0.12), { duration: 0.8, maxZoom: mode === 'companies' ? 13 : 8 });
  }, [companies, clusters, mode]);

  // Destaca a empresa em foco (hover/seleção na lista).
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      const focused = id === focusId;
      marker.setStyle({ radius: focused ? 11 : 7, weight: focused ? 3 : 2 });
      if (focused) marker.bringToFront();
    });
  }, [focusId]);

  // Abre o popup da empresa escolhida na lista.
  useEffect(() => {
    if (!selectedId) return;
    const marker = markers.current.get(selectedId);
    if (!marker || !map.current) return;
    map.current.flyTo(marker.getLatLng(), Math.max(map.current.getZoom(), 13), { duration: 0.6 });
    marker.openPopup();
  }, [selectedId, companies]);

  return <div ref={container} className="size-full" />;
}

