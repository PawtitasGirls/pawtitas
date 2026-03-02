import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../shared/styles';

export const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
  },

  listContainer: {
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  bold: {
    fontWeight: '700',
    color: '#000',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
  },
});
