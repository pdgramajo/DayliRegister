import { createAsyncThunk } from '@reduxjs/toolkit'
import { LoggerService } from '../services/LoggerService'

/**
 * Wraps createAsyncThunk to automatically log all errors via LoggerService.
 *
 * The payload creator does NOT receive rejectWithValue — the wrapper
 * handles rejection + logging centrally. Use the optional `errorMessage`
 * parameter for a user-facing message (defaults to error.message).
 */
export function createLoggedAsyncThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: (arg: ThunkArg) => Promise<Returned>,
  errorMessage?: string
) {
  return createAsyncThunk<Returned, ThunkArg, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        return await payloadCreator(arg)
      } catch (error) {
        const msg =
          errorMessage ??
          (error instanceof Error ? error.message : 'Error desconocido')
        await LoggerService.error(`[${typePrefix}] ${msg}`, typePrefix, error)
        return rejectWithValue(msg)
      }
    }
  )
}
