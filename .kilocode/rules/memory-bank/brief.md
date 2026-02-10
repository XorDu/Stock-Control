# Project Brief: Control Fácil - Sistema de Gestión de Inventario

## Purpose

**Control Fácil** es un sistema simple y efectivo para gestionar el inventario de cantinas. Diseñado para ser fácil de usar con almacenamiento persistente en MySQL (XAMPP).

## Target Users

- Dueños de cantinas que necesitan controlar su inventario
- Pequeños negocios que requieren gestión de productos perecederos
- Usuarios que prefieren soluciones simples y directas

## Core Use Case

1. El usuario registra productos que llegan a la cantina (entradas)
2. El usuario registra productos que salen (ventas, consumo, merma)
3. El sistema mantiene control de stock en tiempo real
4. El sistema alerta sobre productos vencidos o próximos a vencer

## Key Requirements

### Must Have

- Registro de entradas y salidas de productos
- Control de stock en tiempo real
- Sistema de lotes/partidas
- Control de fechas de vencimiento
- Persistencia de datos con MySQL
- Interfaz web simple y funcional

### Nice to Have

- Reportes y estadísticas
- Alertas por email de vencimientos
- Gestión de proveedores
- Exportación de datos

## Success Metrics

- Los usuarios pueden registrar entradas y salidas sin problemas
- El inventario se mantiene actualizado automáticamente
- Los productos vencidos son claramente identificables

## Constraints

- Base de datos: MySQL (XAMPP)
- Servidor: Node.js
- Frontend: HTML/CSS/Vanilla JS (sin frameworks complejos)
