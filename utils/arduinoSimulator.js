/**
 * Simula datos de sensores de Arduino para pruebas.
 * Genera valores aleatorios realistas para pH, Temperatura, Turbidez y TDS.
 */

function startSimulation(io) {
    console.log('Iniciando simulación de sensores Arduino...');

    setInterval(() => {
        // Generar datos aleatorios con rangos realistas
        const data = {
            ph: parseFloat((6.5 + Math.random() * (8.5 - 6.5)).toFixed(2)), // pH entre 6.5 y 8.5
            temperature: parseFloat((20 + Math.random() * (30 - 20)).toFixed(1)), // Temp entre 20 y 30 °C
            turbidity: parseFloat((0 + Math.random() * 50).toFixed(2)), // Turbidez entre 0 y 50 NTU
            tds: parseFloat((100 + Math.random() * (500 - 100)).toFixed(0)), // TDS entre 100 y 500 ppm
            timestamp: new Date().toISOString()
        };

        // Emitir datos a todos los clientes conectados
        io.emit('sensor-data', data);

        // Opcional: Log para ver los datos en consola
        // console.log('Datos enviados:', data);
    }, 2000); // Enviar cada 2 segundos
}

module.exports = { startSimulation };
