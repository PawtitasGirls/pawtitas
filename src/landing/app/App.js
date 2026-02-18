import React, { useRef, useState } from "react";
import Logo from "../../../assets/icon.png";

import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
  Platform,
} from "react-native";

import styles from "./App.styles";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import Servicios from "../servicios/Servicios";
import Suscripciones from "../suscripciones/Suscripciones";
import Contacto from "../contacto/Contacto";
import Nosotros from "../nosotros/Nosotros";
import Features from "../features/Features";
import ComoFunciona from "../comoFunciona/ComoFunciona";
import Footer from "../footer/Footer";

import { colors } from "../../shared/styles";

// Fonts
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";

import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

import { useFonts } from "expo-font";

export default function LandingApp() {
  const scrollRef = useRef(null);
  const sectionPositions = useRef({});
  const [menuOpen, setMenuOpen] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const onSectionLayout = (key, event) => {
    sectionPositions.current[key] = event.nativeEvent.layout.y;
  };

  const scrollToSection = (key) => {
    if (sectionPositions.current[key] !== undefined) {
      const offset = isMobile ? 250 : 0;
      scrollRef.current.scrollTo({
        y: Math.max(0, sectionPositions.current[key] - offset),
        animated: true,
      });
    }
    setMenuOpen(false);
  };

  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isMobile && styles.headerFixed]}>
          <View style={styles.navContainer}>
            {isMobile && (
              <TouchableOpacity
                style={styles.hamburger}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
              </TouchableOpacity>
            )}

            {(!isMobile || menuOpen) && (
              <View style={[styles.navMenu, isMobile && styles.navMenuMobile]}>
                {[
                  { label: "Inicio", action: () => {
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                    setMenuOpen(false);
                  }},
                  { label: "Servicios", action: () => scrollToSection("servicios") },
                  { label: "Cómo Funciona", action: () => scrollToSection("comoFunciona") },
                  { label: "Suscripciones", action: () => scrollToSection("suscripciones") },
                  { label: "Nosotros", action: () => scrollToSection("nosotros") },
                  { label: "Contacto", action: () => scrollToSection("contacto") },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={item.action}
                    style={isMobile && styles.navButtonMobile}
                  >
                    <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            { flexGrow: 1 },
            Platform.OS === "web" && isMobile && { paddingTop: 72 },
          ]}
        >
          <Text style={styles.logo}>PAWTITAS</Text>

          <Image source={Logo} style={styles.heroImage} resizeMode="contain" />

          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              Cuidados para tu{" "}
              <Text style={styles.highlight}>mascota</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              Bienvenidos a la App que te ayuda con el cuidado de tu mejor amigo
            </Text>

            <Text style={styles.heroSubtitle}>Disponible en</Text>

            <View style={[styles.buttonRow, isMobile && styles.buttonRowMobile]}>
              <TouchableOpacity
                style={[styles.button, styles.playStore]}
                onPress={() => Linking.openURL('https://play.google.com/store/apps')}
              >
                <Text style={styles.buttonText}>Play Store</Text>
              </TouchableOpacity>

              <View style={styles.appStoreContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.appStore]}
                  onPress={() => Linking.openURL('https://www.apple.com/la/app-store/')}
                >
                  <Text style={styles.buttonText}>App Store</Text>
                </TouchableOpacity>

                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Próximamente</Text>
                </View>
              </View>
            </View>
          </View>

          <Features />

          <View onLayout={(e) => onSectionLayout("servicios", e)}>
            <Servicios />
          </View>

          <View onLayout={(e) => onSectionLayout("comoFunciona", e)}>
            <ComoFunciona />
          </View>

          <View onLayout={(e) => onSectionLayout("suscripciones", e)}>
            <Suscripciones scrollToSection={scrollToSection} />
          </View>

          <View onLayout={(e) => onSectionLayout("nosotros", e)}>
            <Nosotros />
          </View>

          <View onLayout={(e) => onSectionLayout("contacto", e)}>
            <Contacto />
          </View>

          <Footer
            scrollToSection={scrollToSection}
            scrollToTop={() =>
              scrollRef.current.scrollTo({ y: 0, animated: true })
            }
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
