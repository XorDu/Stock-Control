// ============================================
// ENTRADAS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// GET - Obtener entradas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, p.nombre as producto_nombre, l.numero_lote as lote, l.proveedor, l.fecha_vencimiento as lote_vencimiento
      FROM entradas e
      LEFT JOIN productos p ON e.producto_id = p.id
      LEFT JOIN lotes l ON e.lote_id = l.id
      ORDER BY e.id DESC LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear entrada
// SEGURIDAD: Solo Admin y Super Admin pueden registrar entradas
router.post('/', async (req, res) => {
  try {
    const { producto, cantidad, unidad, lote, proveedor, fecha, vencimiento } = req.body;

    // Validar que la fecha de vencimiento no esté vacía
    if (!vencimiento) {
      return res.status(400).json({ success: false, error: 'La fecha de vencimiento es obligatoria.' });
    }
    
    // Validar que el lote no esté vacío
    if (!lote || lote.trim() === '') {
      return res.status(400).json({ success: false, error: 'El número de lote es obligatorio.' });
    }
    
    // Normalizar nombre del producto (trim y lowercase para comparación)
    const productoNormalizado = producto.trim();
    const loteNormalizado = lote.trim();
    
    // Insertar o actualizar producto
    let productoId;
    const [productos] = await pool.query(
      'SELECT id FROM productos WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))',
      [productoNormalizado]
    );
    
    if (productos.length > 0) {
      productoId = productos[0].id;
    } else {
      // Insertar nuevo producto con stock inicial 0 (se actualizará luego)
      const [result] = await pool.query(
        'INSERT INTO productos (nombre, stock, unidad, fecha_vencimiento) VALUES (?, 0, ?, ?)',
        [productoNormalizado, unidad, vencimiento]
      );
      productoId = result.insertId;
    }
    
    // Verificar o crear lote (con restricción UNIQUE para evitar duplicados)
    let loteId;
    const [lotesExistentes] = await pool.query(
      'SELECT id FROM lotes WHERE producto_id = ? AND TRIM(LOWER(numero_lote)) = TRIM(LOWER(?))',
      [productoId, loteNormalizado]
    );
    
    if (lotesExistentes.length > 0) {
      // El lote ya existe para este producto - ERROR por restricción relacional
      return res.status(400).json({ 
        success: false, 
        error: `El lote "${loteNormalizado}" ya está registrado para el producto "${productoNormalizado}". No se permiten lotes duplicados para el mismo producto.` 
      });
    } else {
      // Crear nuevo lote
      const [loteResult] = await pool.query(
        'INSERT INTO lotes (producto_id, numero_lote, proveedor, fecha_vencimiento) VALUES (?, ?, ?, ?)',
        [productoId, loteNormalizado, proveedor, vencimiento]
      );
      loteId = loteResult.insertId;
    }
    
    // Insertar entrada referenciando al lote
    const [entradaResult] = await pool.query(
      `INSERT INTO entradas (producto_id, lote_id, cantidad, unidad, fecha) 
       VALUES (?, ?, ?, ?, ?)`,
      [productoId, loteId, cantidad, unidad, fecha]
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
// SEGURIDAD: Solo Admin y Super Admin pueden eliminar entradas
router.delete('/:id', verificarRol(['admin', 'super admin']), async (req, res) => {
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

module.exports = router;
