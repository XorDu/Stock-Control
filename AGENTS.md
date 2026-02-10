# Control Fácil - Guía para Agentes IA

## Descripción del Proyecto

Sistema de gestión de inventario para cantinas con MySQL (XAMPP) y autenticación de usuario.

## Credenciales de Acceso

| Campo | Valor |
|-------|-------|
| Usuario | `cantina` |
| Contraseña | `1234` |

## Estructura del Proyecto

```
control-facil/
├── .env.example          # Configuración de base de datos
├── init-db.js            # Script para inicializar MySQL
├── package.json          # Dependencias del proyecto
├── server.js             # Servidor web y APIs
└── public/               # Archivos públicos
    ├── login.html        # Pantalla de inicio de sesión
    ├── index.html        # Interfaz principal
    ├── app.js            # Lógica del frontend
    └── styles.css        # Estilos visuales
```

## Base de Datos

La base de datos MySQL ya está implementada con las siguientes tablas:
- `productos`: Inventario actual
- `entradas`: Historial de entradas
- `salidas`: Historial de salidas

### Comandos Disponibles

```bash
npm run init-db    # Inicializar base de datos
npm start          # Iniciar servidor (puerto 3000)
```

## APIs Disponibles

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

## Memory Bank

Después de completar cambios, actualizar:
- `.kilocode/rules/memory-bank/context.md` - Estado actual y cambios recientes
