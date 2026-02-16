import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';

const StreamChatContext = createContext();

export const StreamChatProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

  const initializeChat = async (userId, userName, userToken, userImage = null, userRole = null) => {
    try {
      if (!apiKey) {
        console.warn('Stream API Key no encontrada...');
        return;
      }

      if (!userId) {
          userId = `guest-${Math.random().toString(36).substr(2, 9)}`;
          userName = userName || "Invitado";
      }

      // Obtener instancia (Singleton)
      const client = StreamChat.getInstance(apiKey);

      // Si ya estamos conectados con EL MISMO usuario, retornamos
      if (client.userID === userId && isReady) {
        return client;
      }

      // Si hay una conexión activa con OTRO usuario, desconectar primero
      if (client.userID) {
        await client.disconnectUser();
      }
      
      // Si tenemos una instancia en el estado local diferente a la singleton, desconectarla también
      if (chatClient && chatClient !== client) {
          await chatClient.disconnectUser();
      }

      // Preparar los datos del usuario
      const userData = {
        id: userId,
        name: userName,
        image: userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`,
      };
      
      // Agregar rol si existe
      if (userRole) {
        userData.role = userRole;
      }

  if (!userToken) {
    console.warn('Token de Stream no disponible. No se conecta el usuario.');
    setIsReady(false);
    return;
  }

  await client.connectUser(userData, userToken);

      const unread = client.user?.total_unread_count;
      setTotalUnreadCount(typeof unread === 'number' ? unread : 0);
      setChatClient(client);
      setCurrentUser({ id: userId, name: userName, image: userImage, role: userRole });
      setIsReady(true);

      console.log('✅ Stream Chat inicializado correctamente para', userName);
      return client;
    } catch (error) {
      console.error('❌ Error al inicializar Stream Chat:', error);
      setIsReady(false);
    }
  };

  // Sincronizar totalUnreadCount con eventos del cliente
  useEffect(() => {
    if (!chatClient || !chatClient.userID) {
      setTotalUnreadCount(0);
      return;
    }
    const syncUnread = () => {
      const n = chatClient.user?.total_unread_count;
      setTotalUnreadCount(typeof n === 'number' ? n : 0);
    };
    syncUnread();
    const handleEvent = (event) => {
      if (event.total_unread_count !== undefined) {
        setTotalUnreadCount(event.total_unread_count);
      } else {
        syncUnread();
      }
    };
    chatClient.on(handleEvent);
    return () => {
      chatClient.off(handleEvent);
    };
  }, [chatClient]);

  // Desconectar usuario
  const disconnectChat = async () => {
    if (chatClient) {
      try {
        await chatClient.disconnectUser();
        setChatClient(null);
        setCurrentUser(null);
        setTotalUnreadCount(0);
        setIsReady(false);
      } catch (error) {
        console.error('❌ Error al desconectar:', error);
      }
    }
  };

  // Crear o recuperar un canal directo entre dos usuarios
  const createOrGetChannel = async (otherUserId, otherUserName, otherUserImage = null, otherUserRole = null) => {
    if (!chatClient || !isReady) {
      console.warn('Chat client no está inicializado. Llama a initializeChat primero.');
      return null;
    }

    try {          
           
      const channel = chatClient.channel('messaging', {
        members: [currentUser.id, otherUserId],
      });

      await channel.watch();
      return channel;
    } catch (error) {
      console.error('❌ Error al crear/obtener canal:', error);
      throw error;
    }
  };

  const value = {
    client: chatClient,
    chatClient,
    isReady,
    currentUser,
    totalUnreadCount,
    initializeChat,
    disconnectChat,
    createOrGetChannel,
  };

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat debe usarse dentro de StreamChatProvider');
  }
  return context;
};

