const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);
const merchantOrder = new MerchantOrder(client);

module.exports = { client, preference, payment, merchantOrder };
