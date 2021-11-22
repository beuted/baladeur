export const SQRT2BY2 = 0.7071067811865476;

export type Coord = {
  latitude: number, longitude: number
}

export function normalize(vec: Coord): Coord {
  const norme = Math.sqrt(vec.latitude * vec.latitude + vec.longitude * vec.longitude);
  return {
    latitude: vec.latitude / norme,
    longitude: vec.longitude / norme
  }
}

export function getVector(a: Coord, b: Coord): Coord {
  return {
    latitude: b.latitude - a.latitude,
    longitude: b.longitude - a.longitude
  }
}