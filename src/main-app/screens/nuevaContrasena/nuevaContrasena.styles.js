import { StyleSheet } from "react-native";
import { colors, typography } from "../../../shared/styles";

export const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  formTitle: {
    ...typography.styles.h2,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeMessage: {
    ...typography.styles.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#E74C3C",
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerContainer: {
    marginTop: 22,
    alignItems: "center",
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f5a3c1ff",
    textDecorationLine: "underline",
  },
});
