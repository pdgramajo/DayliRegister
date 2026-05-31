# Changelog

Todas las cambios notables de DayliRegister se documentarán en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-31

### Added

#### Gestión de Sucursales
- CRUD completo de sucursales (crear, editar, eliminar con confirmación)
- Lista de sucursales como pantalla principal
- Cada sucursal con nombre y direccion

#### Sesiones de Caja
- Apertura y cierre de sesiones de caja por sucursal
- Control de efectivo inicial y final
- Historial de sesiones por fecha
- Estados: abierta / cerrada

#### Transacciones
- **Ventas**: registro con monto y método de pago (efectivo / transferencia)
- **Gastos**: control de gastos del negocio
- **Retiros**: dinero retirado de caja
- **Ingresos**: dinero adicional recibido
- Listado por sesión con filtros por tipo y método de pago

#### Inventario
- Categorías de inventario configurables
- Movimientos de entrada y salida
- Registro de cantidad y descripción por movimiento
- Historial completo por sucursal

#### Productos
- Catálogo de productos por sucursal
- Precio regular y precio oferta
- Asignación de categorías de inventario
- Exportación e importación de productos via archivos JSON

#### Clientes y Deudas
- Registro de clientes por sucursal
- Cargos de deuda a clientes
- Pagos y abonos de deuda
- Historial completo de movimientos de deuda

#### Reportes
- Reporte semanal de ventas con desglose por día
- Desglose por método de pago (efectivo / transferencia)
- Resumen de gastos, retiros e ingresos
- Movimientos de inventario en el período
- Cálculo de balance
- Generación de reporte en texto plano para compartir via WhatsApp

#### Interfaz y Experiencia de Usuario
- Tema claro/oscuro con detección de preferencia del sistema
- Persistencia de preferencia de tema en localStorage
- Diseño responsive para dispositivos móviles y escritorio
- Notificaciones toast para feedback de acciones
- Navegación con React Router con lazy loading de páginas

#### PWA (Progressive Web App)
- Service worker con auto-actualización
- Instalación como aplicación independiente
- Iconos y manifest para todos los dispositivos
- Alcance scoped a /DayliRegister/

#### Confiabilidad
- Logging de errores en IndexedDB
- Manejador global de errores (window.onerror, unhandledrejection)
- ErrorBoundary con manejo de fallos de carga dinámica
- Wrapper de async thunks con logging automático (createLoggedAsyncThunk)

#### Infraestructura
- CI/CD con GitHub Actions (typecheck, lint, test, build, deploy a Pages)
- Tests automatizados con Vitest (699 tests, 72 test files)
- Husky + lint-staged para calidad de código en commits
- ESLint + Prettier para formato y linting consistente

### Changed
- Proyecto inicializado desde plantilla Vite React-TS
- Nombre de proyecto actualizado a "dayliregister"
- Version establecida a 1.0.0

### Removed
- Archivo temporal `tmp_mock_test.ts` eliminado

[1.0.0]: https://github.com/pdgramajo/DayliRegister/releases/tag/v1.0.0
