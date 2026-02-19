// ============================================
// REPORTES ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// GET - Obtener top de productos más vendidos
// SEGURIDAD: Solo Admin y Super Admin pueden ver reportes
router.get('/top-ventas', verificarRol(['admin', 'super admin']), async (req, res) => {
  try {
    // Consulta para obtener el top de productos más vendidos
    // Se filtra solo por motivo 'venta' y agrupa por producto
    const [rows] = await pool.query(`
      SELECT 
        p.id as producto_id,
        p.nombre as producto_nombre,
        p.unidad,
        COUNT(s.id) as total_ventas,
        SUM(s.cantidad) as cantidad_total
      FROM salidas s
      LEFT JOIN productos p ON s.producto_id = p.id
      WHERE s.motivo = 'venta'
      GROUP BY p.id, p.nombre, p.unidad
      ORDER BY cantidad_total DESC
      LIMIT 20
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
