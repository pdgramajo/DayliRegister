import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BranchList } from '../BranchList'
import branchReducer from '../../../store/branchSlice'

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      branches: branchReducer,
    },
    preloadedState,
  })

describe('BranchList', () => {
  it('should show loading state', () => {
    const store = createTestStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: true,
        error: null,
      },
    })

    const { container } = render(
      <Provider store={store}>
        <BranchList />
      </Provider>
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show loading when fetching branches', () => {
    const store = createTestStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: true,
        error: null,
      },
    })

    const { container } = render(
      <Provider store={store}>
        <BranchList />
      </Provider>
    )

    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })
})
