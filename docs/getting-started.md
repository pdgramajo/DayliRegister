# Inicio Rápido

Esta guía te ayudará a configurar DayliRegister y comenzar a gestionar tu negocio en minutos.

## Requisitos del Sistema

- Navegador actualizado (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet para la primera carga
- Al menos 50 MB de espacio disponible en tu dispositivo

## Primer Acceso

### 1. Abrir la Aplicación

Accede a DayliRegister desde tu navegador. La aplicación se cargará automáticamente.

### 2. Crear tu Primera Sucursal

1. En la pantalla principal, toca el botón **"Nueva Sucursal"**
2. Completa los datos requeridos:
   - **Nombre** — Identificador de la sucursal
   - **Dirección** (opcional) — Ubicación física
   - **Teléfono** (opcional) — Contacto de la sucursal
3. Activa el toggle **"Activa"** para habilitar la sucursal
4. Toca **"Guardar"** para crear

¡Listo! Tu primera sucursal está creada.

### 3. Abrir una Sesión de Caja

1. Desde la lista de sucursales, toca la sucursal que creaste
2. Toca **"Nueva Sesión"**
3. Ingresa el **monto de efectivo inicial**
4. Toca **"Abrir Sesión"**

La sesión de caja queda abierta y lista para registrar transacciones.

### 4. Registrar una Venta

Con la sesión abierta:

1. Toca **"Nueva Transacción"**
2. Selecciona **"Venta"** como tipo
3. Ingresa el monto
4. Selecciona el método de pago: **Efectivo** o **Transferencia**
5. Toca **"Guardar"**

### 5. Cerrar la Sesión

Al finalizar el día:

1. En la sesión abierta, toca **"Cerrar Sesión"**
2. Ingresa el **monto de efectivo final**
3. Confirma el cierre

## Interfaz Principal

### Barra Superior

Cuatro botones de acceso rápido:

- **Reportes** — Accede a los reportes semanales de la sucursal
- **Recepciones** — Gestión de recepciones de inventario (próximamente)
- **Configuración** — Ajustes de la aplicación y visor de logs
- **Tema** — Cambiar entre modo claro y oscuro

### Área de Acción

Botón principal **"Nueva Sucursal"** para agregar puntos de venta.

### Lista de Sucursales

Muestra todas las sucursales creadas. Cada tarjeta incluye:

- Nombre, dirección y teléfono
- Estado (activa/inactiva)
- Acciones: editar, ver sesiones, eliminar

## Flujo de Trabajo Típico

```
1. Crear sucursal(es)
2. Abrir sesión de caja (efectivo inicial)
3. Registrar transacciones durante el día
   ├── Ventas (efectivo / transferencia)
   ├── Gastos
   ├── Retiros
   └── Ingresos
4. Cerrar sesión (efectivo final)
5. Generar reporte semanal
```

## Siguientes Pasos

Una vez que domines lo básico:

- [Sesiones de Caja](./sessions.md) — Gestión avanzada de caja
- [Transacciones](./transactions.md) — Tipos y registro detallado
- [Productos](./products.md) — Crear catálogo de productos
- [Clientes](./clients.md) — Gestionar clientes y deudas
- [Reportes](./reports.md) — Interpretar los reportes semanales

## Solución de Problemas

### La página no carga

- Verifica tu conexión a internet
- Limpia la caché del navegador
- Intenta con otro navegador

### Los datos no se guardan

- Asegúrate de tener espacio en tu dispositivo
- La app guarda automáticamente en IndexedDB (almacenamiento local del navegador)
- No requiere cookies

### Necesito ayuda adicional

Si el problema persiste, revisa el visor de logs en **Configuración** para identificar errores.
