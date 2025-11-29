const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const sensorRoutes = require('./routes/sensorRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Compartir instancia de IO con toda la app (para usar en controladores)
app.set('io', io);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rutas
app.use('/api/sensores', sensorRoutes);
app.use('/api/mediciones', sensorRoutes); // Alias para compatibilidad si es necesario

app.get('/', (req, res) => {
  res.send('API de Monitoreo de Calidad del Agua (MVC + MySQL + Socket.io)');
});

// WebSockets
io.on('connection', (socket) => {
  console.log('Cliente dashboard conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Iniciar simulación para que el usuario vea datos inmediatamente
const { startSimulation } = require('./utils/arduinoSimulator');
startSimulation(io);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
