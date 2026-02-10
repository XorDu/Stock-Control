# Product Context: Control Fácil - Sistema de Gestión de Inventario

## Why This Project Exists

Control Fácil existe para resolver un problema común en las cantinas: la gestión manual del inventario que führt a errores, productos vencidos y pérdidas económicas. El sistema automatiza el registro de entradas y salidas, manteniendo un control preciso del stock y alertando sobre productos próximos a vencer.

## Problems It Solves

1. **Control de Stock**: Elimina el conteo manual y propenso a errores
2. **Vencimientos**: Alerta sobre productos próximos a vencer antes de que sea tarde
3. **Historial**: Mantiene registro de todas las entradas y salidas
4. **Lotes**: Permite rastrear productos por número de lote/partida
5. **Persistencia**: Los datos se guardan en MySQL, no en el navegador

## How It Should Work (User Flow)

1. El usuario inicia el servidor con XAMPP/MySQL ejecutándose
2. Accede a la interfaz web en http://localhost:3000
3. Registra las entradas de productos con lote y fecha de vencimiento
4. Registra las salidas (ventas, consumo, merma)
5. Consulta el inventario actual en tiempo real
6. Revisa la sección de vencimientos para productos en riesgo

## Key User Experience Goals

- **Simplicidad**: Interfaz intuitiva sin curva de aprendizaje
- **Rapidez**: Registro de operaciones en segundos
- **Confiabilidad**: Datos siempre disponibles en MySQL
- **Alertas**: Productos vencidos claramente visibles

## What This System Provides

1. **Registro de Entradas**: Formulario para registrar productos que ingresan
2. **Registro de Salidas**: Control de salidas con motivos categorizados
3. **Inventario en Tiempo Real**: Stock actualizado automáticamente
4. **Control de Vencimientos**: Categorización por estado (vencidos, próximos, OK)
5. **APIs REST**: Endpoints para integración externa

## Integration Points

- **Base de Datos**: MySQL (XAMPP) con tablas productos, entradas, salidas
- **Frontend**: HTML/CSS/Vanilla JS sin frameworks
- **Servidor**: Node.js con Express
