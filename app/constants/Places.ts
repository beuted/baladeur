import { Coord } from "./Maths";

export type Place = {
  id: number,
  name: string,
  description: string | null,
  position: Coord,
  picture: string | null
}

export function ComparePlaces(p1: Place, p2: Place) {
  return p1.position.latitude == p2.position.latitude && p1.position.longitude == p2.position.longitude;
}

export function GetHash(p1: Place): string {
  return p1.position.latitude + '|' + p1.position.longitude;
}

const places: { paris: { [id: number]: Place } } = {
  paris: {
    0: {
      id: 0,
      name: "Chez Emilie",
      description: "Balcon sympa mais les voisins pas ouf",
      position: { latitude: 48.85610244323937, longitude: 2.375886340604116 },
      picture: require('../assets/images/Cite-Dupont-Balade.jpg')
    },
    1: {
      id: 1,
      name: "Chez Boris",
      description: "Coin un peu bruyant ferait mieux d'aller dans le 11e",
      position: { latitude: 48.86667014969286, longitude: 2.346389637750524 },
      picture: require('../assets/images/Cite-Dupont-Balade.jpg')
    }
  }
}

const maxLength = 2;

// Adding a bit more adresses ot test stuff
for (let i = 0; i < 40; i++) {
  for (let j = 0; j < 40; j++) {
    const id = maxLength + i * 40 + j;
    places.paris[id] =
    {
      id: id,
      name: "Random " + i + "-" + j,
      description: null,
      position: { longitude: 2.2 + j * 0.006, latitude: 48.7 + i * 0.006, },
      picture: require('../assets/images/Cite-Dupont-Balade.jpg')
    };
  }
}

export default places;