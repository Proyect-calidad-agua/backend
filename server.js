const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const sensorRoutes = require('./routes/sensorRoutes');
const SensorModel = require('./models/sensorModel');

dotenv.config();

// Inicializar base de datos
SensorModel.init();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Hacer disponible 'io' en las rutas/controladores
app.set('io', io);

app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api', sensorRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Monitoreo de Calidad del Agua (MySQL + Socket.io)');
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('Cliente dashboard conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
