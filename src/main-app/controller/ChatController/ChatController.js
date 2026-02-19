// Configuración del chat
export const CHAT_CONFIG = {
  AUTO_LOGIN_USER_ID: 'usuario-prueba-id',
  AUTO_LOGIN_USER_NAME: 'Usuario Prueba',
  AUTO_LOGIN_USER_IMAGE: 'https://i.pravatar.cc/150?img=68',
  CHANNELS_LIMIT: 30,
  MESSAGE_PLACEHOLDER: 'Escribe un mensaje',
  NEW_MESSAGE_EVENTS: ['message.new', 'notification.message_new'],
};

// Usuarios para testing
export const MOCK_CHAT_USERS = [
  {
    id: 'test-user-1',
    name: 'Juan Perez',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'Cuidador'
  },
  {
    id: 'test-user-2',
    name: 'Maria Garcia',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'Paseador'
  },
  {
    id: 'test-user-3',
    name: 'Carlos Lopez',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    role: 'Veterinario'
  }
];

export class ChatController {  

  static getUserRole(user) {
    if (!user) return '';
    
    const userRole = user.role || user.tipo_usuario;
    
    const roleMap = {
      'Cuidador': ['Cuidador', 'cuidador'],
      'Paseador': ['Paseador', 'paseador'],
      'Veterinario': ['Veterinario', 'veterinario'],
      'Cliente': ['pet_owner', 'cliente', 'Cliente'],
      'Administrador': ['admin', 'administrador', 'Administrador']
    };
    
    for (const [normalizedRole, variants] of Object.entries(roleMap)) {
      if (variants.includes(userRole)) {
        return normalizedRole;
      }
    }
    
    return '';
  }

  // Obtener información del otro usuario en un canal 1-a-1
  static getOtherUser(channel, currentUserId) {
    if (!channel?.state?.members) return null;
    
    const otherMember = Object.values(channel.state.members).find(
      m => m.user.id !== currentUserId
    );
    
    return otherMember ? otherMember.user : null;
  }

  // Obtener el nombre de usuario con fallback
  static getUserName(user, channel) {
    return user?.name || channel?.data?.name || 'Chat';
  }

  // Obtener la imagen de usuario con fallback
  static getUserImage(user, fallback = 'https://via.placeholder.com/50') {
    return user?.image || fallback;
  }

  // Construir los filtros para consulta de canales
  static buildChannelFilters(currentUserId) {
    return {
      members: { $in: [currentUserId] },
      type: 'messaging'
    };
  }

  // Construir el sort para canales (más reciente primero)
  static buildChannelSort() {
    return { last_message_at: -1 };
  }

  // Obtener las opciones de consulta de canales
  static getChannelQueryOptions() {
    return {
      watch: true,
      state: true,
      limit: CHAT_CONFIG.CHANNELS_LIMIT
    };
  }

  // Consultar los canales del usuario actual
  static async fetchUserChannels(chatClient, currentUserId) {
    if (!chatClient || !currentUserId) {
      throw new Error('Chat client o user ID no disponibles');
    }

    const filters = this.buildChannelFilters(currentUserId);
    const sort = this.buildChannelSort();
    const options = this.getChannelQueryOptions();
    
    return await chatClient.queryChannels(filters, sort, options);
  }

  // Verificar si un evento es de nuevo mensaje
  static isNewMessageEvent(event) {
    return CHAT_CONFIG.NEW_MESSAGE_EVENTS.includes(event.type);
  }

  // Obtener el último mensaje de un canal
  static getLastMessage(channel) {
    const messages = channel?.state?.messages || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  // Verificar si un mensaje ya existe en la lista
  static messageExists(messages, messageId) {
    return messages.some(m => m.id === messageId);
  }

  // Agregar un mensaje nuevo sin duplicados
  static addMessageIfNew(messages, newMessage) {
    if (this.messageExists(messages, newMessage.id)) {
      return messages;
    }
    return [...messages, newMessage];
  }

  // Validar si un mensaje puede ser enviado
  static canSendMessage(messageText, imageAsset = null) {
    const hasText = !!(messageText && messageText.trim().length > 0);
    const hasImage = !!imageAsset?.uri;
    return hasText || hasImage;
  }

  // Preparar el payload de un mensaje para enviar
  static prepareMessagePayload(text, imageUrl = null) {
    const payload = { text: (text || '').trim() };
    if (imageUrl) {
      payload.attachments = [
        {
          type: 'image',
          image_url: imageUrl,
        },
      ];
    }
    return payload;
  }

  // Formatar la fecha de un mensaje (hoy: hora, otro día: fecha)
  static formatMessageDate(date) {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return messageDate.toLocaleDateString();
  }

  // Formatar solo la hora del mensaje
  static formatMessageTime(date) {
    if (!date) return '';
    
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener los datos de auto-login (desarrollo)
  static getAutoLoginData() {
    return {
      userId: CHAT_CONFIG.AUTO_LOGIN_USER_ID,
      userName: CHAT_CONFIG.AUTO_LOGIN_USER_NAME,
      userToken: null,
      userImage: CHAT_CONFIG.AUTO_LOGIN_USER_IMAGE,
      userRole: 'Cliente'  // Rol por defecto para desarrollo
    };
  }

  // Obtener los usuarios para testing
  static getMockUsers() {
    return MOCK_CHAT_USERS;
  }

  // Inicializar o recuperar un canal específico
  static async getOrWatchChannel(chatClient, channelId) {
    if (!chatClient || !channelId) {
      throw new Error('Chat client o channel ID no disponibles');
    }

    const channel = chatClient.channel('messaging', channelId);
    
    if (!channel.initialized) {
      await channel.watch();
    }
    
    return channel;
  }

  // Obtener los mensajes de un canal
  static getChannelMessages(channel) {
    return channel?.state?.messages || [];
  }

  // Verificar si el mensaje es del usuario actual
  static isMyMessage(message, currentUserId) {
    return message?.user?.id === currentUserId;
  }
}

