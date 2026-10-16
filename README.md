# LicitaData

Frontend (Next.js 16 · React 19 · Tailwind 4) 
Backend (NestJS na porta 3333).

## Rodar

```bash
npm install
npm run dev   # http://localhost:3100
```

Copie `.env.example` para `.env.local` se o backend não estiver em `http://localhost:3333`.

## Páginas

| Rota        | O que é                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `/`         | Landing: mapa do Brasil em partículas que reage ao cursor, logos das fontes |
| `/painel`   | Panorama municipal (KPIs, porte, despesas, destino, evolução, fornecedores) |
| `/comparar` | Comparação lado a lado (radar + evolução com o outro lado tracejado)     |
| `/mapa`     | Mapa das empresas cadastradas, com filtro por estado e cidade           |
| `/entrar`   | Login com a conta do MonitoraME (`POST /sessions/login`)                |

## Dados: ao vivo ou demonstração

As rotas em `app/api/*` são um BFF: repassam a sessão (cookies httpOnly) para o backend.

| BFF                    | Backend                                   |
| ---------------------- | ----------------------------------------- |
| `GET /api/overview`    | `GET /analytics/tce/overview/munipal`     |
| `POST /api/comparisons`| `POST /analytics/tce/comparisons`         |
| `GET /api/suppliers`   | `GET /analytics/tce/fornecedores`         |
| `GET /api/companies`   | — (ainda não existe: sempre demonstração) |

Se o backend estiver fora do ar, responder 401/403 (sem login) ou 5xx, a rota devolve dados de
demonstração determinísticos (`lib/mock/*`) e marca a resposta com `x-data-source: demo`. A tela
mostra a pílula **Demonstração** com o motivo; com dados reais aparece **Dados ao vivo**.
`LICITADATA_DEMO=1` força o modo demonstração.

O mapa usa empresas fictícias (`lib/mock/companies.ts`). Quando o backend expuser a listagem de
empresas com cidade/UF/coordenadas, basta trocar a fonte em `app/api/companies/route.ts`
mantendo o contrato `RegisteredCompany` de `lib/types.ts`.

## Marca

A logo (`components/ui/logo.tsx`) é provisória. As cores ficam em `app/globals.css` (tokens em `:root` e `.dark`).
