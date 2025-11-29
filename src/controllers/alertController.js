const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.obtenerAlertas = async (req, res) => {
    try {
        const alertas = await prisma.alerta.findMany({
            take: 50,
            orderBy: {
                fecha: 'desc'
            }
        });
        res.json(alertas);
    } catch (error) {
        console.error('Error en obtenerAlertas:', error);
        res.status(500).json({ error: 'Error obteniendo alertas' });
    }
};

exports.marcarAtendida = async (req, res) => {
    try {
        const { id } = req.params;
        const alertaActualizada = await prisma.alerta.update({
            where: { id: parseInt(id) },
            data: { atendida: true }
        });
        res.json(alertaActualizada);
    } catch (error) {
        console.error('Error en marcarAtendida:', error);
        res.status(500).json({ error: 'Error actualizando alerta' });
    }
};
