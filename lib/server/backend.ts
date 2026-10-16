import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { DataSource } from '../types';

export const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3333';
const TIMEOUT_MS = Number(process.env.BACKEND_TIMEOUT_MS) || 30_000;
const DEMO_ONLY = process.env.LICITADATA_DEMO === '1';

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

type Tokens = { accessToken: string; refreshToken: string };

export type BackendResult<T> =
  | { kind: 'ok'; data: T; requestId?: string }
  | { kind: 'client-error'; status: number; body: unknown }
  | { kind: 'unavailable'; reason: string };

export async function setSessionCookies(tokens: Tokens) {
  const store = await cookies();
  const base = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  store.set('access_token', tokens.accessToken, { ...base, maxAge: ACCESS_MAX_AGE });
  store.set('refresh_token', tokens.refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
}

async function call(path: string, init: RequestInit, accessToken?: string) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function refresh(refreshToken: string): Promise<Tokens | null> {
  try {
    const response = await call('/sessions/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    if (!response.ok) return null;
    const tokens = (await response.json()) as Tokens;
    await setSessionCookies(tokens);
    return tokens;
  } catch {
    return null;
  }
}

/**
 * Chama o backend NestJS repassando a sessão do usuário (cookies httpOnly).
 * Erros de validação (4xx) voltam para a tela; indisponibilidade e falta de sessão
 * são sinalizadas para que a rota use os dados de demonstração de forma explícita.
 */
export async function backend<T>(path: string, init: RequestInit = {}): Promise<BackendResult<T>> {
  if (DEMO_ONLY) return { kind: 'unavailable', reason: 'Modo demonstração ativo' };

  const store = await cookies();
  let accessToken = store.get('access_token')?.value;
  const refreshToken = store.get('refresh_token')?.value;

  try {
    let response = await call(path, init, accessToken);
    if (response.status === 401 && refreshToken) {
      const tokens = await refresh(refreshToken);
      if (tokens) {
        accessToken = tokens.accessToken;
        response = await call(path, init, accessToken);
      }
    }

    if (response.ok) {
      return {
        kind: 'ok',
        data: (await response.json()) as T,
        requestId: response.headers.get('x-request-id') ?? undefined,
      };
    }
    if (response.status === 401 || response.status === 403) {
      return { kind: 'unavailable', reason: 'Entre na sua conta para ver dados reais' };
    }
    if (response.status >= 500) {
      return { kind: 'unavailable', reason: 'Serviço de dados temporariamente indisponível' };
    }
    return { kind: 'client-error', status: response.status, body: await response.json().catch(() => null) };
  } catch {
    return { kind: 'unavailable', reason: 'Backend fora do ar' };
  }
}

export function sourced(body: unknown, source: DataSource, reason?: string, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set('x-data-source', source);
  if (reason) response.headers.set('x-data-source-reason', encodeURIComponent(reason));
  response.headers.set('cache-control', 'private, no-store');
  return response;
}

/** Resolve a resposta: dado real, erro de validação ou demonstração. */
export function liveOrDemo<T>(result: BackendResult<T>, demo: () => unknown) {
  if (result.kind === 'ok') return sourced(result.data, 'live');
  if (result.kind === 'client-error') return sourced(result.body, 'live', undefined, result.status);
  return sourced(demo(), 'demo', result.reason);
}
