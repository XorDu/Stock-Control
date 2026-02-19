// ============================================
// USUARIOS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database.config');
const { verificarRol } = require('../middleware/auth.middleware');

// POST - Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario en la base de datos
    const [usuarios] = await pool.query(
      'SELECT id, rol, nombre_de_usuario FROM usuarios WHERE nombre_de_usuario = ? AND clave = ?',
      [username, password]
    );
    
    if (usuarios.length > 0) {
      res.json({ 
        success: true, 
        user: {
          id: usuarios[0].id,
          rol: usuarios[0].rol,
          nombre_de_usuario: usuarios[0].nombre_de_usuario
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Listar usuarios (Solo Super Admin)
router.get('/', verificarRol(['super admin']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, rol, nombre_de_usuario FROM usuarios ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear usuario (Solo Super Admin)
router.post('/', verificarRol(['super admin']), async (req, res) => {
  try {
    const { nombre_de_usuario, clave, rol } = req.body;

    // Validar datos
    if (!nombre_de_usuario || !clave || !rol) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
    }

    // Validar parámetros de seguridad de la contraseña
    if (clave.length < 8) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    if (!/[A-Z]/.test(clave)) {
      return res.status(400).json({ success: false, error: 'La contraseña debe contener al menos una letra mayúscula' });
    }
    if (!/[0-9]/.test(clave)) {
      return res.status(400).json({ success: false, error: 'La contraseña debe contener al menos un número' });
    }

    // Verificar si el usuario ya existe
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE nombre_de_usuario = ?', [nombre_de_usuario]);
    if (existente.length > 0) {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe' });
    }

    // Generar ID manual (MAX + 1) para asegurar compatibilidad si no hay AUTO_INCREMENT
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM usuarios');
    const nextId = (maxIdResult[0].maxId || 0) + 1;

    // Insertar usuario
    await pool.query(
      'INSERT INTO usuarios (id, rol, nombre_de_usuario, clave) VALUES (?, ?, ?, ?)',
      [nextId, rol, nombre_de_usuario, clave]
    );

    res.json({ success: true, message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar usuario (Solo Super Admin)
router.delete('/:id', verificarRol(['super admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
