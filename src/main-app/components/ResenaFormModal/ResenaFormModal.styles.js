import { StyleSheet } from 'react-native';
import { colors, typography } from '../../../shared/styles';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  modalTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  formContent: {
    paddingBottom: 24,
  },
  formContentKeyboardOpen: {
    paddingBottom: 56,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    marginBottom: 8,
  },
  userName: {
    ...typography.styles.subtitle,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  userType: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: 6,
    fontWeight: '600',
    marginLeft: 4,
  },
  textarea: {
    height: 120,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  textareaFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  textareaError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  placeholder: {
    color: colors.text.disabled,
  },
  errorText: {
    ...typography.styles.small,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    ...typography.styles.small,
    color: colors.text.disabled,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  buttonText: {
    ...typography.styles.button,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.text.secondary,
  },
  saveButtonText: {
    color: colors.surface,
  },
  disabledButton: {
    backgroundColor: colors.border.medium,
  },
  disabledButtonText: {
    color: colors.text.disabled,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
});
