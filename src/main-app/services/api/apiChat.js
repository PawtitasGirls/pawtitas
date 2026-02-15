//ensureChatUser({ userId, name, image })  
import { apiUsuario } from './apiUsuario';

export async function ensureChatUser({ userId, name, image }) {
  return apiUsuario('/api/chat/ensure-user', {
    method: 'POST',
    body: JSON.stringify({ userId, name, image }),
  });
}