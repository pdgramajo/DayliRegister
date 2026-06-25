# Transacciones

Las transacciones son los movimientos económicos que se registran dentro de una sesión de caja.

## Introducción

DayliRegister soporta cuatro tipos de transacciones:

| Tipo | Descripción | Efecto en caja |
|------|-------------|----------------|
| 💳 **Venta** | Cobro a cliente por producto/servicio | Aumenta |
| 📤 **Gasto** | Pago del negocio (proveedores, servicios, etc.) | Disminuye |
| 🏦 **Retiro** | Dinero retirado de caja (para tesorería, etc.) | Disminuye |
| 📥 **Ingreso** | Dinero adicional recibido no asociado a venta | Aumenta |

## Registrar una Venta

### Pasos

1. Toca **"Nueva Transacción"** en el detalle de la sesión
2. Selecciona **"Venta"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Total de la venta |
| Método de Pago | Selección | Sí | Efectivo o Transferencia |
| Descripción | Texto | No | Concepto o detalle |

4. Toca **"Guardar"**

### Métodos de Pago

- **Efectivo** — Afecta directamente el efectivo en caja. El balance de caja lo considera en el cálculo de efectivo esperado.
- **Transferencia** — No afecta el efectivo físico. Se registra para el reporte pero no impacta el balance de caja.
- El formulario recuerda el último método de pago seleccionado durante la sesión de navegación, para agilizar el registro de ventas consecutivas.

## Registrar un Gasto

### Pasos

1. Toca **"Nueva Transacción"**
2. Selecciona **"Gasto"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Total del gasto |
| Descripción | Texto | Sí | Detalle del gasto (obligatorio) |

4. Toca **"Guardar"**

### Ejemplos de gastos

- Compra de insumos
- Pago de servicios (luz, agua, internet)
- Fletes y transportes
- Mantenimiento

## Registrar un Retiro

### Pasos

1. Toca **"Nueva Transacción"**
2. Selecciona **"Retiro"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Monto retirado |
| Descripción | Texto | Sí | Motivo del retiro (obligatorio) |

4. Toca **"Guardar"**

### Cuándo usar retiros

- Cuando retiras efectivo para depósito bancario
- Cuando el dueño retira dinero de la caja
- Para pagos grandes que no son gastos del negocio

## Registrar un Ingreso

### Pasos

1. Toca **"Nueva Transacción"**
2. Selecciona **"Ingreso"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Monto recibido |
| Descripción | Texto | Sí | Origen del ingreso (obligatorio) |

4. Toca **"Guardar"**

### Cuándo usar ingresos

- Devoluciones de proveedores
- Ajustes de caja
- Dinero extra puesto en caja

## Listado y Filtros

Dentro del detalle de una sesión, puedes:

- **Ver todas las transacciones** ordenadas por fecha
- **Filtrar por tipo** (ventas, gastos, retiros, ingresos)
- **Filtrar por método de pago** (efectivo, transferencia)
- **Ver el balance en tiempo real** mientras la sesión está abierta

## Buenas Prácticas

- Registra cada transacción **inmediatamente** después de realizada
- Usa descripciones **claras y específicas**
- Para ventas, selecciona el método de pago **correcto**
- Revisa el listado periódicamente para detectar errores
- Al cerrar la sesión, verifica que el balance cuadre

## Solución de Problemas

### Registré una transacción con el tipo incorrecto

- No es posible editar transacciones, pero puedes anularla registrando una transacción inversa
- Si es una venta incorrecta, registra un gasto por el mismo monto con la nota "Anulación de venta"

### El balance no cuadra

- Revisa que todas las ventas en efectivo estén correctamente marcadas
- Verifica que no falten gastos o retiros
- Confirma que el efectivo inicial sea correcto
