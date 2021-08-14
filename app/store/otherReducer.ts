// State
type CountState = {
  count: number;
}

// Initial State
const initialState: CountState = {
  count: 0,
}

// Reducer
export const OtherReducer = (state: CountState = initialState, action: OrientationActions) => {
  switch (action.type) {
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1,
      }
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1,
      }
    default:
      return state;
  }
}

// Actions
export interface IIncrementCountAction {
  readonly type: 'INCREMENT';
}
export interface IDecrementCountAction {
  readonly type: 'DECREMENT';
}
export type OrientationActions =
  | IIncrementCountAction
  | IDecrementCountAction