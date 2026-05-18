# Gestión de Sucursales

Las sucursales son los puntos de venta o ubicaciones de tu negocio. Cada sucursal puede tener su propia dirección, teléfono y estado de actividad.

## Introducción

El módulo de sucursales te permite:

- Crear nuevas sucursales con información de contacto
- Editar información existente
- Activar o desactivar sucursales
- Eliminar sucursales que ya no necesites

## Crear una Nueva Sucursal

### Pasos para crear

1. En la pantalla principal, toca el botón **"Nueva Sucursal"**
2. Completa los campos del formulario:

| Campo     | Tipo   | Requerido | Descripción                        |
| --------- | ------ | --------- | ---------------------------------- |
| Nombre    | Texto  | Sí        | Identificador único de la sucursal |
| Dirección | Texto  | No        | Ubicación física de la sucursal    |
| Teléfono  | Texto  | No        | Número de contacto                 |
| Activa    | Toggle | Sí        | Estado de la sucursal              |

3. Toca **"Crear Sucursal"** para guardar

### Ejemplo de datos

```
Nombre:        Sucursal Centro
Dirección:     Av. Principal 1234
Teléfono:      +54 388 123 4567
Activa:        ✓
```

## Editar una Sucursal

### Pasos para editar

1. En la lista de sucursales, toca la tarjeta de la sucursal que deseas editar
2. Serás redirigido al formulario de edición
3. Modifica los campos que necesites
4. Toca **"Guardar"** para aplicar los cambios

Los cambios se guardan automáticamente en el dispositivo.

## Eliminar una Sucursal

### Consideraciones previas

Antes de eliminar una sucursal, ten en cuenta:

- La eliminación es permanente
- Se perderá todo el historial asociado
- No es posible recuperar los datos eliminados

### Pasos para eliminar

1. En la lista de sucursales, toca el botón de eliminar (icono de papelera) en la tarjeta de la sucursal
2. Confirma la eliminación en el diálogo de seguridad
3. La sucursal se eliminará inmediatamente

## Estados de una Sucursal

### Sucursal Activa

- Visible en la lista principal
- Disponible para operaciones
- Indicador visual de estado activo

### Sucursal Inactiva

- Puede estar oculta en la lista principal
- No disponible para nuevas operaciones
- Puede reactivarse en cualquier momento

## Estructura de Datos

Cada sucursal contiene la siguiente información:

```typescript
interface Branch {
  id: string // Identificador único
  name: string // Nombre de la sucursal
  address?: string // Dirección (opcional)
  phone?: string // Teléfono (opcional)
  isActive: boolean // Estado activo/inactivo
  createdAt: string // Fecha de creación
  updatedAt: string // Fecha de última modificación
  deletedAt?: string // Fecha de eliminación (si aplica)
}
```

## Buenas Prácticas

### Nomenclatura

- Usa nombres descriptivos y consistentes
- Incluye la ubicación si tienes varias sucursales
- Evita caracteres especiales en los nombres

### Información de Contacto

- Mantén los teléfonos actualizados
- Incluye el código de país para sucursales internacionales
- La dirección ayuda a identificar físicamente cada punto

### Mantenimiento

- Revisa periódicamente las sucursales inactivas
- Elimina las que ya no uses para mantener la lista ordenada
- Actualiza la información cuando cambie

## Solución de Problemas

### No puedo crear una sucursal

- Verifica que el nombre no esté vacío
- El nombre debe tener menos de 100 caracteres
- Revisa tu conexión a internet

### Los cambios no se guardan

- La app guarda automáticamente
- Verifica el espacio disponible en tu dispositivo
- Intenta nuevamente después de unos segundos

### No puedo eliminar una sucursal

- Confirma la eliminación en el diálogo
- Si el problema persiste, contacta al soporte

## Próximas Funcionalidades

El módulo de sucursales将继续 evolucionando con:

- Asignación de empleados por sucursal
- Reportes individuales por sucursal
- Inventario independiente por ubicación
- Zonas o regiones para mejor organización
