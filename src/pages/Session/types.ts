import { TABS, FILTERS } from '../../constants/session'

export type TabType = (typeof TABS)[keyof typeof TABS]
export type TransactionFilter = (typeof FILTERS)[keyof typeof FILTERS]
