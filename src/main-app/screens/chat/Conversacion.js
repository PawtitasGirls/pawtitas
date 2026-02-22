import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStreamChat } from '../../contexts';
import { ChatController } from '../../controller';
import { colors } from '../../../shared/styles';
import { styles, getInputContainerStyle } from './Conversacion.styles';
import * as ImagePicker from 'expo-image-picker';
import { uploadChatImage } from '../../services/api/apiChat';
import { withCacheBuster } from '../../../shared/utils';

const Conversacion = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { channel } = route.params || {};
    const { chatClient, currentUser } = useStreamChat();
    const channelId = channel?.id || route.params?.channelId;
    
    const [activeChannel, setActiveChannel] = useState(channel || null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(!channel);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

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

    const imageCacheTs = useMemo(() => Date.now(), [activeChannel?.id]);

    const sendMessage = async () => {
        if (!ChatController.canSendMessage(inputText, selectedImage) || !activeChannel || sending) return;
        
        try {
            setSending(true);
            const text = inputText;
            let uploadedImageUrl = null;

            if (selectedImage?.uri) {
                const uploadResponse = await uploadChatImage(selectedImage);
                uploadedImageUrl = uploadResponse?.url || null;
            }

            setInputText('');
            setSelectedImage(null);
            const payload = ChatController.prepareMessagePayload(text, uploadedImageUrl);
            await activeChannel.sendMessage(payload);
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            Alert.alert('Error al enviar mensaje:', error.message);
        } finally {
            setSending(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para adjuntar imágenes.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets?.length) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen.');
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
                {!!item.text && (
                    <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
                        {item.text}
                    </Text>
                )}
                {(item.attachments || [])
                  .filter((att) => att?.type === 'image' && (att.image_url || att.thumb_url))
                  .map((att, idx) => (
                    <Image
                        key={`${item.id}-img-${idx}`}
                        source={{ uri: att.image_url || att.thumb_url }}
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                  ))
                }
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
        const userImage = withCacheBuster(
            ChatController.getUserImage(otherUser, 'https://via.placeholder.com/40'),
            imageCacheTs
        ) || 'https://via.placeholder.com/40';
        
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

                <View style={[styles.inputContainer, getInputContainerStyle(insets.bottom, isKeyboardVisible)]}>
                    <TouchableOpacity
                        onPress={handlePickImage}
                        style={styles.attachButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.attachButtonText}>📎</Text>
                    </TouchableOpacity>
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
                            !ChatController.canSendMessage(inputText, selectedImage) && styles.sendButtonDisabled
                        ]} 
                        disabled={!ChatController.canSendMessage(inputText, selectedImage) || sending}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.sendButtonText}>{sending ? 'Enviando...' : 'Enviar'}</Text>
                    </TouchableOpacity>
                </View>
                {selectedImage?.uri && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                        <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removePreviewBtn}>
                            <Text style={styles.removePreviewText}>Quitar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Conversacion;
