'use client';

import { useEffect, useRef, useState } from 'react';
import type { DataSource } from './types';

export type ApiState<T> =
  | { status: 'loading'; data: T | null; source: DataSource | null; reason?: string }
  | { status: 'ready'; data: T; source: DataSource; reason?: string }
  | { status: 'error'; data: T | null; source: DataSource | null; message: string };

function readMessage(body: unknown): string {
  if (body && typeof body === 'object') {
    const candidate = body as { error?: { message?: string }; message?: string };
    return candidate.error?.message ?? candidate.message ?? 'Não foi possível carregar os dados.';
  }
  return 'Não foi possível carregar os dados.';
}

/** Busca um recurso do BFF e expõe a origem (dados reais ou demonstração). */
export function useApi<T>(url: string | null, init?: { method?: 'POST'; body?: unknown }) {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading', data: null, source: null });
  const [nonce, setNonce] = useState(0);
  const body = init?.body === undefined ? undefined : JSON.stringify(init.body);
  const previous = useRef<T | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setState({ status: 'loading', data: previous.current, source: null });
    fetch(url, {
      method: init?.method ?? 'GET',
      body,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      signal: controller.signal,
    })
      .then(async (response) => {
        const json: unknown = await response.json().catch(() => null);
        const source = (response.headers.get('x-data-source') as DataSource | null) ?? 'live';
        const reasonHeader = response.headers.get('x-data-source-reason');
        if (!response.ok) {
          setState({ status: 'error', data: null, source, message: readMessage(json) });
          return;
        }
        previous.current = json as T;
        setState({
          status: 'ready',
          data: json as T,
          source,
          reason: reasonHeader ? decodeURIComponent(reasonHeader) : undefined,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          data: null,
          source: null,
          message: error instanceof Error ? error.message : 'Falha de conexão.',
        });
      });
    return () => controller.abort();
  }, [url, body, init?.method, nonce]);

  return { ...state, retry: () => setNonce((value) => value + 1) };
}
