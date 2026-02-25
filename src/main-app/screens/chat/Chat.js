import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';import { ScreenHeader, MenuInferior, Paginador, useNavbarHeight } from '../../components';
import { useStreamChat } from '../../contexts';
import { ChatController } from '../../controller';
import { usePaginacion } from '../../hooks/usePaginacion';
import { colors } from '../../../shared/styles';
import { styles } from './Chat.styles';
import { useAuth } from '../../contexts/AuthContext';
import { ensureChatUser } from '../../services/api/apiChat';
import { withCacheBuster } from '../../../shared/utils';




const Chat = () => {
    const route = useRoute();
    const targetUser = route?.params?.targetUser ?? null;
    const navigation = useNavigation();
    const navbarHeight = useNavbarHeight();
    const { chatClient, isReady, currentUser, createOrGetChannel, initializeChat } = useStreamChat();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mockUsersVisible, setMockUsersVisible] = useState(true);
    const { user, tokenStream, role } = useAuth();


    useEffect(() => {
        if (isReady) return;
    
        if (!user || !tokenStream) return;
    
        initializeChat(
            user.id,
            user.nombre || user.name,
            tokenStream,
            withCacheBuster(user.avatar || user.image) || undefined,
            role
        ).catch(err => console.error("Error initializing chat:", err));
    
    }, [isReady, user, tokenStream]);
    

    useEffect(() => {
        if (!isReady || !chatClient || !currentUser) return;

        let isMounted = true;

        const fetchChannels = async () => {
            try {
                const fetchedChannels = await ChatController.fetchUserChannels(
                    chatClient,
                    currentUser.id
                );

                if (isMounted) {
                    setChannels(fetchedChannels);
                    setLoading(false);
                    // Marcar todos los canales como leídos al ver la lista (actualiza el badge)
                    fetchedChannels.forEach((ch) => {
                      if (ch?.markRead) ch.markRead().catch(() => {});
                    });
                }
            } catch (error) {
                console.error("Error fetching channels:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchChannels();

        const handleEvent = (event) => {
             if (ChatController.isNewMessageEvent(event)) {
                 fetchChannels(); 
             }
        };

        chatClient.on(handleEvent);

        return () => {
            isMounted = false;
            chatClient.off(handleEvent);
        };
    }, [isReady, chatClient, currentUser]);

    const imageCacheTs = useMemo(() => Date.now(), [channels]);

    useEffect(() => {
        if (!targetUser) return;
        if (!isReady || !chatClient || !currentUser) return;
      
        let cancelled = false;
      
        const startChatWithTarget = async () => {
          try {
            setLoading(true);
      
            // 1. Asegurar que el otro usuario exista en Stream
            await ensureChatUser({ userId: targetUser.id, name: targetUser.name, image: targetUser.image ?? null });
      
            // 2. Crear u obtener canal 1–1
            const channel = await createOrGetChannel(
              targetUser.id,
              targetUser.name,
              targetUser.image
            );
      
            if (!cancelled && channel) {
              navigation.replace('Conversacion', { channelId: channel.id });
            }
          } catch (err) {
            console.error('Error iniciando chat con targetUser:', err);
          } finally {
            if (!cancelled) setLoading(false);
          }
        };
      
        startChatWithTarget();
      
        return () => {
          cancelled = true;
        };
      }, [targetUser, isReady, chatClient, currentUser]);
      

    const handleChannelPress = (channel) => {
        navigation.navigate('Conversacion', { channelId: channel.id });
    };

    const handleMockUserPress = async (user) => {
        if (!createOrGetChannel) return;
        
        try {
            setLoading(true);
            const channel = await createOrGetChannel(user.id, user.name, user.image, user.role);
            setLoading(false);
            if (channel) {
                navigation.navigate('Conversacion', { channelId: channel.id });
            }
        } catch (error) {
            console.error("Error creating mock channel", error);
            setLoading(false);
        }
    };

    const getUserRole = (user) => {
        return ChatController.getUserRole(user);
    };

    // Añadir paginación
    const {
        paginaActual,
        totalPaginas,
        itemsActuales: canalesActuales,
        manejarCambioPagina,
    } = usePaginacion(channels);

    const renderChannelItem = ({ item }) => {
        const otherUser = ChatController.getOtherUser(item, currentUser.id);
        const lastMessage = ChatController.getLastMessage(item);
        const userRole = getUserRole(otherUser);
        const dateString = ChatController.formatMessageDate(lastMessage?.created_at);
        const hasImageAttachment = (lastMessage?.attachments || []).some(
          (att) => att?.type === 'image' && (att?.image_url || att?.thumb_url)
        );
        const previewText = lastMessage
          ? (lastMessage.text || (hasImageAttachment ? 'Imagen adjunta' : ''))
          : 'Haz clic para iniciar la conversación';

        return (
            <TouchableOpacity style={styles.channelItem} onPress={() => handleChannelPress(item)}>
                <Image
                    source={{ uri: withCacheBuster(ChatController.getUserImage(otherUser), imageCacheTs) || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.channelInfo}>
                    <View style={styles.row}>
                        <Text style={styles.name}>
                            {ChatController.getUserName(otherUser, item)}
                        </Text>
                        {lastMessage && (
                            <Text style={styles.date}>{dateString}</Text>
                        )}
                    </View>
                    <View style={styles.bottomRow}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {previewText}
                        </Text>
                        {userRole && (
                            <View style={styles.roleChip}>
                                <Text style={styles.roleChipText}>{userRole}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMockUserItem = ({ item }) => (
        <TouchableOpacity style={styles.channelItem} onPress={() => handleMockUserPress(item)}>
             <Image
                source={{ uri: withCacheBuster(item.image, imageCacheTs) || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.channelInfo}>
                <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        Haz clic para iniciar la conversación
                    </Text>
                    {item.role && (
                        <View style={styles.roleChip}>
                            <Text style={styles.roleChipText}>{item.role}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
    if (!user || !tokenStream) {
        return (
            <SafeAreaView style={styles.container}>
                <ScreenHeader
                    title="Chat"
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptySubtext}>
                        Iniciá sesión para usar el chat.
                    </Text>
                </View>
                <MenuInferior />
            </SafeAreaView>
        );
    }
    
    if (!isReady) {
        return (
            <SafeAreaView style={styles.container}>
                <ScreenHeader title="Chat" showBackButton={true} onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
                <MenuInferior />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader title="Chat" subtitle="Historial de conversaciones" showBackButton={true} onBackPress={() => navigation.goBack()}/>
            
            {loading ? (
                 <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    {channels.length > 0 ? (
                    <FlatList
                        data={canalesActuales}
                        keyExtractor={(item) => item.id}
                        renderItem={renderChannelItem}
                        contentContainerStyle={Platform.OS === 'android' ? { paddingBottom: navbarHeight } : undefined}
                        ListFooterComponent={() => (
                        <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onCambioPagina={manejarCambioPagina}
                        />
                        )}
                    />
                    ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptySubtext}>
                        No tenés conversaciones.
                        {"\n"}Iniciá un chat desde Mis conexiones.
                        </Text>
                    </View>
                    )}

                </>
            )}
            <MenuInferior />
        </SafeAreaView>
    );
};

export default Chat;
