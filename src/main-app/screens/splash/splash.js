import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography } from '../../../shared/styles';
import Logo from '../../assets/icon.png';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Bienvenida');
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>PAWTITAS</Text>
      <Text style={styles.tagline}>Todo lo que tu mascota necesita, cerca tuyo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: {
    ...typography.styles.h1,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.brand.logo,
    letterSpacing: 0.5,
  },
  tagline: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
