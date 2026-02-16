import { StyleSheet } from "react-native";
import { colors, typography } from "../../shared/styles";

const styles = StyleSheet.create({
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: colors.backgroundLanding,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontSize: 16,
  },
  form: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
    backgroundColor: "transparent",
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  button: {
    backgroundColor: colors.brand.lightBlue,
    borderWidth: 2,
    borderColor: colors.brand.lightBlue,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    ...typography.styles.button,
    color: colors.text.inverse,
    fontWeight: "800",
    fontSize: 16,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  emoji: {
    fontSize: 40,
  },
  inputError: {
    borderBottomColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -16,
    marginBottom: 12,
    paddingLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  floatingMessage: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50", // Verde de éxito
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingMessageText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});


export default styles;

