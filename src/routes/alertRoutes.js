const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.obtenerAlertas);
router.put('/:id/atender', alertController.marcarAtendida);

module.exports = router;
