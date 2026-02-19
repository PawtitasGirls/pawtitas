//ensureChatUser({ userId, name, image })  
import { apiUsuario } from './apiUsuario';

export async function ensureChatUser({ userId, name, image }) {
  return apiUsuario('/api/chat/ensure-user', {
    method: 'POST',
    body: JSON.stringify({ userId, name, image }),
  });
}

export async function uploadChatImage(file) {
  const formData = new FormData();
  const fileName = file?.fileName || file?.name || `chat-${Date.now()}.jpg`;
  const mimeType = file?.mimeType || file?.type || 'image/jpeg';

  formData.append('image', {
    uri: file.uri,
    name: fileName,
    type: mimeType,
  });

  return apiUsuario('/api/chat/upload-image', {
    method: 'POST',
    body: formData,
  });
}