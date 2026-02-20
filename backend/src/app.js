const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const contactoRoutes = require('./routes/contacto.routes');
const overpassRoutes = require('./routes/overpass.routes');
const nominatimRoutes = require('./routes/nominatim.routes');
const healthRoutes = require('./routes/health.routes');
const testRoutes = require('./routes/test.routes');
const mascotaRoutes = require('./routes/mascota.routes');
const reservaRoutes = require('./routes/reserva.routes');
const mercadopagoRoutes = require('./routes/mercadopago.routes');
const resenaRoutes = require('./routes/resena.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(cors());
app.use(express.json());
// Rutas legacy: archivos guardados en Prestador.documentos/certificaciones (paths /uploads/...)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(attachmentRoutes);
app.use(contactoRoutes);
app.use(overpassRoutes);
app.use(nominatimRoutes);
app.use(healthRoutes);
app.use(testRoutes);
app.use(mascotaRoutes);
app.use(reservaRoutes);
app.use(mercadopagoRoutes);
app.use(resenaRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;

