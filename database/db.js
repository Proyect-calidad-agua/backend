const mysql = require('mysql2/promise'); // <--- OJO AQUÍ: Importamos directamente la versión promesa
const dotenv = require('dotenv');

dotenv.config();

// Creamos el pool directamente (ya es una promesa automáticamente)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'water_quality_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool directamente
module.exports = pool;