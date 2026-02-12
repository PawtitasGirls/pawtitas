import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PrestadorServiciosScreen } from '../../components';
import { PrestadorController } from '../../controller';
import { styles } from './Salud.styles';

const Salud = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSalud();
  }, []);

  const loadSalud = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const prestadores = await PrestadorController.getPrestadores('salud');
      setProviders(prestadores);
    } catch (err) {
      setError(err.message);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Cargando médicos veterinarios y clínicas</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={loadSalud}>
          Por favor, intente nuevamente
        </Text>
      </View>
    );
  }

  return (
    <PrestadorServiciosScreen
      navigation={navigation}
      providers={providers}
      providerType="médico o clínica veterinaria"
      screenTitle="Salud y Bienestar"
      screenSubtitle="Elige y contacta médicos veterinarios y clínicas certificadas, priorizando los más cercanos"
    />
  );
};

export default Salud;