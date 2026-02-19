// ============================================
// SALIDAS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// GET - Obtener salidas
// SEGURIDAD: Admin, Super Admin y Usuarios (us) pueden ver salidas
router.get('/', verificarRol(['us', 'admin', 'super admin']), async (req, res) => {
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
// SEGURIDAD: Admin, Super Admin y Usuarios (us) pueden registrar salidas
router.post('/', verificarRol(['us', 'admin', 'super admin']), async (req, res) => {
  try {
    const { producto_id, cantidad, motivo, lote_id } = req.body;
    
    // Verificar stock del producto
    const [productos] = await pool.query(
      'SELECT id, stock, nombre FROM productos WHERE id = ?',
      [producto_id]
    );
    
    if (productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Producto no encontrado' });
    }
    
    // Verificar stock del lote si se proporciono
    if (lote_id) {
      const [lotes] = await pool.query(
        `SELECT l.id, COALESCE(SUM(e.cantidad), 0) as cantidad_total
         FROM lotes l
         LEFT JOIN entradas e ON l.id = e.lote_id
         WHERE l.id = ? AND l.producto_id = ?
         GROUP BY l.id`,
        [lote_id, producto_id]
      );
      
      if (lotes.length === 0 || lotes[0].cantidad_total < cantidad) {
        return res.status(400).json({ success: false, error: 'Stock del lote insuficiente' });
      }
    } else if (productos[0].stock < cantidad) {
      return res.status(400).json({ success: false, error: 'Stock insuficiente' });
    }
    
    // Insertar salida
    await pool.query(
      `INSERT INTO salidas (producto_id, cantidad, motivo, lote_id) VALUES (?, ?, ?, ?)`,
      [producto_id, cantidad, motivo, lote_id || null]
    );
    
    // Actualizar stock del lote o eliminarlo si llega a 0
    if (lote_id) {
      const [loteData] = await pool.query(
        `SELECT COALESCE(SUM(cantidad), 0) as cantidad_actual FROM entradas WHERE lote_id = ?`,
        [lote_id]
      );
      
      const cantidadActual = parseInt(loteData[0]?.cantidad_actual || 0);
      const nuevaCantidad = cantidadActual - cantidad;
      
      if (nuevaCantidad <= 0) {
        // Eliminar el lote si llega a 0
        await pool.query('DELETE FROM lotes WHERE id = ?', [lote_id]);
      } else {
        // Insertar una entrada negativa para reducir el lote
        await pool.query(
          `INSERT INTO entradas (producto_id, lote_id, cantidad, fecha) VALUES (?, ?, ?, CURRENT_DATE)`,
          [producto_id, lote_id, -cantidad]
        );
      }
    }
    
    // Actualizar stock general del producto
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

module.exports = router;
