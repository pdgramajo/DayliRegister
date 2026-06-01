# Sesiones de Caja

Las sesiones de caja permiten controlar el efectivo disponible en cada sucursal durante un período de operación (generalmente un día laboral).

## Introducción

El módulo de sesiones de caja te permite:

- Abrir una sesión con un monto de efectivo inicial
- Registrar todas las transacciones del día dentro de la sesión
- Cerrar la sesión con el efectivo final
- Visualizar el historial de sesiones por sucursal
- Ver el balance de cada sesión cerrada

## Abrir una Sesión

### Requisitos

- La sucursal debe estar creada y activa
- No debe haber otra sesión abierta en la misma sucursal

### Pasos

1. Desde la lista de sucursales, toca la sucursal deseada
2. Serás llevado a la lista de sesiones de esa sucursal
3. Toca el botón **"Nueva Sesión"**
4. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Efectivo Inicial | Monto | Sí | Dinero en caja al abrir |
| Notas | Texto | No | Observaciones iniciales |

5. Toca **"Abrir Sesión"**

La sesión se abrirá y quedarás en la pantalla de detalle, lista para operar.

## Registrar Transacciones

Con la sesión abierta, puedes registrar:

- **Ventas** — Cobros a clientes (efectivo / transferencia)
- **Gastos** — Pagos del negocio
- **Retiros** — Dinero retirado de la caja
- **Ingresos** — Dinero adicional recibido

Ver [Transacciones](./transactions.md) para más detalles.

## Cerrar una Sesión

### Cuándo cerrar

- Al finalizar la jornada laboral
- Al hacer un corte de caja
- Para realizar un arqueo

### Pasos

1. Desde el detalle de la sesión abierta, toca **"Cerrar Sesión"**
2. Ingresa el **Efectivo Final** (dinero en caja al cierre)
3. Opcionalmente agrega notas sobre el cierre
4. Confirma el cierre

### Qué sucede al cerrar

- La sesión queda marcada como **cerrada**
- Se calcula el balance automáticamente
- No se pueden agregar más transacciones a una sesión cerrada
- Se puede abrir una nueva sesión cuando sea necesario

## Visualizar el Balance

En el detalle de una sesión cerrada puedes ver:

- **Efectivo Inicial** — Monto al abrir
- **Ventas Efectivo** — Total de ventas en efectivo
- **Ventas Transferencia** — Total de ventas por transferencia
- **Gastos** — Total de gastos registrados
- **Retiros** — Total retirado
- **Ingresos** — Total de ingresos adicionales
- **Efectivo Esperado** = Inicial + Ventas Efectivo - Gastos - Retiros + Ingresos
- **Efectivo Final** — Monto real al cerrar
- **Diferencia** = Efectivo Final - Efectivo Esperado

## Historial de Sesiones

La lista de sesiones muestra todas las sesiones de una sucursal ordenadas por fecha:

- Las sesiones **abiertas** aparecen primero con indicador visual
- Las sesiones **cerradas** muestran su balance final
- Puedes tocar cualquier sesión para ver su detalle

## Buenas Prácticas

- **Abrir sesión** al comenzar la jornada con el efectivo real en caja
- **Cerrar sesión** al finalizar sin excepción
- Si hay diferencias, registra un **gasto** o **ingreso** para ajustar
- Usa las **notas** para documentar eventos relevantes

## Solución de Problemas

### No puedo abrir una sesión

- Verifica que no haya otra sesión abierta en la misma sucursal
- Confirma que la sucursal esté activa

### El balance no cuadra

- Revisa todas las transacciones registradas
- Verifica los montos de efectivo inicial y final
- Comprueba que no haya transacciones duplicadas

### Olvidé cerrar la sesión

- Puedes cerrarla en cualquier momento
- El efectivo final debe reflejar el estado real de la caja
