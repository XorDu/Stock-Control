# Control Fácil - Sistema de Gestión de Inventario para Cantinas

## 🎯 Descripción

**Control Fácil** es un sistema simple y efectivo para gestionar el inventario de cantinas. Diseñado para ser fácil de usar con almacenamiento persistente en MySQL (XAMPP).

## ✨ Características Principales

- ✅ **Sistema de Login**: Protección de acceso con usuario y contraseña
- ✅ **Registro de Entradas**: Control detallado de productos que ingresan
- ✅ **Registro de Salidas**: Seguimiento de productos que salen del inventario
- ✅ **Control de Stock**: Visualización en tiempo real del inventario disponible
- ✅ **Gestión de Vencimientos**: Alertas de productos vencidos o próximos a vencer
- ✅ **Sistema de Lotes**: Control preciso por número de lote/partida
- ✅ **Persistencia MySQL**: Datos guardados en base de datos, no en el navegador

## 🗂️ Estructura del Proyecto

```
control-facil/
├── .env.example          # Configuración de base de datos
├── .gitignore
├── init-db.js            # Script para inicializar MySQL
├── package.json          # Dependencias del proyecto
├── server.js             # Servidor web y APIs
└── public/               # Archivos públicos
    ├── index.html        # Interfaz principal (protegida)
    ├── login.html        # Pantalla de inicio de sesión
    ├── app.js            # Lógica del frontend
    └── styles.css        # Estilos visuales
```

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **XAMPP instalado** con MySQL running (puerto 3306)
2. **Node.js** instalado (versión 14 o superior)

### Paso 1: Configurar Base de Datos

1. Copia el archivo de ejemplo:
   ```
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus datos de XAMPP:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=control_facil
   ```

### Paso 2: Inicializar Base de Datos

Ejecuta el script de初始化ización:
```bash
npm run init-db
```

Este comando:
- Crea la base de datos `control_facil`
- Crea las tablas necesarias (productos, entradas, salidas)
- No elimina datos existentes

### Paso 3: Iniciar el Servidor

```bash
npm start
```

El servidor iniciará en **http://localhost:3000**

### Credenciales de Acceso

El sistema requiere autenticación para acceder al panel:

| Campo | Valor |
|-------|-------|
| Usuario | `cantina` |
| Contraseña | `1234` |

## 📖 Cómo Usar

### Registro de Entradas

1. Ve a la pestaña **"📦 Entradas"**
2. Completa el formulario:
   - Nombre del producto (ej: Harina P.A.N)
   - Cantidad y unidad
   - Número de lote
   - Proveedor
   - Fecha de llegada
   - Fecha de vencimiento (opcional)
3. Haz clic en **"✓ Registrar Entrada"**
4. El sistema actualizará automáticamente el inventario

### Registro de Salidas

1. Ve a la pestaña **"📤 Salidas"**
2. Selecciona el producto del menú desplegable
3. El sistema mostrará el stock disponible
4. Ingresa la cantidad a retirar
5. Selecciona el motivo (venta, consumo, merma, etc.)
6. Haz clic en **"✓ Registrar Salida"**
7. El inventario se actualizará automáticamente

### Consultar Inventario

1. Ve a la pestaña **"📊 Inventario"**
2. Verás un resumen con:
   - Total de productos
   - Total de lotes
   - Productos con stock bajo
3. Usa la barra de búsqueda para encontrar productos específicos
4. La tabla muestra todo el inventario disponible

### Control de Vencimientos

1. Ve a la pestaña **"⚠️ Vencimientos"**
2. Verás tres categorías:
   - 🔴 **Vencidos**: Productos que ya pasaron su fecha de vencimiento
   - 🟡 **Próximos a Vencer**: Productos que vencen en los próximos 30 días
   - 🟢 **En Buen Estado**: Productos con vencimiento lejano o sin fecha

## 🔧 API REST

