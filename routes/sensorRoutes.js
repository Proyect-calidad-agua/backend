const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Ruta para registrar datos del sensor (ESP32)
router.post('/sensores/registrar', sensorController.registrarDatos);

// Ruta para obtener historial de mediciones
router.get('/mediciones/historial', sensorController.obtenerHistorial);

// Ruta para obtener historial de alertas
router.get('/alertas/historial', sensorController.obtenerAlertas);

module.exports = router;
