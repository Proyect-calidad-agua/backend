const db = require('../database/db');

class SensorModel {
    static async init() {
        try {
            // Crear tabla de mediciones
            await db.query(`
                CREATE TABLE IF NOT EXISTS mediciones (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tds FLOAT NOT NULL,
                    temperatura FLOAT NOT NULL,
                    turbidez FLOAT NOT NULL,
                    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                    estado ENUM('normal', 'alerta', 'critico') DEFAULT 'normal',
                    origen VARCHAR(50) DEFAULT 'esp32_1'
                )
            `);

            // Crear tabla de alertas
            await db.query(`
                CREATE TABLE IF NOT EXISTS alertas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tipo VARCHAR(50) NOT NULL,
                    valor FLOAT NOT NULL,
                    nivel ENUM('advertencia', 'critico') NOT NULL,
                    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atendida BOOLEAN DEFAULT FALSE
                )
            `);
            console.log('Tablas de base de datos verificadas/creadas correctamente.');
        } catch (error) {
            console.error('Error inicializando la base de datos:', error);
        }
    }

    static async createMedicion(data) {
        const { temperatura, turbidez, tds, estado, origen, fecha } = data;
        const [result] = await db.query(
            'INSERT INTO mediciones (temperatura, turbidez, tds, estado, origen, fecha) VALUES (?, ?, ?, ?, ?, ?)',
            [temperatura, turbidez, tds, estado, origen, fecha]
        );
        return result.insertId;
    }

    static async createAlerta(data) {
        const { tipo, valor, nivel, fecha } = data;
        const [result] = await db.query(
            'INSERT INTO alertas (tipo, valor, nivel, fecha) VALUES (?, ?, ?, ?)',
            [tipo, valor, nivel, fecha]
        );
        return result.insertId;
    }

    static async getHistorial(limit = 100) {
        const [rows] = await db.query('SELECT * FROM mediciones ORDER BY fecha DESC LIMIT ?', [limit]);
        return rows;
    }

    static async getAlertas(limit = 50) {
        const [rows] = await db.query('SELECT * FROM alertas ORDER BY fecha DESC LIMIT ?', [limit]);
        return rows;
    }
}

module.exports = SensorModel;
