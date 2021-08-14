// State
type PositionState = {
  position: { latitude: number, longitude: number };
  destination: { latitude: number, longitude: number };
  orientationToFollow: number;
}

// Initial State
const initialState: PositionState = {
  position: { latitude: 0, longitude: 0 },
  destination: { latitude: 0, longitude: 0 },
  orientationToFollow: 0
}

// Reducer
export const PositionReducer = (state: PositionState = initialState, action: PositionActions) => {
  switch (action.type) {
    case 'SET_POSITION':
      return {
        ...state,
        position: action.payload,
      };
    case 'SET_DESTINATION':
      return {
        ...state,
        destination: Object.assign({}, action.payload),
      };
    case 'SET_ORIENTATION_TO_FOLLOW':
      return {
        ...state,
        orientationToFollow: action.payload,
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

export interface ISetOrientationAction {
  readonly type: 'SET_ORIENTATION_TO_FOLLOW';
  payload: number;
}

export interface ISetDestinationAction {
  readonly type: 'SET_DESTINATION';
  payload: { latitude: number, longitude: number };
}

export type PositionActions =
  | ISetPositonAction
  | ISetOrientationAction
  | ISetDestinationAction