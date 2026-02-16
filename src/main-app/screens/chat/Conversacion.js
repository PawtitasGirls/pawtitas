import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStreamChat } from '../../contexts';
import { ChatController } from '../../controller';
import { colors } from '../../../shared/styles';
import { styles } from './Conversacion.styles';

const Conversacion = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { channel } = route.params || {};
    const { chatClient, currentUser } = useStreamChat();
    const channelId = channel?.id || route.params?.channelId;
    
    const [activeChannel, setActiveChannel] = useState(channel || null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(!channel);
    const [otherUser, setOtherUser] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        const initChannel = async () => {
            if (!channelId) return;

            let chan = activeChannel;
            
            // Si no tenemos la instancia del canal, la obtenemos/creamos
            if (!chan) {
                chan = await ChatController.getOrWatchChannel(chatClient, channelId);
                setActiveChannel(chan);
            } else {
                // Aseguramos que esté siendo observado para recibir eventos
                 if (!chan.initialized) {
                    await chan.watch();
                }
            }

            // Cargar mensajes existentes del estado local del canal
            setMessages(ChatController.getChannelMessages(chan));

            // Marcar canal como leído para que el badge se actualice
            if (chan?.markRead) {
              chan.markRead().catch(() => {});
            }
            
            // Obtener el otro usuario del canal (para chats 1 a 1)
            const otherUser = ChatController.getOtherUser(chan, currentUser.id);
            if (otherUser) {
                setOtherUser(otherUser);
            }
            
            setLoading(false);

            // Escuchar nuevos mensajes en tiempo real
            const handleNewMessage = (event) => {
                setMessages((prevMessages) => 
                    ChatController.addMessageIfNew(prevMessages, event.message)
                );
            };

            chan.on('message.new', handleNewMessage);

            return () => {
                chan.off('message.new', handleNewMessage);
            };
        };

        initChannel();
    }, [channelId, chatClient]);

    const sendMessage = async () => {
        if (!ChatController.canSendMessage(inputText) || !activeChannel) return;
        
        try {
            const text = inputText;
            setInputText('');
            const payload = ChatController.prepareMessagePayload(text);
            await activeChannel.sendMessage(payload);
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            Alert.alert('Error al enviar mensaje:', error.message);
            setInputText(inputText); 
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = ChatController.isMyMessage(item, currentUser?.id);
        const timestamp = ChatController.formatMessageTime(item.created_at);
        
        return (
            <View style={[
                styles.messageBubble, 
                isMyMessage ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
                <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.theirTimestamp]}>
                    {timestamp}
                </Text>
            </View>
        );
    };

    // Obtener el rol del usuario
    const getUserRoleInfo = () => {
        const roleLabel = ChatController.getUserRole(otherUser);
        return { label: roleLabel };
    };

    const renderCustomHeader = () => {
        const roleInfo = getUserRoleInfo();
        const userName = ChatController.getUserName(otherUser, activeChannel);
        const userImage = ChatController.getUserImage(otherUser, 'https://via.placeholder.com/40');
        
        return (
            <View style={styles.customHeader}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                
                <Image 
                    source={{ uri: userImage }} 
                    style={styles.headerAvatar} 
                />
                
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{userName}</Text>
                    {roleInfo.label && (
                        <View style={styles.roleChipContainer}>
                            <Text style={styles.roleChipText}>{roleInfo.label}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {renderCustomHeader()}

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Text style={styles.emptyChatText}>Escribe el primer mensaje para iniciar la conversación.</Text>
                        </View>
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Escribe un mensaje"
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={sendMessage} 
                        style={[
                            styles.sendButton, 
                            !ChatController.canSendMessage(inputText) && styles.sendButtonDisabled
                        ]} 
                        disabled={!ChatController.canSendMessage(inputText)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Conversacion;
