import { StyleSheet } from "react-native";
import { colors } from "../../shared/styles";

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.backgroundLanding,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  container: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    alignItems: "stretch",
    gap: 12,
  },

  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap",
    gap: 16,
  },

  mainContentMobile: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },

  logo: {
    width: 40,
    height: 40,
  },

  brandText: {
    flexDirection: "column",
    flexShrink: 1,
  },

  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand.accentLanding,
  },

  tagline: {
    fontSize: 14,
    color: colors.text.secondary,
    opacity: 0.85,
    flexShrink: 1,
    flexWrap: "wrap",
  },

  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  linkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  separator: {
    fontSize: 14,
    color: colors.text.disabled,
  },

  socials: {
    flexDirection: "row",
    gap: 14,
  },

  copyright: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    opacity: 0.8,
    marginTop: 8,
  },
});

export default styles;
