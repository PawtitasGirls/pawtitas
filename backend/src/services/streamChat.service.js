const { StreamChat } = require('stream-chat');

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;

const serverClient =
  apiKey && apiSecret
    ? StreamChat.getInstance(apiKey, apiSecret)
    : null;

async function createUserToken(userId) {
  if (!serverClient) {
    console.warn('Stream Chat: STREAM_API_KEY o STREAM_SECRET no configurados');
    return null;
  }
  return serverClient.createToken(String(userId));
}
async function ensureUser(userId, name, image = null) {
    if (!serverClient) {
      console.warn('Stream Chat: servidor no configurado');
      return;
    }
    await serverClient.upsertUser({
      id: String(userId),
      name: name || 'Usuario',
      image: image || undefined,
    });
  }
  module.exports = {
    createUserToken,
    ensureUser,
  };

