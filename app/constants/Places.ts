import { Coord } from "./Maths";

export type Place = {
  id: number,
  name: string,
  description: string | null,
  position: Coord,
  pictureUrls: string[]
}

export function ComparePlaces(p1: Place, p2: Place) {
  return p1.position.latitude == p2.position.latitude && p1.position.longitude == p2.position.longitude;
}

export function GetHash(p1: Place): string {
  return p1.position.latitude + '|' + p1.position.longitude;
}

const places: { paris: Place[] } = {
  paris: [
    {
      id: 0,
      name: "Chez Emilie",
      description: "Balcon sympa mais les voisins pas ouf",
      position: { latitude: 48.85610244323937, longitude: 2.375886340604116 },
      pictureUrls: []
    },
    {
      id: 1,
      name: "Chez Boris",
      description: "Coin un peu bruyant ferait mieux d'aller dans le 11e",
      position: { latitude: 48.86667014969286, longitude: 2.346389637750524 },
      pictureUrls: []
    }
  ]
}

const maxLength = places.paris.length;

// Adding a bit more adresses ot test stuff
for (let i = 0; i < 40; i++) {
  for (let j = 0; j < 40; j++) {
    places.paris.push(
      {
        id: maxLength + i * 40 + j,
        name: "Random " + i + "-" + j,
        description: null,
        position: { longitude: 2.2 + j * 0.006, latitude: 48.7 + i * 0.006, },
        pictureUrls: []
      })
  }
}

export default places;