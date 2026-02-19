// ============================================
// PRODUCTOS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// GET - Obtener productos para selector
// SEGURIDAD: Admin, Super Admin y Usuarios (us) pueden ver productos
router.get('/', verificarRol(['us', 'admin', 'super admin']), async (req, res) => {
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

// GET - Obtener inventario agrupado por producto
// SEGURIDAD: Admin, Super Admin y Usuarios (us) pueden ver inventario
router.get('/inventario', verificarRol(['us', 'admin', 'super admin']), async (req, res) => {
  try {
    // Obtener productos con sus lotes
    const [productos] = await pool.query(`
      SELECT DISTINCT p.id, p.nombre, p.stock, p.unidad
      FROM productos p
      WHERE p.stock > 0
      ORDER BY p.nombre
    `);
    
    // Para cada producto, obtener el conteo de lotes
    const productosConLotes = await Promise.all(productos.map(async (producto) => {
      const [lotes] = await pool.query(`
        SELECT COUNT(*) as total_lotes FROM (
          SELECT l.id
          FROM lotes l
          LEFT JOIN entradas e ON l.id = e.lote_id
          WHERE l.producto_id = ?
          GROUP BY l.id
          HAVING COALESCE(SUM(e.cantidad), 0) > 0
        ) as active_lotes
      `, [producto.id]);
      return {
        ...producto,
        total_lotes: lotes[0]?.total_lotes || 0
      };
    }));
    
    res.json({ success: true, data: productosConLotes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obtener resumen
// SEGURIDAD: Admin, Super Admin y Usuarios (us) pueden ver resumen
router.get('/resumen', verificarRol(['us', 'admin', 'super admin']), async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE stock > 0');
    const [lotes] = await pool.query(`
      SELECT COUNT(*) as total_lotes FROM (
        SELECT l.id
        FROM lotes l
        LEFT JOIN entradas e ON l.id = e.lote_id
        GROUP BY l.id
        HAVING COALESCE(SUM(e.cantidad), 0) > 0
      ) as active_lotes
    `);
    const [bajos] = await pool.query('SELECT COUNT(*) as bajos FROM productos WHERE stock > 0 AND stock < 10');
    
    res.json({
      success: true,
      data: {
        total: productos[0].total,
        total_lotes: lotes[0].total_lotes,
        bajos: bajos[0].bajos
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar producto
// SEGURIDAD: Solo Super Admin puede eliminar productos del catálogo
router.delete('/:id', verificarRol(['super admin']), async (req, res) => {
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

module.exports = router;
