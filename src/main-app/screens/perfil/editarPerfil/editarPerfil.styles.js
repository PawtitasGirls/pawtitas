import { StyleSheet, Platform } from "react-native";
import { colors, typography } from "../../../../shared/styles";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 16,
  },
  additionalInfoContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 12,
  },
  additionalInfoTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: "600",
    flex: 1,
  },
  infoContent: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoBullet: {
    color: "#B77B5D",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  additionalInfoText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    lineHeight: 22,
    flex: 1,
    },
  checkboxGroup: {
    marginTop: 8,
    marginBottom: 16,
    gap: 16,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  availabilityGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  dayItem: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    minWidth: 80,
  },
  dayLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  serviceStatusContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },
  serviceStatusSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceStatusLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  serviceStatusInfo: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: 4,
    marginBottom: 8,
  },
  perfilRegistradoLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  perfilRegistradoHint: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  ubicacionHint: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: 4,
    fontStyle: "italic",
  },
});

const ANDROID_BUTTON_PADDING_KEYBOARD_OPEN = 16;

export const getButtonContainerStyle = (navbarHeight, isKeyboardVisible = false) => {
  if (Platform.OS !== "android") return {};
  return {
    paddingBottom: isKeyboardVisible ? ANDROID_BUTTON_PADDING_KEYBOARD_OPEN : navbarHeight,
  };
};

export default styles;
