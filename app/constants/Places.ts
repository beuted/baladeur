export type Coord = {
  latitude: number, longitude: number
}

export type Place = {
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
      name: "Chez Emilie",
      description: "Balcon sympa mais les voisins pas ouf",
      position: { latitude: 48.85610244323937, longitude: 2.375886340604116 },
      pictureUrls: []
    },
    {
      name: "Chez Boris",
      description: "Coin un peu bruyant ferait mieux d'aller dans le 11e",
      position: { latitude: 48.86667014969286, longitude: 2.346389637750524 },
      pictureUrls: []
    }
  ]
}

// Adding a bit more adresses ot test stuff
for (let i = 0; i < 40; i++) {
  let xRand = Math.random();
  let yRand = Math.random();
  places.paris.push(
    {
      name: "Random " + i,
      description: null,
      position: { latitude: 48 + xRand, longitude: 2 + yRand },
      pictureUrls: []
    })
}

export default places;