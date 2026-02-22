import { StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../../../shared/styles';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.medium,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backIcon: {
        fontSize: 24,
        color: colors.text?.primary,
        fontWeight: '600',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#e1e1e1',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text?.primary,
        marginBottom: 4,
    },
    roleChipContainer: {
        backgroundColor: colors.surfaceVariant,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text?.secondary,
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        padding: 15,
        paddingBottom: 10,
        flexGrow: 1,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 15,
        maxWidth: '80%',
        marginBottom: 10,
        elevation: 1,
        shadowColor: colors.text?.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.button.primary,
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceVariant,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '400',
    },
    messageImage: {
        width: 210,
        height: 210,
        borderRadius: 10,
        marginTop: 8,
    },
    myMessageText: {
        color: colors.text.inverse,
    },
    theirMessageText: {
        color: colors.text.primary,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimestamp: {
        color: colors.text.inverse,
    },
    theirTimestamp: {
        color: colors.text.secondary,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: colors.surface,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    },
    input: {
        flex: 1,
        backgroundColor: colors.surfaceVariant,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        color: colors.text.primary,
    },
    attachButton: {
        marginRight: 8,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.surfaceVariant,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachButtonText: {
        fontSize: 18,
    },
    sendButton: {
        marginLeft: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.button.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    sendButtonDisabled: {
        backgroundColor: colors.border.medium,
    },
    sendButtonText: {
        color: colors.text.inverse,
        fontWeight: '700',
        fontSize: 15,
    },
    disabledSendText: {
        color: colors.text.inverse,
        opacity: 0.5,
    },
    previewContainer: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewImage: {
        width: 54,
        height: 54,
        borderRadius: 8,
    },
    removePreviewBtn: {
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.surfaceVariant,
    },
    removePreviewText: {
        color: colors.text.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyChatText: {
        color: colors.text.secondary,
        textAlign: 'center',
        fontSize: 14,
    },
});

const ANDROID_INPUT_PADDING_KEYBOARD_CLOSED = 20;
const ANDROID_INPUT_PADDING_KEYBOARD_OPEN = 10;

export const getInputContainerStyle = (bottomInset, isKeyboardVisible = false) => {
    if (Platform.OS !== 'android') return {};
    return {
        paddingBottom: isKeyboardVisible
            ? ANDROID_INPUT_PADDING_KEYBOARD_OPEN
            : bottomInset + ANDROID_INPUT_PADDING_KEYBOARD_CLOSED,
    };
};
