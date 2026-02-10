// ============================================
// Inicializar Base de Datos MySQL
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function inicializarDB() {
  console.log('🚀 Inicializando base de datos...');
  
  try {
    // Conectar sin base de datos
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conexión establecida');
    
    // Crear base de datos
    await connection.query('CREATE DATABASE IF NOT EXISTS control_facil');
    console.log('✓ Base de datos "control_facil" creada');
    
    // Usar la base de datos
    await connection.query('USE control_facil');
    
    // Crear tablas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        stock INT DEFAULT 0,
        unidad VARCHAR(50) DEFAULT 'unidades',
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla "productos" creada');
    
    await connection.query(`
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
    console.log('✓ Tabla "entradas" creada');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS salidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT,
        cantidad INT NOT NULL,
        motivo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla "salidas" creada');
    
    await connection.end();
    console.log('\n✅ Base de datos lista para usar!');
    console.log('\n📋 Configuración:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Puerto: ${dbConfig.port}`);
    console.log(`   Base de datos: control_facil`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inicializarDB();
