// ============================================
// Inicializar Base de Datos MySQL Relacional
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
  console.log('🚀 Inicializando base de datos relacional...');
  
  try {
    // Conectar sin base de datos
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conexión establecida');
    
    // Crear base de datos con charset utf8mb4 para mejor soporte
    await connection.query('CREATE DATABASE IF NOT EXISTS control_facil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✓ Base de datos "control_facil" creada');
    
    // Usar la base de datos
    await connection.query('USE control_facil');
    
    // ============================================
    // TABLA: productos
    // ============================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        stock INT DEFAULT 0,
        unidad VARCHAR(50) DEFAULT 'unidades',
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabla "productos" creada');
    
    // ============================================
    // TABLA: lotes (NUEVA - evita duplicados de lote por producto)
    // ============================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        numero_lote VARCHAR(100) NOT NULL,
        proveedor VARCHAR(200),
        fecha_vencimiento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_producto_lote (producto_id, numero_lote),
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabla "lotes" creada (con UNIQUE para evitar duplicados de lote por producto)');
    
    // ============================================
    // TABLA: entradas (modificada para referenciar lotes)
    // ============================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS entradas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        lote_id INT NOT NULL,
        cantidad INT NOT NULL,
        unidad VARCHAR(50),
        fecha DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabla "entradas" creada (relacionada con lotes)');
    
    // ============================================
    // TABLA: salidas
    // ============================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS salidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        motivo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabla "salidas" creada');
    
    // ============================================
    // TABLA: usuarios
    // ============================================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY,
        rol VARCHAR(50) NOT NULL,
        nombre_de_usuario VARCHAR(100) NOT NULL UNIQUE,
        clave VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Tabla "usuarios" creada');
    
    // Insertar usuarios
    await connection.query(`
      INSERT IGNORE INTO usuarios (id, rol, nombre_de_usuario, clave) VALUES
      (1, 'super admin', 'cantina', 'super1234'),
      (2, 'admin', 'kripineitor', 'kripi1234'),
      (3, 'us', 'pepe', 'pepe1234')
    `);
    console.log('✓ Usuarios registrados');
    
    await connection.end();
    console.log('\n✅ Base de datos relacional lista para usar!');
    console.log('\n📋 Relaciones creadas:');
    console.log('   • productos → lotes (Foreign Key)');
    console.log('   • productos → entradas (Foreign Key)');
    console.log('   • lotes → entradas (Foreign Key)');
    console.log('   • productos → salidas (Foreign Key)');
    console.log('\n🔒 Restricción UNIQUE: producto_id + numero_lote en tabla lotes');
    console.log('   (Evita duplicar "mary lote01" para el mismo producto)\n');
    console.log('📊 Configuración:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Puerto: ${dbConfig.port}`);
    console.log(`   Base de datos: control_facil`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inicializarDB();
