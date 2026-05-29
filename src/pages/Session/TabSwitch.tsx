import type { TabType } from './types'

interface TabSwitchProps {
  activeTab: TabType
  onChange: (tab: TabType) => void
  transactionCount: number
  inventoryCount: number
}

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-white dark:bg-surface-700 text-content-900 dark:text-content-100 font-semibold shadow-sm'
        : 'text-content-500 hover:text-content-700'
    }`}
  >
    {children}
  </button>
)

export const TabSwitch = ({
  activeTab,
  onChange,
  transactionCount,
  inventoryCount,
}: TabSwitchProps) => (
  <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-lg mb-2">
    <TabButton
      active={activeTab === 'movements'}
      onClick={() => onChange('movements')}
    >
      Movimientos ({transactionCount})
    </TabButton>
    <TabButton
      active={activeTab === 'inventory'}
      onClick={() => onChange('inventory')}
    >
      Inventario ({inventoryCount})
    </TabButton>
  </div>
)
