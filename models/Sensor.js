const db = require('../database/db');

class Sensor {
    static async createMeasurement({ temperatura, turbidez, tds, estado, origen }) {
        const query = `
            INSERT INTO mediciones (temperatura, turbidez, tds, estado, origen, fecha) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(query, [temperatura, turbidez, tds, estado, origen]);
        return result.insertId;
    }

    static async createAlert({ tipo, valor, nivel }) {
        const query = `
            INSERT INTO alertas (tipo, valor, nivel, fecha) 
            VALUES (?, ?, ?, NOW())
        `;
        const [result] = await db.execute(query, [tipo, valor, nivel]);
        return result.insertId;
    }

    static async getRecentMeasurements(limit = 100) {
        const query = 'SELECT * FROM mediciones ORDER BY fecha DESC LIMIT ?';
        const [rows] = await db.execute(query, [limit.toString()]); // Limit must be string or number, execute handles it
        return rows;
    }

    static async getRecentAlerts(limit = 50) {
        const query = 'SELECT * FROM alertas ORDER BY fecha DESC LIMIT ?';
        const [rows] = await db.execute(query, [limit.toString()]);
        return rows;
    }
}

module.exports = Sensor;
