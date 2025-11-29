/**
 * Simula datos de sensores de Arduino para pruebas.
 * Envía peticiones HTTP POST al servidor local, simulando un ESP32 real.
 */
const http = require('http');

function startSimulation(io) {
    console.log('Iniciando simulación de sensores Arduino (Modo HTTP)...');

    setInterval(() => {
        // Generar datos aleatorios con rangos realistas
        // A veces generamos valores de alerta para probar el sistema
        const isAlert = Math.random() > 0.8;

        const data = JSON.stringify({
            temperatura: parseFloat((isAlert ? 29 + Math.random() * 5 : 20 + Math.random() * 8).toFixed(1)),
            turbidez: parseFloat((isAlert ? 6 + Math.random() * 10 : 0 + Math.random() * 4).toFixed(2)),
            tds: parseFloat((isAlert ? 550 + Math.random() * 200 : 100 + Math.random() * 300).toFixed(0)),
            origen: 'simulador_1'
        });

        const options = {
            hostname: 'localhost',
            port: process.env.PORT || 5000,
            path: '/api/sensores/registrar',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            // Silenciar salida para no ensuciar consola, o descomentar para debug
            // console.log(`Simulación: Estado ${res.statusCode}`);
        });

        req.on('error', (error) => {
            console.error('Error en simulación (¿Servidor apagado?):', error.message);
        });

        req.write(data);
        req.end();

    }, 3000); // Enviar cada 3 segundos
}

module.exports = { startSimulation };
