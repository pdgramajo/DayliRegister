import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createLoggedAsyncThunk } from '../lib/createLoggedAsyncThunk'
import { ProductService } from '../services/ProductService'
import type { Product } from '../types/entities'
import type { CreateProductDTO, UpdateProductDTO } from '../types/dtos'

interface ProductState {
  products: Product[]
  currentProduct: Product | null
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
}

export const fetchProductsByBranch = createLoggedAsyncThunk(
  'products/fetchByBranch',
  async (branchId: string) => {
    return await ProductService.getProductsByBranch(branchId)
  },
  'Error al cargar los productos'
)

export const fetchProductById = createLoggedAsyncThunk(
  'products/fetchById',
  async (id: string) => {
    return await ProductService.getProductById(id)
  },
  'Error al cargar el producto'
)

export const createProduct = createLoggedAsyncThunk(
  'products/create',
  async (data: CreateProductDTO) => {
    return await ProductService.createProduct(data)
  },
  'Error al crear el producto'
)

export const updateProduct = createLoggedAsyncThunk(
  'products/update',
  async ({ id, data }: { id: string; data: UpdateProductDTO }) => {
    return await ProductService.updateProduct(id, data)
  },
  'Error al actualizar el producto'
)

export const deleteProduct = createLoggedAsyncThunk(
  'products/delete',
  async (id: string) => {
    await ProductService.deleteProduct(id)
    return id
  },
  'Error al eliminar el producto'
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchProductsByBranch.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.isLoading = false
          state.products = action.payload
        }
      )
      .addCase(fetchProductsByBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.isLoading = false
          state.currentProduct = action.payload
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.isLoading = false
          state.products.push(action.payload)
        }
      )
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        updateProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.isLoading = false
          const index = state.products.findIndex(
            (p) => p.id === action.payload.id
          )
          if (index !== -1) {
            state.products[index] = action.payload
          }
          if (state.currentProduct?.id === action.payload.id) {
            state.currentProduct = action.payload
          }
        }
      )
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.products = state.products.filter((p) => p.id !== action.payload)
        }
      )
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
