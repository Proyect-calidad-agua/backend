const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// POST /api/sensores/registrar
router.post('/registrar', sensorController.registerMeasurement);

// GET /api/sensores/historial (o /api/mediciones/historial según prefieras, ajustaré en server.js)
router.get('/historial', sensorController.getHistory);

module.exports = router;
