# Clientes y Deudas

El módulo de clientes te permite registrar los clientes de tu negocio y llevar un control detallado de sus deudas.

## Introducción

- Registrar clientes con información de contacto
- Asociar clientes a una sucursal
- Agregar cargos de deuda a clientes
- Registrar pagos y abonos
- Visualizar el historial completo de movimientos de deuda
- Ver el saldo actual de cada cliente

## Crear un Cliente

### Pasos

1. Desde el detalle de una sucursal, toca **"Clientes"**
2. Toca el botón **"Nuevo Cliente"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Nombre | Texto | Sí | Nombre completo del cliente |
| Teléfono | Texto | No | Número de contacto |
| Dirección | Texto | No | Dirección del cliente |
| Notas | Texto | No | Información adicional |

4. Toca **"Guardar"**

## Gestionar Deudas

### Agregar un Cargo (Deuda)

Cuando un cliente lleva productos sin pagar:

1. Desde el detalle del cliente, toca **"Nueva Deuda"**
2. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Monto del cargo |
| Descripción | Texto | Sí | Concepto o detalle del cargo |

3. Toca **"Guardar"**

### Registrar un Pago

Cuando el cliente abona parte o toda su deuda:

1. Desde el detalle del cliente, toca **"Registrar Pago"**
2. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Monto | Número | Sí | Monto del pago |
| Descripción | Texto | No | Referencia del pago |

3. Toca **"Guardar"**

## Visualizar Estado de Cuenta

En el detalle del cliente puedes ver:

- **Saldo Actual** — Deuda total pendiente
- **Historial de Movimientos** — Lista completa de cargos y pagos
- **Fecha del Último Movimiento** — Actividad más reciente

Cada movimiento en el historial muestra:
- Fecha y hora
- Tipo (cargo o pago)
- Monto
- Descripción
- Saldo después del movimiento

## Listado de Clientes

La lista de clientes de una sucursal muestra:

- Nombre del cliente
- Teléfono (si está registrado)
- Saldo pendiente
- Indicador visual de clientes con deuda

Puedes tocar cualquier cliente para ver su detalle completo.

## Buenas Prácticas

- **Registra** los cargos en el momento de la venta
- **Documenta** cada cargo con una descripción clara
- **Registra** los pagos inmediatamente después de recibirlos
- **Revisa** periódicamente los clientes con deuda
- **Contacta** a clientes con deudas vencidas

## Solución de Problemas

### El saldo del cliente no coincide

- Revisa el historial de movimientos completo
- Verifica que todos los cargos y pagos estén registrados
- Confirma que no haya movimientos duplicados

### Registré un cargo incorrecto

- Puedes registrar un pago por el mismo monto para anularlo
- Agrega una descripción como "Anulación de cargo incorrecto"

### No encuentro un cliente

- Verifica que estás en la sucursal correcta
- Los clientes son por sucursal, no globales
- Usa la lista completa para buscar
