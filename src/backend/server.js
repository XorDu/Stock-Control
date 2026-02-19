// ============================================
// CONTROL FÁCIL - Servidor con MySQL
// ============================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, dbConfig } = require('./config/database.config');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz redirige al login
app.get('/', (req, res) => {
  res.redirect('/pages/login.html');
});

// ============================================
// ROUTES
// ============================================

const entradasRoutes = require('./routes/entradas.routes');
const salidasRoutes = require('./routes/salidas.routes');
const lotesRoutes = require('./routes/lotes.routes');
const productosRoutes = require('./routes/productos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const reportesRoutes = require('./routes/reportes.routes');

app.use('/api/entradas', entradasRoutes);
app.use('/api/salidas', salidasRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/login', usuariosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reporte', reportesRoutes);

// Rutas adicionales para compatibilidad
app.get('/api/inventario', productosRoutes);
app.get('/api/resumen', productosRoutes);
app.get('/api/vencimientos', lotesRoutes);

// ============================================
// INICIALIZACIÓN DE BASE DE DATOS
// ============================================

app.get('/api/init-db', async (req, res) => {
  try {
    // Crear base de datos si no existe con charset utf8mb4
    await pool.query('CREATE DATABASE IF NOT EXISTS control_facil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await pool.query('USE control_facil');
    
    // Crear tablas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        stock INT DEFAULT 0,
        unidad VARCHAR(50) DEFAULT 'unidades',
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Crear tabla lotes con restricción UNIQUE para evitar duplicados de lote por producto
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        numero_lote VARCHAR(100) NOT NULL,
        proveedor VARCHAR(200),
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_producto_lote (producto_id, numero_lote),
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Crear tabla entradas relacionada con lotes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entradas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        lote_id INT NOT NULL,
        cantidad INT NOT NULL,
        unidad VARCHAR(50),
        fecha DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Crear tabla salidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        motivo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY,
        rol VARCHAR(50) NOT NULL,
        nombre_de_usuario VARCHAR(100) NOT NULL UNIQUE,
        clave VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Insertar usuarios por defecto
    await pool.query(`
      INSERT IGNORE INTO usuarios (id, rol, nombre_de_usuario, clave) VALUES
      (1, 'super admin', 'cantina', 'super1234'),
      (2, 'admin', 'kripineitor', 'kripi1234'),
      (3, 'us', 'pepe', 'pepe1234')
    `);
    
    res.json({ success: true, message: 'Base de datos relacional inicializada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para agregar columna lote_id a salidas si no existe
app.get('/api/migrate-lote-id', async (req, res) => {
  try {
    // Verificar si la columna existe
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM salidas LIKE 'lote_id'"
    );
    
    if (columns.length === 0) {
      // Agregar la columna
      await pool.query(
        "ALTER TABLE salidas ADD COLUMN lote_id INT NULL AFTER producto_id"
      );
      res.json({ success: true, message: 'Columna lote_id agregada correctamente' });
    } else {
      res.json({ success: true, message: 'La columna lote_id ya existe' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📦 Base de datos: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});
