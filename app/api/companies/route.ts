import { REGISTERED_COMPANIES } from '@/lib/mock/companies';
import { sourced } from '@/lib/server/backend';

/** O backend ainda não expõe empresas geolocalizadas: a rota serve dados de demonstração. */
export function GET() {
  return sourced(REGISTERED_COMPANIES, 'demo', 'Empresas fictícias para demonstração do mapa');
}
