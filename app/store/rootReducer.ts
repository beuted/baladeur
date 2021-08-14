import { combineReducers } from 'redux'
import { OtherReducer } from './otherReducer'
import { PositionReducer } from './positionReducer';
const rootReducer = combineReducers({
  other: OtherReducer,
  position: PositionReducer,
})
export type AppState = ReturnType<typeof rootReducer>
export default rootReducer;