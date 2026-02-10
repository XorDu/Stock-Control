# System Patterns: Control Fácil

## Architecture Overview

```
control-facil/
├── .env.example          # Configuración de base de datos
├── init-db.js            # Script para inicializar MySQL
├── package.json          # Dependencias del proyecto
├── server.js             # Servidor web y APIs
└── public/               # Archivos públicos
    ├── index.html        # Interfaz principal
    ├── app.js            # Lógica del frontend
    └── styles.css        # Estilos visuales
```

## Key Design Patterns

### 1. API REST Pattern

Express.js con endpoints RESTful:

```
GET    /api/entradas      # Listar todas las entradas
POST   /api/entradas      # Crear nueva entrada
GET    /api/salidas       # Listar todas las salidas
POST   /api/salidas       # Crear nueva salida
GET    /api/inventario    # Ver inventario actual
GET    /api/productos     # Listar productos para selectores
GET    /api/resumen       # Obtener resumen de inventario
GET    /api/vencimientos  # Ver productos por vencimiento
```

### 2. Frontend Pattern

Vanilla JS con fetch API para comunicación con el servidor:

```javascript
// Fetch data
const response = await fetch('/api/inventario');
const data = await response.json();

// Post data
await fetch('/api/entradas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 3. Database Pattern

MySQL connection pool con consultas parametrizadas:

```javascript
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};
```

## Styling Conventions

### CSS Structure

- Layout principal en `styles.css`
- Utilidades CSS para componentes reutilizables
- Variables CSS para colores y espaciados

### Common Patterns

```css
/* Contenedor principal */
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }

/* Tarjetas */
.card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* Botones */
.btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #007bff; color: white; }
```

## File Naming Conventions

- JavaScript: camelCase (`app.js`, `init-db.js`)
- CSS: kebab-case (`styles.css`)
- HTML: lowercase (`index.html`)
- Configuración: lowercase (`.env.example`)

## State Management

- Estado del servidor: Base de datos MySQL
- Estado del frontend: Vanilla JS con variables locales
- Sincronización: Fetch API con el servidor
