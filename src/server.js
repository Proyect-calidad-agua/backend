const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const socketUtil = require('./utils/socket');

// Rutas
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Inicializar Socket.io
const io = socketUtil.init(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/sensores', sensorRoutes);
app.use('/api/alertas', alertRoutes);

app.get('/', (req, res) => {
    res.send('API de Monitoreo de Calidad del Agua (v2 - MVC + Prisma)');
});

// Eventos de conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Cliente dashboard conectado:', socket.id);
    socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
