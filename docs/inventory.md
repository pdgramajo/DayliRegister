# Inventario

El módulo de inventario te permite controlar el stock de tu negocio mediante categorías y movimientos de entrada y salida.

## Introducción

- Crear y gestionar **categorías de inventario**
- Registrar **entradas de stock** (compras, reposiciones)
- Registrar **salidas de stock** (ventas, mermas, ajustes)
- Visualizar el **historial completo** de movimientos
- Asociar productos a categorías de inventario

## Categorías de Inventario

Las categorías te permiten organizar tus productos. Por ejemplo:

- Carnes
- Lácteos
- Bebidas
- Limpieza
- Verdulería

### Crear una Categoría

1. Desde el detalle de una sucursal, toca **"Inventario"**
2. Toca **"Nueva Categoría"**
3. Ingresa el **nombre** de la categoría
4. Toca **"Guardar"**

### Editar una Categoría

1. Desde la lista de categorías, toca la que deseas modificar
2. Cambia el nombre
3. Toca **"Guardar"**

### Eliminar una Categoría

1. Desde la lista, toca el icono de eliminar en la categoría
2. Confirma la eliminación

> ⚠️ Eliminar una categoría no elimina los productos asociados, pero estos quedarán sin categoría.

## Movimientos de Inventario

### Registrar una Entrada

Cuando recibes mercadería:

1. Desde la sesión de caja abierta o desde el módulo de inventario, toca **"Nuevo Movimiento"**
2. Selecciona **"Entrada"** como tipo
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Categoría | Selección | Sí | Categoría del producto |
| Cantidad | Número | Sí | Unidades recibidas |
| Descripción | Texto | Sí | Detalle del movimiento |

4. Toca **"Guardar"**

### Registrar una Salida

Cuando sale mercadería (venta, merma, ajuste):

1. Toca **"Nuevo Movimiento"**
2. Selecciona **"Salida"** como tipo
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Categoría | Selección | Sí | Categoría del producto |
| Cantidad | Número | Sí | Unidades que salen |
| Descripción | Texto | Sí | Motivo de la salida |

4. Toca **"Guardar"**

## Historial de Movimientos

El historial muestra todos los movimientos registrados, ordenados por fecha:

| Fecha | Tipo | Categoría | Cantidad | Descripción |
|-------|------|-----------|----------|-------------|
| 01/06 | Entrada | Carnes | 50 kg | Compra semanal |
| 02/06 | Salida | Carnes | 10 kg | Venta del día |
| 03/06 | Entrada | Lácteos | 30 kg | Reposición |

Puedes ver el historial completo desde la sucursal, en la sección **"Inventario"**.

## Buenas Prácticas

- **Registra** los movimientos inmediatamente después de recibir o despachar
- Usa **descripciones claras** que permitan identificar cada movimiento
- Realiza **inventarios físicos** periódicos y ajusta si es necesario
- Las **entradas** deben coincidir con las facturas de compra
- Las **salidas** deben reflejar las ventas reales

## Solución de Problemas

### Registré un movimiento incorrecto

- Actualmente no es posible editar movimientos
- Registra un movimiento inverso para corregir: si fue una entrada incorrecta, registra una salida por la misma cantidad con la nota "Corrección"

### No veo las categorías

- Primero debes crear al menos una categoría
- Las categorías son por sucursal

### El stock no coincide con el inventario físico

- Revisa el historial de movimientos completo
- Verifica que no falten registros de entrada o salida
- Registra un ajuste con un movimiento de entrada o salida según corresponda
