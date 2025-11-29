const SensorModel = require('../models/sensorModel');

const determineStatus = (temp, turb, tds) => {
    if (temp > 28 || turb > 5 || tds > 500) return 'critico';
    if (temp > 25 || turb > 3 || tds > 300) return 'alerta';
    return 'normal';
};

const checkAndSaveAlerts = async (temp, turb, tds) => {
    const alerts = [];
    const timestamp = new Date();

    if (temp > 28) alerts.push({ tipo: 'temperatura', valor: temp, nivel: 'critico' });
    else if (temp > 25) alerts.push({ tipo: 'temperatura', valor: temp, nivel: 'advertencia' });

    if (turb > 5) alerts.push({ tipo: 'turbidez', valor: turb, nivel: 'critico' });
    else if (turb > 3) alerts.push({ tipo: 'turbidez', valor: turb, nivel: 'advertencia' });

    if (tds > 500) alerts.push({ tipo: 'tds', valor: tds, nivel: 'critico' });
    else if (tds > 300) alerts.push({ tipo: 'tds', valor: tds, nivel: 'advertencia' });

    for (const alert of alerts) {
        try {
            await SensorModel.createAlerta({ ...alert, fecha: timestamp });
            console.log(`Alerta guardada: ${alert.tipo} - ${alert.nivel}`);
        } catch (err) {
            console.error('Error guardando alerta:', err);
        }
    }
};

exports.registrarDatos = async (req, res) => {
    try {
        const { temperatura, turbidez, tds, origen = 'esp32_1' } = req.body;

        if (temperatura === undefined || turbidez === undefined || tds === undefined) {
            return res.status(400).json({ error: 'Faltan datos de sensores' });
        }

        const estado = determineStatus(temperatura, turbidez, tds);
        const fecha = new Date();

        // 1. Guardar en Base de Datos
        const insertId = await SensorModel.createMedicion({
            temperatura,
            turbidez,
            tds,
            estado,
            origen,
            fecha
        });

        // 2. Verificar y guardar alertas
        await checkAndSaveAlerts(temperatura, turbidez, tds);

        // 3. Emitir datos en tiempo real a los clientes conectados
        const io = req.app.get('io');
        const sensorData = {
            id: insertId,
            temperature: parseFloat(temperatura),
            turbidez: parseFloat(turbidez),
            tds: parseFloat(tds),
            timestamp: fecha.toISOString(),
            status: estado
        };

        if (io) {
            io.emit('sensor-data', sensorData);
        }

        res.status(201).json({ message: 'Datos registrados correctamente', id: insertId });

    } catch (error) {
        console.error('Error procesando datos del sensor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const historial = await SensorModel.getHistorial();
        res.json(historial);
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error obteniendo historial' });
    }
};

exports.obtenerAlertas = async (req, res) => {
    try {
        const alertas = await SensorModel.getAlertas();
        res.json(alertas);
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        res.status(500).json({ error: 'Error obteniendo alertas' });
    }
};
