// ============================================
// CONTROL FÁCIL - Servidor con MySQL
// ============================================

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_facil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// ============================================
// API ENTRADAS
// ============================================

// GET - Obtener entradas
app.get('/api/entradas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, p.nombre as producto_nombre 
      FROM entradas e
      LEFT JOIN productos p ON e.producto_id = p.id
      ORDER BY e.id DESC LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear entrada
app.post('/api/entradas', async (req, res) => {
  try {
    const { producto, cantidad, unidad, lote, proveedor, fecha, vencimiento } = req.body;
    
    // Normalizar nombre del producto (trim y lowercase para comparación)
    const productoNormalizado = producto.trim();
    
    // Insertar o actualizar producto
    let productoId;
    const [productos] = await pool.query(
      'SELECT id FROM productos WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))',
      [productoNormalizado]
    );
    
    if (productos.length > 0) {
      productoId = productos[0].id;
    } else {
      const [result] = await pool.query(
        'INSERT INTO productos (nombre, stock, unidad, fecha_vencimiento) VALUES (?, ?, ?, ?)',
        [productoNormalizado, cantidad, unidad, vencimiento || null]
      );
      productoId = result.insertId;
    }
    
    // Insertar entrada
    const [entradaResult] = await pool.query(
      `INSERT INTO entradas (producto_id, cantidad, unidad, lote, proveedor, fecha, vencimiento) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productoId, cantidad, unidad, lote, proveedor, fecha, vencimiento || null]
    );
    
    // Actualizar stock
    await pool.query(
      'UPDATE productos SET stock = stock + ? WHERE id = ?',
      [cantidad, productoId]
    );
    
    res.json({ success: true, message: 'Entrada registrada', id: entradaResult.insertId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar entrada
app.delete('/api/entradas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la entrada para saber la cantidad y producto
    const [entrada] = await pool.query(
      'SELECT * FROM entradas WHERE id = ?',
      [id]
    );
    
    if (entrada.length === 0) {
      return res.status(404).json({ success: false, error: 'Entrada no encontrada' });
    }
    
    const { producto_id, cantidad } = entrada[0];
    
    // Eliminar la entrada
    await pool.query('DELETE FROM entradas WHERE id = ?', [id]);
    
    // Restar del stock
    await pool.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [cantidad, producto_id]
    );
    
    res.json({ success: true, message: 'Entrada eliminada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// API SALIDAS
// ============================================

// GET - Obtener salidas
app.get('/api/salidas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, p.nombre as producto_nombre 
      FROM salidas s
      LEFT JOIN productos p ON s.producto_id = p.id
      ORDER BY s.id DESC LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear salida
app.post('/api/salidas', async (req, res) => {
  try {
    const { producto_id, cantidad, motivo } = req.body;
    
    // Verificar stock
    const [productos] = await pool.query(
      'SELECT id, stock, nombre FROM productos WHERE id = ?',
      [producto_id]
    );
    
    if (productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Producto no encontrado' });
    }
    
    if (productos[0].stock < cantidad) {
      return res.status(400).json({ success: false, error: 'Stock insuficiente' });
    }
    
    // Insertar salida
    await pool.query(
      `INSERT INTO salidas (producto_id, cantidad, motivo) VALUES (?, ?, ?)`,
      [producto_id, cantidad, motivo]
    );
    
    // Actualizar stock
    await pool.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [cantidad, producto_id]
    );
    
    res.json({ success: true, message: 'Salida registrada' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// API INVENTARIO
// ============================================

// GET - Obtener inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, stock, unidad, fecha_vencimiento 
      FROM productos 
      WHERE stock > 0
      ORDER BY nombre
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obtener resumen
app.get('/api/resumen', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE stock > 0');
    const [bajos] = await pool.query('SELECT COUNT(*) as bajos FROM productos WHERE stock > 0 AND stock < 10');
    
    res.json({
      success: true,
      data: {
        total: productos[0].total,
        bajos: bajos[0].bajos
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// API VENCIMIENTOS
// ============================================

// GET - Obtener vencimientos
app.get('/api/vencimientos', async (req, res) => {
  try {
    // Obtener fecha actual en timezone local (Caracas = UTC-4)
    const ahora = new Date();
    // Ajustar a UTC-4 restando 4 horas
    const hoyLocal = new Date(ahora.getTime() - (4 * 60 * 60 * 1000));
    const hoyStr = hoyLocal.toISOString().split('T')[0];
    
    // Calcular fecha en 30 días
    const en30Dias = new Date(hoyLocal.getTime() + (30 * 24 * 60 * 60 * 1000));
    const en30DiasStr = en30Dias.toISOString().split('T')[0];
    
    console.log('Hoy (UTC-4):', hoyStr);
    console.log('En 30 días:', en30DiasStr);
    
    const [rows] = await pool.query(
      `SELECT id, nombre, stock, fecha_vencimiento 
       FROM productos 
       WHERE stock > 0 AND fecha_vencimiento IS NOT NULL
       ORDER BY fecha_vencimiento ASC`
    );
    
    console.log('Productos con vencimiento:', rows.length);
    
    const vencidos = [];
    const proximos = [];
    const buenos = [];
    
    rows.forEach(item => {
      // La fecha de MySQL viene en formato YYYY-MM-DD
      const vencimiento = item.fecha_vencimiento;
      
      // Convertir a objeto Date para comparación correcta
      let fechaVenc;
      if (vencimiento instanceof Date) {
        fechaVenc = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
      } else {
        const partes = vencimiento.split('-');
        fechaVenc = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      }
      
      const fechaHoy = new Date(parseInt(hoyStr.split('-')[0]), parseInt(hoyStr.split('-')[1]) - 1, parseInt(hoyStr.split('-')[2]));
      const fecha30 = new Date(parseInt(en30DiasStr.split('-')[0]), parseInt(en30DiasStr.split('-')[1]) - 1, parseInt(en30DiasStr.split('-')[2]));
      
      if (fechaVenc.getTime() < fechaHoy.getTime()) {
        vencidos.push(item);
      } else if (fechaVenc.getTime() <= fecha30.getTime()) {
        proximos.push(item);
      } else {
        buenos.push(item);
      }
    });
    
    console.log('Vencidos:', vencidos.length, 'Próximos:', proximos.length, 'Buenos:', buenos.length);
    
    res.json({ success: true, data: { vencidos, proximos, buenos } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// API PRODUCTOS (para selectores)
// ============================================

// GET - Obtener productos para selector
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre, stock, unidad 
      FROM productos 
      WHERE stock > 0
      ORDER BY nombre
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay salidas asociadas
    const [salidas] = await pool.query(
      'SELECT COUNT(*) as count FROM salidas WHERE producto_id = ?',
      [id]
    );
    
    if (salidas[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar el producto porque tiene salidas registradas' 
      });
    }
    
    // Eliminar entradas asociadas
    await pool.query('DELETE FROM entradas WHERE producto_id = ?', [id]);
    
    // Eliminar producto
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    
    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// INICIALIZAR BASE DE DATOS
// ============================================

app.get('/api/init-db', async (req, res) => {
  try {
    // Crear base de datos si no existe
    await pool.query('CREATE DATABASE IF NOT EXISTS control_facil');
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
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entradas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT,
        cantidad INT NOT NULL,
        unidad VARCHAR(50),
        lote VARCHAR(100),
        proveedor VARCHAR(200),
        fecha DATE,
        vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT,
        cantidad INT NOT NULL,
        motivo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    res.json({ success: true, message: 'Base de datos inicializada' });
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
