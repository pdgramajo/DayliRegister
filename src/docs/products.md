# Productos

El módulo de productos te permite crear y gestionar un catálogo de productos por sucursal, con precios y categorías.

## Introducción

- Crear productos con nombre, precio y categoría
- Asignar precio regular y precio de oferta
- Organizar productos por categorías de inventario
- Exportar e importar productos mediante archivos JSON

## Crear un Producto

### Pasos

1. Desde el detalle de una sucursal, toca **"Productos"**
2. Toca el botón **"Nuevo Producto"**
3. Completa los campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Nombre | Texto | Sí | Nombre del producto |
| Precio Regular | Número | Sí | Precio de venta habitual |
| Precio Oferta | Número | No | Precio promocional |
| Categoría | Selección | No | Categoría de inventario asociada |

4. Toca **"Guardar"**

## Editar un Producto

1. Desde la lista de productos, toca el producto que deseas editar
2. Modifica los campos necesarios
3. Toca **"Guardar"**

## Precios

### Precio Regular

Es el precio de venta estándar del producto.

### Precio Oferta

Precio promocional que puedes activar temporalmente. Si está definido, puedes usarlo en lugar del precio regular.

Ambos precios se muestran en el listado de productos para referencia al registrar ventas.

## Categorías de Inventario

Las categorías permiten agrupar productos similares. Por ejemplo:

- Carnes
- Lácteos
- Bebidas
- Limpieza

Puedes gestionar las categorías desde el módulo de [Inventario](./inventory.md).

## Exportar Productos

Puedes exportar el catálogo de productos de una sucursal a un archivo JSON:

1. Desde la lista de productos, toca **"Exportar"**
2. El archivo se descargará automáticamente
3. El JSON incluye: nombre, precio regular, precio oferta y categoría

## Importar Productos

Puedes importar productos desde un archivo JSON:

1. Desde la lista de productos, toca **"Importar"**
2. Selecciona el archivo JSON en tu dispositivo
3. Confirma la importación
4. Los productos se agregarán a la sucursal actual

### Formato del archivo JSON

```json
[
  {
    "name": "Producto Ejemplo",
    "regularPrice": 1500,
    "offerPrice": 1200,
    "category": "Carnes"
  }
]
```

## Buenas Prácticas

- Usa nombres **descriptivos** y consistentes
- Mantén los precios **actualizados**
- Asigna categorías para **organizar** mejor el catálogo
- Exporta regularmente como **respaldo**
- Revisa el catálogo periódicamente para eliminar productos discontinuados

## Solución de Problemas

### No encuentro un producto

- Verifica que estás en la sucursal correcta
- Los productos son por sucursal, no globales

### La importación falla

- Verifica que el archivo JSON tenga el formato correcto
- Asegúrate de que los nombres de categorías existan
- Comprueba que los precios sean números válidos

### El precio de oferta no se muestra

- Solo se muestra si tiene un valor definido (mayor a 0)
- Puedes agregarlo editando el producto