El sistema expone las siguientes APIs:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/entradas` | Listar todas las entradas |
| POST | `/api/entradas` | Crear nueva entrada |
| GET | `/api/salidas` | Listar todas las salidas |
| POST | `/api/salidas` | Crear nueva salida |
| GET | `/api/inventario` | Ver inventario actual |
| GET | `/api/productos` | Listar productos para selectores |
| GET | `/api/resumen` | Obtener resumen de inventario |
| GET | `/api/vencimientos` | Ver productos por vencimiento |
| GET | `/api/init-db` | Inicializar base de datos |

### Ejemplo de API

**Obtener inventario:**
```bash
curl http://localhost:3000/api/inventario
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Harina P.A.N",
      "stock": 50,
      "unidad": "kg",
      "fecha_vencimiento": "2024-12-31"
    }
  ]
}
```

**Crear entrada:**
```bash
curl -X POST http://localhost:3000/api/entradas \
  -H "Content-Type: application/json" \
  -d '{"producto":"Harina P.A.N","cantidad":50,"unidad":"kg","lote":"LOTE-001","proveedor":"Distribuidora","fecha":"2024-01-15"}'
```

## 💾 Almacenamiento de Datos

- **Base de datos**: MySQL (XAMPP)
- **Tablas**: `productos`, `entradas`, `salidas`
- **Persistencia**: Los datos surviven reinicios del servidor
- **Acceso**: Múltiples usuarios pueden acceder simultáneamente

## 🔧 Requisitos Técnicos

- **Node.js**: Versión 14 o superior
- **MySQL**: Versión 5.7 o superior (incluido en XAMPP)
- **Navegador**: Chrome, Firefox, Edge (moderno)
- **RAM**: Mínimo 512MB
- **Espacio**: Mínimo 50MB

## ⚠️ Advertencias Importantes

1. **XAMPP Running**: Asegúrate de que Apache/MySQL esté ejecutándose
2. **Respaldo**: Haz respaldos periódicos de tu base de datos MySQL
3. **Puerto 3306**: Verifica que MySQL use el puerto correcto
4. **Credenciales**: Usa usuario `root` sin contraseña para desarrollo local

## 🆘 Solución de Problemas

### Error de conexión a MySQL
- Verifica que XAMPP/MySQL esté ejecutándose
- Confirma que el puerto sea 3306
- Revisa las credenciales en `.env`

### Base de datos no existe
- Ejecuta `npm run init-db` para crearla
- Verifica que el usuario tenga permisos CREATE

### Puerto en uso
- Cambia el puerto en `.env` o detén el proceso usando el puerto 3000

### Los datos no se guardan
- Verifica conexión a MySQL
- Revisa los logs del servidor
- Confirma que la base de datos fue inicializada

## 📊 Ejemplo de Uso

### Escenario: Llegada de mercancía

1. Llega un pedido de 50 kg de Harina P.A.N
2. Registras la entrada:
   - Producto: Harina P.A.N
   - Cantidad: 50 kg
   - Lote: LOTE-2024-001
   - Proveedor: Distribuidora Central
   - Fecha: Hoy
   - Vencimiento: 31/12/2024
3. El sistema actualiza el inventario automáticamente

### Escenario: Venta de producto

1. Un cliente compra 5 kg de Harina P.A.N
2. Registras la salida:
   - Seleccionas "Harina P.A.N"
   - Cantidad: 5 kg
   - Motivo: Venta
3. El stock se actualiza a 45 kg automáticamente

## 🛠️ Desarrollo

### Instalar dependencias
```bash
npm install
```

### Modo desarrollo (con reinicio automático)
```bash
npm install -g nodemon
nodemon server.js
```

### Verificar Base de Datos en phpMyAdmin

1. Abre http://localhost/phpmyadmin
2. Selecciona la base de datos `control_facil`
3. Verifica las tablas:
   - `productos`: Inventario actual
   - `entradas`: Historial de entradas
   - `salidas`: Historial de salidas

---

**Control Fácil** - Gestión de inventario simple y efectiva para tu cantina 🏪
