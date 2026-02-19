// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware para verificar el rol del usuario
 * @param {Array} rolesPermitidos - Array de roles que tienen permiso
 * @returns {Function} Middleware function
 */
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.headers['user-rol'];
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado: Permisos insuficientes.' 
      });
    }
    next();
  };
};

module.exports = { verificarRol };
