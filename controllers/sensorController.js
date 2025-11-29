const Sensor = require('../models/Sensor');

const determineStatus = (temp, turb, tds) => {
    if (temp > 28 || turb > 5 || tds > 500) return 'critico';
    if (temp > 25 || turb > 3 || tds > 300) return 'alerta';
    return 'normal';
};

const checkAndSaveAlerts = async (temp, turb, tds) => {
    const alerts = [];

    if (temp > 28) alerts.push({ tipo: 'temperatura', valor: temp, nivel: 'critico' });
    else if (temp > 25) alerts.push({ tipo: 'temperatura', valor: temp, nivel: 'advertencia' });

    if (turb > 5) alerts.push({ tipo: 'turbidez', valor: turb, nivel: 'critico' });
    else if (turb > 3) alerts.push({ tipo: 'turbidez', valor: turb, nivel: 'advertencia' });

    if (tds > 500) alerts.push({ tipo: 'tds', valor: tds, nivel: 'critico' });
    else if (tds > 300) alerts.push({ tipo: 'tds', valor: tds, nivel: 'advertencia' });

    for (const alert of alerts) {
        try {
            await Sensor.createAlert(alert);
            console.log(`Alerta guardada: ${alert.tipo} - ${alert.nivel}`);
        } catch (err) {
            console.error('Error guardando alerta:', err);
        }
    }
};

exports.registerMeasurement = async (req, res) => {
    try {
        const { temperatura, turbidez, tds, origen = 'esp32_1' } = req.body;

        if (temperatura === undefined || turbidez === undefined || tds === undefined) {
            return res.status(400).json({ error: 'Faltan datos de sensores' });
        }

        const estado = determineStatus(temperatura, turbidez, tds);

        // 1. Guardar en BD
        const insertId = await Sensor.createMeasurement({ temperatura, turbidez, tds, estado, origen });

        // 2. Verificar alertas
        await checkAndSaveAlerts(temperatura, turbidez, tds);

        // 3. Emitir WebSocket
        const io = req.app.get('io');
        if (io) {
            const sensorData = {
                id: insertId,
                temperature: parseFloat(temperatura),
                turbidez: parseFloat(turbidez),
                tds: parseFloat(tds),
                timestamp: new Date().toISOString(),
                status: estado
            };
            io.emit('sensor-data', sensorData);
        }

        res.status(201).json({ message: 'Datos registrados correctamente', id: insertId });

    } catch (error) {
        console.error('Error en registerMeasurement:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const measurements = await Sensor.getRecentMeasurements();
        res.json(measurements);
    } catch (error) {
        console.error('Error en getHistory:', error);
        res.status(500).json({ error: 'Error obteniendo historial' });
    }
};
