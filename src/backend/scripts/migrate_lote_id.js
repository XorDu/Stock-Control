// ============================================
// Script de migración: Agregar columna lote_id a tabla salidas
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_facil',
};

async function migrate() {
  console.log('🚀 Ejecutando migración: agregar lote_id a salidas...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar si la columna ya existe
    const [columnas] = await connection.query(
      "SHOW COLUMNS FROM salidas LIKE 'lote_id'"
    );
    
    if (columnas.length > 0) {
      console.log('✓ La columna lote_id ya existe en la tabla salidas');
    } else {
      // Agregar la columna lote_id
      await connection.query(`
        ALTER TABLE salidas
        ADD COLUMN lote_id INT NULL AFTER producto_id,
        ADD FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE
      `);
      console.log('✓ Columna lote_id agregada a tabla salidas');
    }
    
    await connection.end();
    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrate();
