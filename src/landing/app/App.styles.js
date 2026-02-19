import { StyleSheet, Platform } from "react-native";
import { colors, typography } from "../../shared/styles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLanding,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },


header: {
  paddingHorizontal: 20,
  paddingVertical: 20,
  justifyContent: "center",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.1)",
  width: "100%",
},

headerFixed: Platform.select({
  web: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: colors.backgroundLanding,
  },
  default: {},
}),

navContainer: {
  maxWidth: 1200,
  width: "100%",
  alignSelf: "center",
  alignItems: "center",   
  justifyContent: "center",
},


/* Desktop */
navMenu: {
  flexDirection: "row",
  gap: 24,
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  alignSelf: "center", 
},

/* Mobile */
navMenuMobile: {
  flexDirection: "column",
  alignItems: "center",  
  justifyContent: "center",
  gap: 14,
  width: "100%",
  flexWrap: "nowrap",
  backgroundColor: colors.backgroundLanding,
  paddingVertical: 16,
  borderRadius: 8,
  marginTop: 12,
},


navItem: {
  fontSize: 12,
  color: colors.text.secondary,
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: 1.2,
  paddingVertical: 8,
  paddingHorizontal: 16,
  textAlign: "center", 
},

navItemMobile: {
  textAlign: "center",
  paddingHorizontal: 0,
  width: "100%",
},

navButtonMobile: {
  width: "100%",
  alignItems: "center",
},

hamburger: {
  padding: 10,
  alignSelf: "flex-start",
  zIndex: 10,
},

hamburgerLine: {
  width: 25,
  height: 3,
  backgroundColor: colors.text.primary,
  marginVertical: 2,
  borderRadius: 2,
},

logo: {
  ...typography.styles.h1,
  color: colors.brand.logo,
  textAlign: "center",
  marginVertical: 10,
  alignSelf: "center", 
},

  /* ================= HERO ================= */

  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  heroTitle: {
    ...typography.styles.h2,
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: 10,
  },

  highlight: {
    color: colors.brand.accentLanding,
  },

  heroSubtitle: {
    ...typography.styles.body,
    textAlign: "center",
    maxWidth: 600,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },

  heroImage: {
    width: "100%",
    height: 200,
    marginVertical: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  buttonRowMobile: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    borderWidth: 2,
  },

  playStore: {
    backgroundColor: colors.button.playStore,
  },

  appStore: {
    backgroundColor: colors.button.appStore,
    borderWidth: 0,
  },

  appStoreContainer: {
    position: "relative",
  },

  comingSoonBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.button.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.primary,
  },

  buttonText: {
    ...typography.styles.button,
    color: colors.text.inverse,
    textAlign: "center",
  },
});

export default styles;
