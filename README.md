# 🏪 Control Fácil - Sistema de Gestión de Inventario

Sistema completo de gestión de inventario para cantinas con control de lotes, vencimientos y roles de usuario.

## 📁 Estructura del Proyecto

```
Easy-Stock-Control/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   └── database.config.js      # Configuración de base de datos
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # Middleware de autenticación
│   │   ├── routes/
│   │   │   ├── entradas.routes.js      # Rutas de entradas
│   │   │   ├── salidas.routes.js       # Rutas de salidas
│   │   │   ├── lotes.routes.js         # Rutas de lotes
│   │   │   ├── productos.routes.js     # Rutas de productos
│   │   │   ├── usuarios.routes.js      # Rutas de usuarios
│   │   │   └── reportes.routes.js      # Rutas de reportes
│   │   ├── scripts/
│   │   │   ├── init-db.js              # Script de inicialización de BD
│   │   │   └── migrate_lote_id.js      # Script de migración
│   │   └── server.js                   # Servidor principal
│   └── frontend/
│       ├── assets/
│       │   ├── css/
│       │   │   └── styles.css          # Estilos de la aplicación
│       │   └── js/
│       │       ├── api.service.js      # Servicio de API
│       │       └── app.js              # Lógica principal del frontend
│       └── pages/
│           ├── index.html              # Página principal
│           └── login.html              # Página de login
├── docs/
│   ├── basededatosrelacional.txt       # Documentación de BD
│   ├── SOLUCION_LOTES.md               # Documentación de lotes
│   └── README_instalation.md           # Guía de instalación
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Instalación

### Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Easy-Stock-Control
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=control_facil
   PORT=3000
   ```

4. **Inicializar la base de datos**
   ```bash
   npm run init-db
   ```

5. **Ejecutar migraciones (si es necesario)**
   ```bash
   npm run migrate
   ```

6. **Iniciar el servidor**
   ```bash
   npm start
   ```

7. **Acceder a la aplicación**
   
   Abrir el navegador en: `http://localhost:3000/pages/login.html`

## 👥 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| cantina | super1234 | Super Admin |
| kripineitor | kripi1234 | Admin |
| pepe | pepe1234 | Usuario |

## 🔐 Roles y Permisos

### Super Admin
- Acceso completo al sistema
- Gestión de usuarios
- Eliminación de productos
- Acceso a todos los reportes

### Admin
- Registro de entradas y salidas
- Gestión de inventario
- Visualización de reportes
- No puede gestionar usuarios

### Usuario (us)
- Registro de salidas
- Visualización de inventario
- Visualización de lotes y vencimientos
- No puede ver entradas ni reportes

## 📊 Características Principales

- ✅ Control de entradas y salidas de productos
- ✅ Gestión de lotes con fechas de vencimiento
- ✅ Sistema de roles y permisos
- ✅ Alertas de productos próximos a vencer
- ✅ Reportes de ventas
- ✅ Generación de PDFs
- ✅ Búsqueda y filtrado de productos
- ✅ Interfaz responsive

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2
- dotenv

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- jsPDF

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run init-db` - Inicializa la base de datos
- `npm run migrate` - Ejecuta migraciones pendientes

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

- **productos**: Almacena información de productos
- **lotes**: Gestiona lotes de productos con fechas de vencimiento
- **entradas**: Registra entradas de mercancía
- **salidas**: Registra salidas de mercancía
- **usuarios**: Gestiona usuarios y roles

### Relaciones

- productos → lotes (1:N)
- productos → entradas (1:N)
- lotes → entradas (1:N)
- productos → salidas (1:N)

## 🔧 Configuración Adicional

### Cambiar Puerto del Servidor

Editar el archivo `.env`:
```env
PORT=3000
```

### Configurar Base de Datos Remota

Editar el archivo `.env`:
```env
DB_HOST=tu-servidor.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=control_facil
```

## 📖 Documentación Adicional

Para más información, consultar:
- [Guía de Instalación Detallada](docs/README_instalation.md)


## 🐛 Solución de Problemas

### Error de Conexión a la Base de Datos

1. Verificar que MySQL esté ejecutándose
2. Comprobar las credenciales en el archivo `.env`
3. Asegurarse de que la base de datos existe

### Error al Iniciar el Servidor

1. Verificar que el puerto no esté en uso
2. Comprobar que todas las dependencias estén instaladas
3. Revisar los logs del servidor

## 📄 Licencia

ISC

## 👨‍💻 Contribuciones

Las contribuciones son bienvenidas. Por favor, crear un issue o pull request para sugerencias o mejoras.
