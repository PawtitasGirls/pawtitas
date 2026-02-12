import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../shared/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
    flex: 1,
  },
  searchInput: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  filterButtonActive: {
    backgroundColor: colors.brand.accent,
    borderColor: colors.brand.accent,
  },
  filterButtonText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  separator: {
    height: 16,
  },
  emptyState: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mascotaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  mascotaModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  mascotaModalTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  mascotaModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  mascotaModalItemSelected: {
    backgroundColor: colors.surfaceVariant || colors.border.light,
  },
  mascotaModalItemText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
  },
  mascotaModalAvanzar: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
  },
  mascotaModalAvanzarDisabled: {
    backgroundColor: colors.border.medium,
    opacity: 0.8,
  },
  mascotaModalAvanzarText: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  mascotaModalLoading: {
    padding: 16,
    alignItems: 'center',
  },
  mascotaModalCancel: {
    marginTop: 16,
    padding: 14,
    alignItems: 'center',
  },
  mascotaModalCancelText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
});
