// ============================================
// LOTES ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// GET - Obtener todos los lotes
router.get('/', async (req, res) => {
  try {
    // Obtener todos los lotes con el stock calculado por lote (sumando las entradas)
    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.producto_id,
        l.numero_lote,
        l.proveedor,
        l.fecha_vencimiento,
        l.created_at,
        p.nombre as producto_nombre,
        p.unidad,
        COALESCE(SUM(e.cantidad), 0) as stock
      FROM lotes l
      LEFT JOIN productos p ON l.producto_id = p.id
      LEFT JOIN entradas e ON l.id = e.lote_id
      GROUP BY l.id, l.producto_id, l.numero_lote, l.proveedor, l.fecha_vencimiento, l.created_at, p.nombre, p.unidad
      HAVING stock > 0
      ORDER BY p.nombre, l.numero_lote
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obtener lotes de un producto específico
router.get('/producto/:producto_id', async (req, res) => {
  try {
    const { producto_id } = req.params;
    
    // Obtener lotes del producto con stock calculado por lote
    const [lotes] = await pool.query(`
      SELECT 
        l.id,
        l.producto_id,
        l.numero_lote,
        l.proveedor,
        l.fecha_vencimiento,
        l.created_at,
        p.nombre as producto_nombre,
        p.unidad,
        COALESCE(SUM(e.cantidad), 0) as stock
      FROM lotes l
      LEFT JOIN productos p ON l.producto_id = p.id
      LEFT JOIN entradas e ON l.id = e.lote_id
      WHERE l.producto_id = ?
      GROUP BY l.id, l.producto_id, l.numero_lote, l.proveedor, l.fecha_vencimiento, l.created_at, p.nombre, p.unidad
      HAVING stock > 0
      ORDER BY l.numero_lote
    `, [producto_id]);
    
    // Obtener información del producto (stock total)
    const [productos] = await pool.query(
      'SELECT id, nombre, stock, unidad FROM productos WHERE id = ?',
      [producto_id]
    );
    
    res.json({ 
      success: true, 
      data: {
        producto: productos[0] || null,
        lotes: lotes
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Verificar si un número de lote ya existe
router.get('/verificar', async (req, res) => {
  try {
    const { numero_lote, producto_nombre } = req.query;
    
    if (!numero_lote || numero_lote.trim() === '') {
      return res.json({ success: true, existe: false });
    }
    
    const loteNormalizado = numero_lote.trim();
    
    // Si se proporciona el nombre del producto, buscar por producto específico
    if (producto_nombre && producto_nombre.trim() !== '') {
      const productoNormalizado = producto_nombre.trim();
      
      // Verificar si el producto existe
      const [productos] = await pool.query(
        'SELECT id FROM productos WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))',
        [productoNormalizado]
      );
      
      if (productos.length > 0) {
        // Verificar si el lote ya existe para este producto
        const [lotes] = await pool.query(
          'SELECT id, numero_lote, proveedor FROM lotes WHERE producto_id = ? AND TRIM(LOWER(numero_lote)) = TRIM(LOWER(?))',
          [productos[0].id, loteNormalizado]
        );
        
        return res.json({ 
          success: true, 
          existe: lotes.length > 0,
          datos: lotes.length > 0 ? {
            numero_lote: lotes[0].numero_lote,
            proveedor: lotes[0].proveedor
          } : null
        });
      }
    }
    
    // Buscar si el lote existe en cualquier producto (sin filtrar por producto)
    const [lotes] = await pool.query(
      'SELECT id, numero_lote, proveedor FROM lotes WHERE TRIM(LOWER(numero_lote)) = TRIM(LOWER(?))',
      [loteNormalizado]
    );
    
    res.json({ 
      success: true, 
      existe: lotes.length > 0,
      datos: lotes.length > 0 ? {
        numero_lote: lotes[0].numero_lote,
        proveedor: lotes[0].proveedor
      } : null
    });
  } catch (error) {
    console.error('Error verificando lote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obtener vencimientos por lote
router.get('/vencimientos', async (req, res) => {
  try {
    // Obtener fecha actual en timezone local (Caracas = UTC-4)
    const ahora = new Date();
    const hoyLocal = new Date(ahora.getTime() - (4 * 60 * 60 * 1000));
    const hoyStr = hoyLocal.toISOString().split('T')[0];
    
    // Calcular fecha en 30 días
    const en30Dias = new Date(hoyLocal.getTime() + (30 * 24 * 60 * 60 * 1000));
    const en30DiasStr = en30Dias.toISOString().split('T')[0];
    
    // Obtener lotes con su información (usando la tabla lotes directamente)
    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.producto_id,
        l.numero_lote,
        l.fecha_vencimiento,
        COALESCE(p.nombre, 'Producto sin nombre') as producto_nombre,
        COALESCE(p.unidad, 'unidades') as unidad,
        COALESCE(SUM(e.cantidad), 0) as stock
      FROM lotes l
      LEFT JOIN productos p ON l.producto_id = p.id
      LEFT JOIN entradas e ON l.id = e.lote_id
      WHERE l.fecha_vencimiento IS NOT NULL
      GROUP BY l.id, l.producto_id, l.numero_lote, l.fecha_vencimiento, p.nombre, p.unidad
      HAVING stock > 0
      ORDER BY l.fecha_vencimiento ASC
    `);
    
    const vencidos = [];
    const proximos = [];
    
    rows.forEach(item => {
      const vencimiento = item.fecha_vencimiento;
      
      let fechaVenc;
      if (vencimiento instanceof Date) {
        fechaVenc = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
      } else if (typeof vencimiento === 'string') {
        const partes = vencimiento.split('-');
        fechaVenc = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      }
      
      if (!fechaVenc || isNaN(fechaVenc.getTime())) {
        return;
      }
      
      const fechaHoy = new Date(parseInt(hoyStr.split('-')[0]), parseInt(hoyStr.split('-')[1]) - 1, parseInt(hoyStr.split('-')[2]));
      const fecha30 = new Date(parseInt(en30DiasStr.split('-')[0]), parseInt(en30DiasStr.split('-')[1]) - 1, parseInt(en30DiasStr.split('-')[2]));
      
      if (fechaVenc.getTime() < fechaHoy.getTime()) {
        vencidos.push(item);
      } else if (fechaVenc.getTime() <= fecha30.getTime()) {
        proximos.push(item);
      }
    });
    
    res.json({ success: true, data: { vencidos, proximos } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
