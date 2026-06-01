# Roadmap de Funciones

Esta página muestra las funcionalidades planeadas y en desarrollo para DayliRegister.

## Funcionalidades Disponibles

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Sucursales | ✅ Disponible | CRUD completo de sucursales |
| Sesiones de Caja | ✅ Disponible | Apertura, cierre y control de efectivo |
| Transacciones | ✅ Disponible | Ventas, gastos, retiros e ingresos |
| Inventario | ✅ Disponible | Categorías y movimientos de stock |
| Productos | ✅ Disponible | Catálogo, precios y exportación JSON |
| Clientes y Deudas | ✅ Disponible | Registro, cargos, pagos e historial |
| Reportes Semanales | ✅ Disponible | Reporte con desglose y balance |
| Export/Import Productos | ✅ Disponible | Exportación e importación JSON |
| Tema Claro/Oscuro | ✅ Disponible | Personalización de interfaz |
| Persistencia Local | ✅ Disponible | Datos guardados en IndexedDB |
| PWA | ✅ Disponible | Instalación como app, offline |

## Próximas Funcionalidades

### Exportación de Reportes

- Exportar reportes a Excel/CSV
- Generar reportes en PDF
- Compartir reportes con formato mejorado

### Mejoras en Gestión

- Asignación de empleados por sucursal
- Inventario independiente por ubicación
- Zonas o regiones para mejor organización

### Integraciones

- Sincronización entre dispositivos
- Respaldo en la nube
- Notificaciones y alertas

## Timeline Estimado

```
2026
├── Q2 (Abr-Jun) ✅ Completado
│   ├── Sesiones de Caja
│   ├── Transacciones (ventas, gastos, retiros)
│   ├── Inventario
│   └── Productos
├── Q3 (Jul-Sep) 🔜 En desarrollo
│   ├── Clientes y Deudas
│   ├── Reportes
│   └── Exportación de reportes
└── Q4 (Oct-Dic) 🔜 Planificado
    ├── Sincronización entre dispositivos
    ├── Empleados por sucursal
    └── Mejoras de integración
```

> Nota: Las fechas son estimadas y pueden variar según prioridades y feedback de usuarios.

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
