# Active Context: Control Fácil - Sistema de Gestión de Inventario

## Current State

**Project Status**: ✅ Desarrollo activo

Sistema de gestión de inventario para cantinas con MySQL (XAMPP) ya implementado y funcional.

## Recently Completed

- [x] Sistema de gestión de inventario con MySQL/XAMPP
- [x] APIs REST para entradas, salidas e inventario
- [x] Interfaz frontend con registro de entradas/salidas
- [x] Control de vencimiento de productos
- [x] Sistema de lotes y partidas
- [x] Sistema de autenticación con login (usuario: cantina, clave: 1234)
- [x] Documentación del proyecto
- [x] Corrección de lógica de vencimiento (timezone UTC-4 para Venezuela)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `server.js` | Servidor web y APIs | ✅ Listo |
| `init-db.js` | Script de inicialización de BD | ✅ Listo |
| `public/login.html` | Pantalla de login | ✅ Listo |
| `public/index.html` | Interfaz principal | ✅ Listo |
| `public/app.js` | Lógica del frontend | ✅ Listo |
| `public/styles.css` | Estilos visuales | ✅ Listo |
| `AGENTS.md` | Guía para agentes IA | ✅ Actualizado |

## Base de Datos MySQL (XAMPP)

### Tablas

- `productos`: Inventario actual con stock, lotes y vencimiento
- `entradas`: Historial de productos que ingresan
- `salidas`: Historial de productos que salen

### Configuración

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=control_facil
```

### Comandos

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

## Memory Bank Updates

After completing changes, always update `.kilocode/rules/memory-bank/context.md`:
- Add to "Recently Completed" section
- Document any new features or API endpoints
- Update "Current Structure" if files are added/removed

## Session History

| Date | Changes |
|------|---------|
| 2026-02-06 | Corrección de lógica de vencimiento (timezone UTC-4 para Venezuela) |
| 2026-02-06 | Actualización de documentación y limpieza de archivos obsoletos |
| Initial | Proyecto Control Fácil con MySQL/XAMPP |
