import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  useWindowDimensions
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import iconImage from "../../../assets/icon.png";
import { colors } from "../../shared/styles/colors";
import styles from "./Footer.styles";

export default function Footer({ scrollToSection, scrollToTop }) {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  return (
    <View style={styles.footer}>
      <View style={styles.container}>

        {/* Contenido principal */}
        <View
          style={[
            styles.mainContent,
            isMobile && styles.mainContentMobile
          ]}
        >
          <TouchableOpacity onPress={scrollToTop} style={styles.brandSection}>
            <Image source={iconImage} style={styles.logo} resizeMode="contain" />

            <View style={styles.brandText}>
              <Text style={styles.appName}>PAWTITAS</Text>

              <Text style={styles.tagline}>
                Conectando necesidades con servicios verificados.
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.socials}>
            <TouchableOpacity onPress={() => Linking.openURL("https://facebook.com")}>
              <FontAwesome name="facebook" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")}>
              <FontAwesome name="instagram" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://twitter.com")}>
              <FontAwesome name="twitter" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.navLinks}>
          <TouchableOpacity onPress={scrollToTop}>
            <Text style={styles.linkText}>Inicio</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity onPress={() => scrollToSection?.("servicios")}>
            <Text style={styles.linkText}>Servicios</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity onPress={() => scrollToSection?.("nosotros")}>
            <Text style={styles.linkText}>Nosotros</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity onPress={() => scrollToSection?.("contacto")}>
            <Text style={styles.linkText}>Contacto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2026 PAWTITAS
        </Text>
      </View>
    </View>
  );
}
