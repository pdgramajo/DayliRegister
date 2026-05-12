import { configureStore } from '@reduxjs/toolkit'
import branchReducer from './branchSlice'

export const store = configureStore({
  reducer: {
    branches: branchReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
