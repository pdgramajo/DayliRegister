# Roadmap de Funciones

Esta página muestra las funcionalidades planeadas y en desarrollo para DayliRegister.

## Funcionalidades Disponibles

Las siguientes funciones ya están implementadas y listas para usar:

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Sucursales | ✅ Disponible | CRUD completo de sucursales |
| Tema Claro/Oscuro | ✅ Disponible | Personalización de interfaz |
| Persistencia Local | ✅ Disponible | Datos guardados en el navegador |

## Próximas Funcionalidades

### Fase 1: Gestión de Caja

#### Sesiones de Caja

- Abrir y cerrar sesiones de caja por sucursal
- Control de efectivo inicial y final
-Historial de sesiones por fecha
- Estados: abierta | cerrada

#### Transacciones

- **Ventas**: Registro de ventas con métodos de pago
- **Gastos**: Control de gastos del negocio
- **Retiros**: Dinero retirado de la caja
- **Ingresos**: Dinero adicionales recebos

**Métodos de pago soportados:**
- Efectivo
- Transferencia

### Fase 2: Inventario

#### Categorías de Inventario

- Crear categorías para organizar productos
- Editar y eliminar categorías
- Asignar categorías a productos

#### Movimientos de Inventario

- Entradas de inventario
- Salidas de inventario
- Registro de cantidad y descripción
- Historial de movimientos por sucursal

### Fase 3: Productos

#### Gestión de Productos

- Crear catálogo de productos por sucursal
- Precio regular y precio oferta
- Asignación de categorías
- Histórico de precios

### Fase 4: Reportes

#### Reportes por Sucursal

- Resumen de ventas diarias
- Gastos por período
- Movimiento de inventario
- Comparación entre sucursales

#### Exportación

- Exportar datos a Excel/CSV
- Generar reportes PDF

## Timeline Estimado

```
2026
├── Q2 (Abr-Jun)
│   ├── Sesiones de Caja
│   └── Transacciones (ventas, gastos, retiros)
├── Q3 (Jul-Sep)
│   ├── Inventario
│   └── Productos
└── Q4 (Oct-Dec)
    ├── Reportes
    └── Exportación
```

## Solicitar Funcionalidades

¿Necesitas una función específica? Contáctanos y cuéntanos qué características serían más útiles para tu negocio.

## Notas de Desarrollo

### Tecnología

DayliRegister está construido con:

- React + TypeScript
- Vite (build tool)
- Redux Toolkit (gestión de estado)
- Dexie (IndexedDB para almacenamiento local)
- Tailwind CSS (estilos)

### Compatibilidad

La aplicación funciona en:

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles y escritorio
- Sin instalación requerida