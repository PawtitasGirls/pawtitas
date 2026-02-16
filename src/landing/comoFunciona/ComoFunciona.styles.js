import { StyleSheet } from "react-native";
import { colors, typography } from "../../shared/styles";

const styles = StyleSheet.create({
  section: {
    paddingVertical: 40,
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
    marginBottom: 40,
    lineHeight: 22,
    fontSize: 16,
    maxWidth: 600,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    maxWidth: 1000,
  },
  stepsContainerMobile: {
    flexDirection: "column",
    gap: 0,
    width: "100%",
    alignItems: "center",
  },
  stepCard: {
    alignItems: "center",
    maxWidth: 160,
    minWidth: 140,
  },
  stepCardMobile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: "auto",
  },
  stepNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brand.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.brand.lightBlue,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    opacity: 0.8,
  },
  stepArrow: {
    fontSize: 24,
    color: colors.border.dark,
    marginHorizontal: 8,
  },
  stepArrowMobile: {
    marginHorizontal: 0,
    marginVertical: 20,
    fontSize: 28,
  },
});

export default styles;

