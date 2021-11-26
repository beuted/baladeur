import { Place } from "../constants/Places";

// State
type PositionState = {
  position: { latitude: number, longitude: number };
  destination: { latitude: number, longitude: number };
  orientationToFollow: number;
  parcours: Place[],
  knownPlaces: number[] // List of place Ids
}

// Initial State
const initialState: PositionState = {
  position: { latitude: 0, longitude: 0 },
  destination: { latitude: 0, longitude: 0 },
  orientationToFollow: 0,
  parcours: [],
  knownPlaces: []
}

// Reducer
export const PositionReducer = (state: PositionState = initialState, action: PositionActions) => {
  switch (action.type) {
    case 'SET_POSITION':
      return {
        ...state,
        position: action.payload,
      }
    case 'SET_DESTINATION':
      return {
        ...state,
        destination: Object.assign({}, action.payload),
      }
    case 'SET_PARCOURS':
      return {
        ...state,
        parcours: action.payload,
      }
    case 'POP_LAST_POINT_PARCOURS':
      return {
        ...state,
        parcours: state.parcours.slice(1),
      }
    case 'SET_KNOWN_PLACE':
      return {
        ...state,
        knownPlaces: [...state.knownPlaces, action.payload],
      }
    default:
      return state;
  }
}

// Actions
export interface ISetPositonAction {
  readonly type: 'SET_POSITION';
  payload: { latitude: number, longitude: number };
}


export interface ISetDestinationAction {
  readonly type: 'SET_DESTINATION';
  payload: { latitude: number, longitude: number };
}

export interface ISetParcoursAction {
  readonly type: 'SET_PARCOURS';
  payload: Place[];
}

export interface IPopLastPointParcoursAction {
  readonly type: 'POP_LAST_POINT_PARCOURS';
  payload: any;
}

export interface ISetKnowPlaceAction {
  readonly type: 'SET_KNOWN_PLACE';
  payload: number;
}

export type PositionActions =
  | ISetPositonAction
  | ISetDestinationAction
  | ISetParcoursAction
  | IPopLastPointParcoursAction
  | ISetKnowPlaceAction