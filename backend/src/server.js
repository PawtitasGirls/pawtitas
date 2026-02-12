require('dotenv').config();

BigInt.prototype.toJSON = function () { return this.toString(); };

const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 3301;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
