import { StyleSheet } from 'react-native';
import { colors } from '../../../../shared/styles';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectedText: {
    fontSize: 14,
    color: '#00a650',
    fontWeight: '500',
  },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disconnectText: {
    fontSize: 13,
    color: '#999',
  },
  connectBtn: {
    backgroundColor: colors.brand.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    gap: 8,
  },
  compactTextContainer: {
    flexShrink: 1,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6f0d01ff',
  },
  compactSubConnected: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: '500',
    marginTop: 2,
  },
  compactSubDisconnected: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default styles;
