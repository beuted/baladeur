import { Coord, getVector, normalize, SQRT2BY2 } from "../constants/Maths";
import places from "../constants/Places";

export class ParcoursService {
  private static maxShootAngle = Math.PI / 4

  private static graph: { [placeIndex: number]: { placeIndex: number, distanceToPlaces: { [id: number]: number } } } = []

  public static initGraph() {
    for (var i = 0; i < Object.keys(places.paris).length; i++) {
      var placePositon = places.paris[i].position;
      var distanceToPlaces: { [id: number]: number } = {}
      for (var closePlaceId = 0; closePlaceId < Object.keys(places.paris).length; closePlaceId++) {
        if (closePlaceId == i)
          continue;

        var distance = computeSquareDistance(placePositon, places.paris[closePlaceId].position)

        distanceToPlaces[closePlaceId] = distance;
      }

      ParcoursService.graph[i] = { placeIndex: i, distanceToPlaces: distanceToPlaces };
    }
  }

  public static findClosestPlaceInTheRightDirection(startPoint: Coord, endPoint: Coord) {
    let minDistance: number = +Infinity;
    let closestIndex = 0;
    for (var i = 0; i < Object.keys(places.paris).length; i++) {
      const possibleStopPoint = places.paris[i].position;

      const angle = getAngleBetween3Points(startPoint, endPoint, possibleStopPoint);

      if (angle < ParcoursService.maxShootAngle && angle > -ParcoursService.maxShootAngle) {
        let distance = computeSquareDistance(startPoint, possibleStopPoint);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
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

    let clostestStartPlaceIndex = ParcoursService.findClosestPlaceInTheRightDirection(startingPoint, endingPoint);
    let clostestEndPlaceIndex = ParcoursService.findClosestPlaceInTheRightDirection(endingPoint, startingPoint);

    // Mark all the vertices as not visited(By default set as false)
    let visited: { [k: number]: boolean } = {};

    const queue: number[] = [];
    queue.push(clostestStartPlaceIndex);
    visited[clostestStartPlaceIndex] = true;

    while (true) {
      let minDistance = +Infinity;
      let nextPlaceIndex = null;

      for (var i = 0; i < Object.keys(places.paris).length; i++) {
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

        const startPoint = places.paris[lastPointIndex].position;
        const endPoint = places.paris[clostestEndPlaceIndex].position;
        const possibleStopPoint = currentPlace.position;

        const angle = getAngleBetween3Points(startPoint, endPoint, possibleStopPoint);

        if (angle < ParcoursService.maxShootAngle && angle > -ParcoursService.maxShootAngle) {
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

function getAngleBetween3Points(A: Coord, B: Coord, C: Coord) {
  const ABNormalized = normalize(getVector(A, B));
  const ACNormalized = normalize(getVector(A, C));

  const h = crossProduct(ABNormalized, ACNormalized);
  return Math.acos(h);
}
