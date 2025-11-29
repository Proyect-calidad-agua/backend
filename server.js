const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db'); // Conexión a MySQL
// const { startSimulation } = require('./utils/arduinoSimulator'); // Simulación desactivada para usar datos reales

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- Lógica de Negocio y Alertas ---
const determineStatus = (temp, turb, tds) => {
  if (temp > 28 || turb > 5 || tds > 500) return 'critico'; // Simplificado para ejemplo
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
      await db.query(
        'INSERT INTO alertas (tipo, valor, nivel, fecha) VALUES (?, ?, ?, ?)',
        [alert.tipo, alert.valor, alert.nivel, timestamp]
      );
      console.log(`Alerta guardada: ${alert.tipo} - ${alert.nivel}`);
    } catch (err) {
      console.error('Error guardando alerta:', err);
    }
  }
};

// --- Endpoints ---

app.get('/', (req, res) => {
  res.send('API de Monitoreo de Calidad del Agua (MySQL + Socket.io)');
});

// Endpoint para recibir datos del ESP32
app.post('/api/sensores/registrar', async (req, res) => {
  try {
    const { temperatura, turbidez, tds, origen = 'esp32_1' } = req.body;

    if (temperatura === undefined || turbidez === undefined || tds === undefined) {
      return res.status(400).json({ error: 'Faltan datos de sensores' });
    }

    const estado = determineStatus(temperatura, turbidez, tds);
    const fecha = new Date();

    // 1. Guardar en Base de Datos
    const [result] = await db.query(
      'INSERT INTO mediciones (temperatura, turbidez, tds, estado, origen, fecha) VALUES (?, ?, ?, ?, ?, ?)',
      [temperatura, turbidez, tds, estado, origen, fecha]
    );

    // 2. Verificar y guardar alertas
    await checkAndSaveAlerts(temperatura, turbidez, tds);

    // 3. Emitir datos en tiempo real a los clientes conectados
    const sensorData = {
      id: result.insertId,
      temperature: parseFloat(temperatura),
      turbidez: parseFloat(turbidez),
      tds: parseFloat(tds),
      timestamp: fecha.toISOString(),
      status: estado
    };

    io.emit('sensor-data', sensorData);

    res.status(201).json({ message: 'Datos registrados correctamente', id: result.insertId });

  } catch (error) {
    console.error('Error procesando datos del sensor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener historial (opcional, para la pestaña Histórico)
app.get('/api/mediciones/historial', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mediciones ORDER BY fecha DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// --- WebSockets ---
io.on('connection', (socket) => {
  console.log('Cliente dashboard conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// startSimulation(io); // Descomentar si no tienes el ESP32 conectado aún

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
