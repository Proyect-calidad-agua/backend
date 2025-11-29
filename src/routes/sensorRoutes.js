const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

router.post('/registrar', sensorController.registrarMedicion);
router.get('/historial', sensorController.obtenerHistorial);

module.exports = router;
