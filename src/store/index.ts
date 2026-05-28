import { configureStore } from '@reduxjs/toolkit'
import branchReducer from './branchSlice'
import sessionReducer from './sessionSlice'
import transactionReducer from './transactionSlice'
import productReducer from './productSlice'
import clientReducer from './clientSlice'

export const store = configureStore({
  reducer: {
    branches: branchReducer,
    sessions: sessionReducer,
    transactions: transactionReducer,
    products: productReducer,
    clients: clientReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
