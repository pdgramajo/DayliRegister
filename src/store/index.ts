import { configureStore } from '@reduxjs/toolkit'
import branchReducer from './branchSlice'
import sessionReducer from './sessionSlice'
import transactionReducer from './transactionSlice'

export const store = configureStore({
  reducer: {
    branches: branchReducer,
    sessions: sessionReducer,
    transactions: transactionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
