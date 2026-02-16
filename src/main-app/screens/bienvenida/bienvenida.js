import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Logo from '../../assets/icon.png';
import { colors, typography } from '../../../shared/styles';

export default function BienvenidaScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.heroImage} resizeMode="contain" />
        <Text style={styles.logo}>PAWTITAS</Text>
        <Text style={styles.subtitle}>Encontrá el servicio ideal para tu mascota</Text>
      </View>

      {/* Opciones */}
      <View style={styles.card}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.cardText}>Cuidador</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>🦮</Text>
        <Text style={styles.cardText}>Paseador</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>🚑</Text>
        <Text style={styles.cardText}>Emergencias</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.cardText}>Veterinaria</Text>
      </View>

      {/* Botones */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Inicio')}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Registro')}
      >
        <Text style={styles.secondaryText}>Registrarse</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  logo: {
    ...typography.styles.h1,
    fontSize: 28,
    color: colors.brand.logo,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 28, marginRight: 15 },
  cardText: {
    ...typography.styles.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },

  button: {
    backgroundColor: colors.brand.logo,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.styles.bodyBold,
    color: colors.text.inverse,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.brand.logo,
  },
  secondaryText: {
    ...typography.styles.bodyBold,
    color: colors.brand.logo,
    fontSize: 16,
  },

  heroImage: {
    width: 120,
    height: 120,
    marginTop: 8,
    marginBottom: 8,
  },
});
