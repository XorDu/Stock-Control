# Solución: Descuento automático de lotes al registrar salidas

## Problema original
Cuando se vendía un lote de productos (ej. Harina Pan), las unidades se descutaban correctamente del stock general, pero el lote permanecía registrado en el sistema sin eliminarse.

## Cambios realizados

### 1. Backend (`server.js`)

#### Endpoint `/api/salidas` (POST)
- Agregado soporte para `lote_id` en el cuerpo de la solicitud
- Validación de stock por lote específico
- Si se vende todo el lote (cantidad == stock del lote), el lote se elimina automáticamente
- Si se vende parcialmente, se registra una entrada negativa para reducir el stock del lote
- El stock general del producto también se actualiza

#### Endpoint `/api/migrate-lote-id` (GET)
- Endpoint temporal para agregar la columna `lote_id` a la tabla `salidas`
- Ejecutar una vez para migrar la base de datos

### 2. Frontend (`public/app.js`)

#### Función `configurarFormularioSalida()`
- Ahora carga los lotes específicos del producto seleccionado
- Muestra un selector de lotes con:
  - Número de lote
  - Cantidad disponible
  - Fecha de vencimiento
- Al seleccionar un lote, limita la cantidad máxima al stock de ese lote
- Envía `lote_id` al backend al registrar la salida

## Pasos para implementar

### Paso 1: Actualizar el servidor
1. Detén el servidor si está ejecutándose
2. Navega a la carpeta correcta:
   ```
   cd "Easy-Stock-Control VERSION11\Easy-Stock-Control VERSION11"
   ```
3. Inicia el servidor:
   ```
   node server.js
   ```

### Paso 2: Migrar la base de datos
1. Abre tu navegador
2. Visita: `http://localhost:3000/api/migrate-lote-id`
3. Deberías ver: `{"success":true,"message":"Columna lote_id agregada correctamente"}`

### Paso 3: Probar el sistema
1. Refresca la página principal (Ctrl+F5)
2. Ve a la sección de Salidas
3. Selecciona un producto (ej. Harina Pan)
4. Verás los lotes disponibles con su stock
5. Selecciona un lote específico
6. Ingresa la cantidad a vender
7. Registra la salida

## Comportamiento esperado

### Al vender todo un lote (ej. 20 unidades):
- El lote se elimina de la base de datos
- El stock general del producto se reduce en 20
- El lote ya no aparecerá en futuras ventas

### Al vender parcialmente (ej. 10 de 20 unidades):
- El stock del lote se reduce a 10
- El lote sigue disponible con 10 unidades
- El stock general del producto se reduce en 10

## Archivos modificados
- `server.js` - Líneas 226-315 (endpoint de salidas) y líneas 816-830 (endpoint de migración)
- `public/app.js` - Función `configurarFormularioSalida()` (aproximadamente líneas 257-381)

## Notas
- Los productos sin lotes seguirán funcionando igual que antes (solo stock general)
- El campo `lote_id` en la tabla `salidas` es nullable, por lo que las salidas antiguas no se ven afectadas
- El sistema usa FIFO (First In, First Out) de forma implícita al mostrar los lotes ordenados por número
