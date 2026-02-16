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
    marginBottom: 30,
    lineHeight: 22,
    fontSize: 16,
  },
  missionBox: {
    maxWidth: 600,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 30,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.accentLanding,
    backgroundColor: colors.surface,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.brand.accentLanding,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  teamRowMobile: {
    flexDirection: "column",
    alignItems: "center",
    gap: 30,
  },
  card: {
    width: 120,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  name: {
    ...typography.styles.caption,
    fontWeight: "bold",
    color: colors.text.primary,
    textAlign: "center",
  },
  desc: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: "center",
  },
});

export default styles;

