import { Coord, getVector, normalize, SQRT2BY2 } from "../constants/Maths";
import places from "../constants/Places";

export class ParcoursService {
  private static lengthClosestPlacesList = 10;

  private static graph: { [placeIndex: number]: { placeIndex: number, distanceToPlaces: { [id: number]: number } } } = []

  public static initGraph() {
    for (var i = 0; i < places.paris.length; i++) {
      var placePositon = places.paris[i].position;
      var distanceToPlaces: { [id: number]: number } = {}
      for (var closePlaceId = 0; closePlaceId < places.paris.length; closePlaceId++) {
        if (closePlaceId == i)
          continue;

        var distance = computeSquareDistance(placePositon, places.paris[closePlaceId].position)

        distanceToPlaces[closePlaceId] = distance;
      }

      ParcoursService.graph[i] = { placeIndex: i, distanceToPlaces: distanceToPlaces };
    }
  }

  public static findClosestPlace(coord: Coord) {
    let minDistance: number = +Infinity;
    let closestIndex = 0;
    for (var j = 0; j < places.paris.length; j++) {
      var distance = computeSquareDistance(coord, places.paris[j].position)
      if (distance < minDistance) {
        closestIndex = j
        minDistance = distance;
      }
    }
    return closestIndex;
  }

  /// Return a parcours from starting point to the endpoint as a list of Place index.
  /// Note that the start and end points will be choosen as the closest points to the start and end objective.
  public static generateParcours(startingPoint: Coord, endingPoint: Coord | null = null): number[] | null {
    if (!endingPoint) {
      console.log('nop');

      // endingPoint = startingPoint; //TODO will not work ATM
      return null;
    }

    let clostestStartPlaceIndex = ParcoursService.findClosestPlace(startingPoint);
    let clostestEndPlaceIndex = ParcoursService.findClosestPlace(endingPoint);
    console.log('yup', places.paris[clostestStartPlaceIndex].position, places.paris[clostestEndPlaceIndex].position);

    // Mark all the vertices as not visited(By default set as false)
    let visited: { [k: number]: boolean } = {};

    const queue: number[] = [];
    queue.push(clostestStartPlaceIndex);
    visited[clostestStartPlaceIndex] = true;

    while (true) {
      let minDistance = +Infinity;
      let nextPlaceIndex = null;

      for (var i = 0; i < places.paris.length; i++) {
        const currentPlace = places.paris[i];
        if (visited[i]) {
          continue;
        }
        const lastPointIndex = queue[queue.length - 1];

        // End condition when we reach the end place
        if (lastPointIndex == clostestEndPlaceIndex) {
          queue.push(clostestEndPlaceIndex);
          return queue;
        }

        const A = places.paris[lastPointIndex].position;
        const B = places.paris[clostestEndPlaceIndex].position;
        const C = currentPlace.position;
        const ABNormalized = normalize(getVector(A, B));
        const ACNormalized = normalize(getVector(A, C));

        const h = crossProduct(ABNormalized, ACNormalized);
        const angle = Math.acos(h);

        const shootAngle = Math.PI / 8
        if (angle < shootAngle && angle > -shootAngle) {
          let distance = ParcoursService.graph[lastPointIndex].distanceToPlaces[i];
          if (distance < minDistance) {
            minDistance = distance;
            nextPlaceIndex = i;
          }
        }
      }

      if (nextPlaceIndex == null) {
        console.log("this should never happen");
        return queue;
      }

      visited[nextPlaceIndex] = true;
      queue.push(nextPlaceIndex);

      console.log("Node " + places.paris[nextPlaceIndex].position.longitude + ", " + places.paris[nextPlaceIndex].position.latitude)
    }

    return null;
  }
}

function computeSquareDistance(placePositon: Coord, position: Coord): number {
  return Math.pow(placePositon.longitude - position.longitude, 2) + Math.pow(placePositon.latitude - position.latitude, 2);
}

function crossProduct(v0: Coord, v1: Coord) {
  return ((v0.latitude * v1.latitude) + (v0.longitude * v1.longitude));
}
