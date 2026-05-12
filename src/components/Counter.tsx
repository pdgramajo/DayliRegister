import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { increment, decrement } from '../store/counterSlice'

const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  )
}

export default Counter