# Technical Context: Control Fácil - Sistema de Gestión de Inventario

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Node.js      | 14+     | Runtime de JavaScript           |
| Express      | 4.x     | Servidor web y APIs             |
| MySQL        | 5.7+    | Base de datos (XAMPP)           |
| HTML/CSS     | 5/3     | Frontend estático               |
| Vanilla JS   | ES2020  | Lógica del frontend             |

## Development Environment

### Prerequisites

- XAMPP con MySQL ejecutándose (puerto 3306)
- Node.js versión 14 o superior

### Commands

```bash
npm install           # Instalar dependencias
npm run init-db       # Inicializar base de datos MySQL
npm start             # Iniciar servidor (http://localhost:3000)
```

## Dependencies

### Production Dependencies

```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "dotenv": "^16.3.1"
}
```

### Dev Dependencies

```json
{
  "nodemon": "^3.0.1"
}
```

## File Structure

```
/
├── .env.example          # Configuración de base de datos
├── .gitignore
├── init-db.js            # Script de inicialización de BD
├── package.json          # Dependencias y scripts
├── server.js             # Servidor Express y APIs
└── public/               # Archivos estáticos
    ├── index.html        # Interfaz principal
    ├── app.js            # Lógica del frontend
    └── styles.css        # Estilos visuales
```

## Base de Datos MySQL

### Configuración (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=control_facil
```

### Tablas

- `productos`: Inventario actual con stock, lotes y vencimiento
- `entradas`: Historial de productos que ingresan
- `salidas`: Historial de productos que salen

## APIs REST

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

## Technical Constraints

- MySQL debe estar ejecutándose antes de iniciar el servidor
- Los datos persisten en la base de datos MySQL
- Interfaz web sin frameworks (Vanilla JS)

## Performance Considerations

- Consultas SQL parametrizadas para seguridad
- Pool de conexiones MySQL para eficiencia
- Archivos estáticos servidos directamente por Express
