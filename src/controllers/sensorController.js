const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const socket = require('../utils/socket');

// Umbrales (podrían moverse a una tabla de configuración en el futuro)
const THRESHOLDS = {
    temperature: { warning: 25, critical: 28 },
    turbidity: { warning: 3, critical: 5 },
    tds: { warning: 300, critical: 500 }
};

const determineStatus = (temp, turb, tds) => {
    if (temp > THRESHOLDS.temperature.critical ||
        turb > THRESHOLDS.turbidity.critical ||
        tds > THRESHOLDS.tds.critical) return 'critico';

    if (temp > THRESHOLDS.temperature.warning ||
        turb > THRESHOLDS.turbidity.warning ||
        tds > THRESHOLDS.tds.warning) return 'alerta';

    return 'normal';
};

const checkAndCreateAlerts = async (temp, turb, tds) => {
    const alertsToCreate = [];

    // Temperatura
    if (temp > THRESHOLDS.temperature.critical) {
        alertsToCreate.push({ tipo: 'temperatura', valor: temp, nivel: 'critico' });
    } else if (temp > THRESHOLDS.temperature.warning) {
        alertsToCreate.push({ tipo: 'temperatura', valor: temp, nivel: 'advertencia' });
    }

    // Turbidez
    if (turb > THRESHOLDS.turbidity.critical) {
        alertsToCreate.push({ tipo: 'turbidez', valor: turb, nivel: 'critico' });
    } else if (turb > THRESHOLDS.turbidity.warning) {
        alertsToCreate.push({ tipo: 'turbidez', valor: turb, nivel: 'advertencia' });
    }

    // TDS
    if (tds > THRESHOLDS.tds.critical) {
        alertsToCreate.push({ tipo: 'tds', valor: tds, nivel: 'critico' });
    } else if (tds > THRESHOLDS.tds.warning) {
        alertsToCreate.push({ tipo: 'tds', valor: tds, nivel: 'advertencia' });
    }

    // Guardar alertas en transacción
    if (alertsToCreate.length > 0) {
        await prisma.alerta.createMany({
            data: alertsToCreate
        });
    }
};

exports.registrarMedicion = async (req, res) => {
    try {
        const { temperatura, turbidez, tds, origen = 'esp32_1' } = req.body;

        if (temperatura === undefined || turbidez === undefined || tds === undefined) {
            return res.status(400).json({ error: 'Faltan datos requeridos (temperatura, turbidez, tds)' });
        }

        const estado = determineStatus(temperatura, turbidez, tds);

        // Guardar medición
        const nuevaMedicion = await prisma.medicion.create({
            data: {
                temperatura: parseFloat(temperatura),
                turbidez: parseFloat(turbidez),
                tds: parseFloat(tds),
                estado,
                origen
            }
        });

        // Verificar y crear alertas
        await checkAndCreateAlerts(parseFloat(temperatura), parseFloat(turbidez), parseFloat(tds));

        // Emitir evento WebSocket
        const io = socket.getIO();
        io.emit('sensor-data', {
            ...nuevaMedicion,
            timestamp: nuevaMedicion.fecha.toISOString()
        });

        res.status(201).json({
            message: 'Medición registrada exitosamente',
            data: nuevaMedicion
        });

    } catch (error) {
        console.error('Error en registrarMedicion:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const historial = await prisma.medicion.findMany({
            take: 100,
            orderBy: {
                fecha: 'desc'
            }
        });
        res.json(historial);
    } catch (error) {
        console.error('Error en obtenerHistorial:', error);
        res.status(500).json({ error: 'Error obteniendo historial' });
    }
};
