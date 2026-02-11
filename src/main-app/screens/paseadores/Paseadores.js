import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PrestadorServiciosScreen } from '../../components';
import { PrestadorController } from '../../controller';
import { styles } from './Paseadores.styles';

const Paseadores = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaseadores();
  }, []);

  const loadPaseadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const prestadores = await PrestadorController.getPrestadores('paseador');
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
        <Text style={styles.loadingText}>Cargando paseadores</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={loadPaseadores}>
          Por favor, intente nuevamente
        </Text>
      </View>
    );
  }

  return (
    <PrestadorServiciosScreen
      navigation={navigation}
      providers={providers}
      providerType="paseador"
      screenTitle="Paseadores"
      screenSubtitle="Elige y contacta a paseadores verificados, priorizando los más cercanos"
    />
  );
};

export default Paseadores;