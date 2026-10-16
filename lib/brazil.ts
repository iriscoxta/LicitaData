/** Contorno simplificado do Brasil [lng, lat] — suficiente para o mapa pontilhado decorativo. */
export const BRAZIL_OUTLINE: Array<[number, number]> = [
  [-51.6, 4.2], [-50.0, 1.8], [-48.5, -0.5], [-44.5, -2.4], [-41.0, -2.9], [-38.5, -3.7], [-35.2, -5.2],
  [-34.8, -7.2], [-35.7, -9.6], [-37.1, -11.0], [-38.5, -13.0], [-39.0, -17.5], [-40.3, -20.3], [-42.0, -22.9],
  [-44.6, -23.4], [-46.5, -24.0], [-48.5, -26.0], [-48.6, -28.5], [-50.2, -30.5], [-52.1, -32.2], [-53.4, -33.7],
  [-53.6, -32.4], [-55.6, -30.9], [-57.6, -30.2], [-56.0, -28.0], [-54.6, -25.6], [-55.7, -22.6], [-57.9, -22.1],
  [-58.2, -19.8], [-58.0, -16.3], [-60.2, -16.0], [-60.4, -13.5], [-62.2, -12.8], [-65.3, -11.0], [-65.4, -9.8],
  [-68.6, -11.0], [-70.6, -11.0], [-73.9, -7.3], [-72.9, -5.2], [-70.0, -4.2], [-69.4, -1.2], [-69.9, 1.7],
  [-67.3, 2.0], [-66.9, 1.2], [-63.4, 2.2], [-64.0, 4.0], [-60.7, 5.2], [-59.6, 1.4], [-58.0, 1.5], [-56.0, 2.0],
  [-54.0, 2.3], [-52.4, 2.3],
];

export const BRAZIL_BOUNDS = { minLng: -74.5, maxLng: -34.2, minLat: -34.2, maxLat: 5.8 };

function inside([x, y]: [number, number], polygon: Array<[number, number]>) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) result = !result;
  }
  return result;
}

/** Pontos de uma grade regular que caem dentro do contorno. */
export function brazilDots(step: number): Array<[number, number]> {
  const dots: Array<[number, number]> = [];
  const { minLng, maxLng, minLat, maxLat } = BRAZIL_BOUNDS;
  for (let lat = maxLat; lat >= minLat; lat -= step) {
    for (let lng = minLng; lng <= maxLng; lng += step) {
      if (inside([lng, lat], BRAZIL_OUTLINE)) dots.push([lng, lat]);
    }
  }
  return dots;
}

/** Cidades com destaque no mapa decorativo. */
export const HIGHLIGHT_CITIES: Array<[number, number]> = [
  [-38.53, -3.73], [-39.83, -3.36], [-40.35, -3.69], [-39.32, -7.21], [-34.88, -8.05], [-38.5, -12.97],
  [-46.63, -23.55], [-43.17, -22.91], [-47.88, -15.79], [-60.02, -3.12], [-48.49, -1.46], [-49.27, -25.43],
  [-51.22, -30.03], [-43.93, -19.92], [-42.8, -5.09], [-35.21, -5.79], [-44.3, -2.53], [-49.26, -16.69],
];
