import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PaymentMethod } from '../types/entities'
import { Entities } from '../types/entities'

interface UIState {
  lastPaymentMethod: PaymentMethod
}

const initialState: UIState = {
  lastPaymentMethod: Entities.PaymentMethods.CASH,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLastPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.lastPaymentMethod = action.payload
    },
  },
})

export const { setLastPaymentMethod } = uiSlice.actions
export default uiSlice.reducer
