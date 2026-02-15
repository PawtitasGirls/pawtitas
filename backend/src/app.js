const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const contactoRoutes = require('./routes/contacto.routes');
const overpassRoutes = require('./routes/overpass.routes');
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

app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(contactoRoutes);
app.use(overpassRoutes);
app.use(healthRoutes);
app.use(testRoutes);
app.use(mascotaRoutes);
app.use(reservaRoutes);
app.use(mercadopagoRoutes);
app.use(resenaRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;




