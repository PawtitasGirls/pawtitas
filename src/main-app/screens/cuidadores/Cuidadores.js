import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PrestadorServiciosScreen } from '../../components';
import { PrestadorController } from '../../controller';
import { styles } from './Cuidadores.styles';

const Cuidadores = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCuidadores();
  }, []);

  const loadCuidadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const prestadores = await PrestadorController.getPrestadores('cuidador');
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
        <Text style={styles.loadingText}>Cargando cuidadores</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={loadCuidadores}>
          Por favor, intente nuevamente
        </Text>
      </View>
    );
  }

  return (
    <PrestadorServiciosScreen
      navigation={navigation}
      providers={providers}
      providerType="cuidador"
      screenTitle="Cuidadores"
      screenSubtitle="Elige y contacta a cuidadores verificados, priorizando los más cercanos"
    />
  );
};

export default Cuidadores;