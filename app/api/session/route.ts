import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_URL, setSessionCookies } from '@/lib/server/backend';

export async function GET() {
  const store = await cookies();
  const authenticated = Boolean(store.get('access_token')?.value || store.get('refresh_token')?.value);
  return NextResponse.json({ authenticated }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) {
    return NextResponse.json({ error: { message: 'Informe e-mail e senha.' } }, { status: 400 });
  }
  try {
    const response = await fetch(`${BACKEND_URL}/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = (await response.json().catch(() => null)) as
      | { accessToken?: string; refreshToken?: string; error?: { message?: string }; message?: string }
      | null;
    if (!response.ok || !payload?.accessToken || !payload.refreshToken) {
      const message = payload?.error?.message ?? payload?.message ?? 'E-mail ou senha inválidos.';
      return NextResponse.json({ error: { message } }, { status: response.ok ? 502 : response.status });
    }
    await setSessionCookies({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json(
      { error: { message: 'Não foi possível conectar ao servidor. Tente novamente em instantes.' } },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  const accessToken = store.get('access_token')?.value;
  if (accessToken) {
    await fetch(`${BACKEND_URL}/sessions/current`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined);
  }
  store.delete('access_token');
  store.delete('refresh_token');
  return new NextResponse(null, { status: 204 });
}
