# Reportes

El módulo de reportes genera un resumen semanal de la actividad de una sucursal, incluyendo ventas, gastos, inventario y balance.

## Introducción

- Reporte semanal con resumen día por día
- Desglose de ventas por método de pago
- Resumen de gastos, retiros e ingresos
- Movimientos de inventario en el período
- Cálculo de balance general
- Generación de reporte en texto plano para compartir

## Generar un Reporte

### Pasos

1. Desde el detalle de una sucursal, toca **"Reportes"**
2. Selecciona la **fecha de inicio** del período
3. Selecciona la **fecha de fin** del período
4. El reporte se genera automáticamente
5. Navega por las diferentes secciones del reporte

## Secciones del Reporte

### 1. Resumen de Ventas

Muestra para cada día del período:

| Día | Efectivo | Transferencia | Total |
|-----|----------|---------------|-------|
| Lun | $15,000 | $5,000 | $20,000 |
| Mar | $12,000 | $8,000 | $20,000 |
| ... | ... | ... | ... |
| **Total** | **$27,000** | **$13,000** | **$40,000** |

### 2. Gastos

Lista de todos los gastos registrados en el período, ordenados por fecha.

| Fecha | Descripción | Monto |
|-------|-------------|-------|
| 01/06 | Compra de insumos | $3,000 |
| 02/06 | Pago de luz | $1,500 |
| **Total** | | **$4,500** |

### 3. Retiros e Ingresos

Resumen de retiros e ingresos adicionales registrados.

### 4. Movimientos de Inventario

Lista de movimientos de inventario (entradas y salidas) registrados en el período.

### 5. Balance General

Cálculo final del período:

| Concepto | Monto |
|----------|-------|
| Ventas Totales | $40,000 |
| Gastos | -$4,500 |
| Retiros | -$2,000 |
| Ingresos | +$1,000 |
| **Balance** | **$34,500** |

### 6. Datos de Sesiones

Cantidad de sesiones de caja abiertas en el período, con su estado actual.

## Compartir Reporte

Puedes generar un reporte en texto plano para compartir:

1. Toca el botón **"Compartir"**
2. Se generará un resumen en texto
3. Copia el texto o compártelo directamente
4. El texto incluye todas las secciones del reporte

### Ejemplo de reporte compartido

```
📊 REPORTE SEMANAL
Período: 25/05/2026 - 31/05/2026
Sucursal: Sucursal Centro

VENTAS
Lun 25/05: $15,000 (Efectivo) + $5,000 (Transf.)
Mar 26/05: $12,000 (Efectivo) + $8,000 (Transf.)
...
Total: $40,000

GASTOS
Compra de insumos: $3,000
Pago de luz: $1,500
Total: $4,500

BALANCE: $34,500
```

## Buenas Prácticas

- Genera reportes al **finalizar cada semana**
- Comparte el reporte con los interesados via WhatsApp
- Revisa las **diferencias** entre semanas para detectar anomalías
- Usa los reportes para tomar **decisiones de negocio**
- Archiva los reportes importantes para referencia futura

## Solución de Problemas

### El reporte no muestra datos

- Verifica que el período seleccionado tenga transacciones registradas
- Confirma que las sesiones de caja estén cerradas en ese período
- Extiende el rango de fechas si es necesario

### Faltan transacciones en el reporte

- Revisa que las transacciones estén dentro del rango de fechas
- Verifica que pertenezcan a la sucursal seleccionada
- Confirma que la sesión de caja no haya sido eliminada

### El balance no cuadra

- Revisa las sesiones de caja del período
- Verifica que todas las sesiones estén cerradas
- Comprueba los montos de efectivo inicial y final de cada sesión
