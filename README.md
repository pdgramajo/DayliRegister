# DayliRegister

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![CI/CD](https://github.com/pdgramajo/DayliRegister/actions/workflows/ci.yml/badge.svg)](https://github.com/pdgramajo/DayliRegister/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**POS y gestión de efectivo para pequeños negocios**

[Documentación](./docs/README.md) •
[Reportar Bug](https://github.com/pdgramajo/DayliRegister/issues) •
[Solicitar Feature](https://github.com/pdgramajo/DayliRegister/issues)

</div>

---

## ✨ Features

| Módulo | Descripción |
|--------|-------------|
| 🏪 **Sucursales** | Gestión multi-sede con CRUD completo |
| 💰 **Sesiones de Caja** | Apertura/cierre de caja diaria por sucursal |
| 💳 **Transacciones** | Ventas (efectivo/transferencia), gastos, retiros, ingresos |
| 📦 **Inventario** | Categorías y movimientos de entrada/salida |
| 🏷️ **Productos** | Catálogo con precios, ofertas y exportación JSON |
| 👥 **Clientes** | Registro y control de deudas con historial |
| 📊 **Reportes** | Reporte semanal con desglose por pago y balance |
| 🌙 **Tema Oscuro** | Modo claro/oscuro con detección automática |
| 📱 **PWA** | Instalable como app, funciona offline |
| 🛡️ **Confiabilidad** | Logging de errores, ErrorBoundary, auto-respaldos |

## 🛠️ Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^19.2.6 | UI framework |
| TypeScript | ^6.0.3 | Tipado estático |
| Vite | ^8.0.12 | Build tool |
| Redux Toolkit | ^2.11.2 | Estado global |
| Dexie.js | ^4.4.2 | Base de datos offline (IndexedDB) |
| Tailwind CSS | ^4.3.0 | Estilos utilitarios |
| React Router | ^7.15.0 | Navegación SPA |
| React Hook Form | ^7.75.0 | Formularios |
| Zod | ^4.4.3 | Validación de esquemas |
| Vitest | ^4.1.6 | Tests unitarios |

## 🚀 Scripts

```bash
pnpm dev           # Desarrollo con HMR
pnpm build         # Build producción → dist/
pnpm preview       # Preview del build
pnpm test          # Tests (modo watch)
pnpm test --run    # Tests (single run)
pnpm lint          # ESLint
pnpm format        # Prettier
```

## 📁 Estructura del proyecto

```
src/
├── components/     # UI components (button, card, modal, toast, etc.)
├── constants/      # Rutas, errores, tipos de sesión, storage
├── db/             # Schema Dexie (IndexedDB v3)
├── hooks/          # Custom hooks (theme, PWA, Redux)
├── lib/            # Utilidades (formatters, utils, whatsapp)
├── pages/          # Páginas por módulo (Branch, Session, Product, etc.)
├── repositories/   # Capa de acceso a datos (Dexie queries)
├── services/       # Capa de negocio
├── store/          # Redux slices
└── types/          # Tipos compartidos (entities, DTOs)
```

## 📖 Documentación

La documentación completa está en español en el directorio [`docs/`](./docs/README.md):

- [Inicio Rápido](./docs/getting-started.md)
- [Sucursales](./docs/branches.md)
- [Sesiones de Caja](./docs/sessions.md)
- [Transacciones](./docs/transactions.md)
- [Inventario](./docs/inventory.md)
- [Productos](./docs/products.md)
- [Clientes y Deudas](./docs/clients.md)
- [Reportes](./docs/reports.md)
- [Tema Claro/Oscuro](./docs/theme.md)
- [Roadmap](./docs/roadmap.md)

## 📄 Licencia

Distribuido bajo licencia MIT. Ver [`LICENSE`](LICENSE) para más información.
