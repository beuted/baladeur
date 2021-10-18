import places, { Coord, Place, ComparePlaces, GetHash } from "../constants/Places";

export class ParcoursService {
  private static lengthClosestPlacesList = 10;

  private static graph: { [placeIndex: number]: { placeIndex: number, closestPlacesIndex: number[] } } = []

  public static initGraph() {
    for (var i = 0; i < places.paris.length; i++) {
      var placePositon = places.paris[i].position;
      var closestPlacesIndex: number[] = []
      for (var closePlaceId = 0; closePlaceId < ParcoursService.lengthClosestPlacesList; closePlaceId++) {
        let minDistance: number = +Infinity;
        var closestsPlaceIndex = -1;

        for (var j = 0; j < places.paris.length; j++) {
          if (i == j || closestPlacesIndex.includes(j))
            continue;
          var distance = computeSquareDistance(placePositon, places.paris[j].position)
          if (distance < minDistance) {
            minDistance = distance;
            closestsPlaceIndex = j;
          }
        }

        closestPlacesIndex.push(closestsPlaceIndex);
      }

      ParcoursService.graph[i] = { placeIndex: i, closestPlacesIndex: closestPlacesIndex };
      console.log({ placeIndex: i, closestPlacesIndex: closestPlacesIndex });
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
    console.log('yup');


    let clostestStartPlaceIndex = ParcoursService.findClosestPlace(startingPoint);
    let clostestEndPlaceIndex = ParcoursService.findClosestPlace(endingPoint);

    // Mark all the vertices as not visited(By default set as false)
    let visited: { [k: number]: boolean } = {};

    const queue: number[] = [];
    queue.push(clostestStartPlaceIndex);
    visited[clostestStartPlaceIndex] = true;

    console.log(queue);

    while (queue.length != 0) {
      // Dequeue a vertex from queue and see if we reached the end
      let placeIndex = queue.shift() as number;

      if (placeIndex == clostestEndPlaceIndex)
        return [...queue, placeIndex]; // We just need to add back the last element we just popped (I think)

      // If not queue one of the closest points
      console.log("> " + ParcoursService.graph[placeIndex].closestPlacesIndex.length);

      for (let i = 0; i < ParcoursService.graph[placeIndex].closestPlacesIndex.length; i++) {
        const closestPlaceIndex = ParcoursService.graph[placeIndex].closestPlacesIndex[i];

        if (!visited[closestPlaceIndex]) {
          queue.push(closestPlaceIndex);
          visited[closestPlaceIndex] = true;
        }
      }
    }

    return null;
  }
}

function computeSquareDistance(placePositon: Coord, position: Coord): number {
  return Math.pow(placePositon.longitude - position.longitude, 2) + Math.pow(placePositon.latitude - position.latitude, 2);
}
