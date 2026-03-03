import { StyleSheet } from 'react-native';
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
    },
    channelItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
        backgroundColor: colors.surface || '#fff',
    },
    channelItemUnread: {
        backgroundColor: `${colors.brand?.accent || '#f5a3c1'}20`,
        borderLeftWidth: 18,
        borderLeftColor: colors.brand?.accent || '#f5a3c1',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#e1e1e1',
    },
    channelInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        alignItems: 'center',
    },
    name: {
        ...typography.styles.subtitle,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    date: {
        ...typography.styles.caption,
        color: colors.text.secondary,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    lastMessage: {
        ...typography.styles.body,
        color: colors.text.secondary,
        fontSize: 14,
        flex: 1,
    },
    roleChip: {
        backgroundColor: colors.surfaceVariant || '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    headerMock: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerMockText: {
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...typography.styles.h3,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        ...typography.styles.body,
        color: colors.text.secondary,
        textAlign: 'center',
        fontSize: 12,
    },
});
