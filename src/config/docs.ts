import {
  Rocket,
  Store,
  Wallet,
  ArrowRightLeft,
  Package,
  Tag,
  Users,
  BarChart3,
  SunMoon,
  type LucideIcon,
} from 'lucide-react'

export interface DocEntry {
  slug: string
  title: string
  description: string
  icon: LucideIcon
}

export const DOCS: DocEntry[] = [
  {
    slug: 'getting-started',
    title: 'Inicio Rápido',
    description: 'Configuración inicial y primeros pasos',
    icon: Rocket,
  },
  {
    slug: 'branches',
    title: 'Sucursales',
    description: 'Crear, editar y eliminar sucursales',
    icon: Store,
  },
  {
    slug: 'sessions',
    title: 'Sesiones de Caja',
    description: 'Abrir y cerrar caja diaria',
    icon: Wallet,
  },
  {
    slug: 'transactions',
    title: 'Transacciones',
    description: 'Ventas, gastos, retiros e ingresos',
    icon: ArrowRightLeft,
  },
  {
    slug: 'inventory',
    title: 'Inventario',
    description: 'Categorías y movimientos de stock',
    icon: Package,
  },
  {
    slug: 'products',
    title: 'Productos',
    description: 'Catálogo, precios y exportación',
    icon: Tag,
  },
  {
    slug: 'clients',
    title: 'Clientes y Deudas',
    description: 'Registro de clientes y control de deudas',
    icon: Users,
  },
  {
    slug: 'reports',
    title: 'Reportes',
    description: 'Reportes semanales y balance',
    icon: BarChart3,
  },
  {
    slug: 'theme',
    title: 'Tema Claro/Oscuro',
    description: 'Personalizar la interfaz',
    icon: SunMoon,
  },
]
