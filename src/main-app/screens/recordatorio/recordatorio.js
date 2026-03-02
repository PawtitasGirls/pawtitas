import React from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import MenuInferior, { useNavbarHeight } from '../../components/MenuInferior';
import { styles } from './recordatorio.styles';

const Recordatorio = () => {
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();

  const handleBackPress = () => {
    navigation.goBack();
  };

  // ⚠️ Datos mockeados solo para UI
  const mockRecordatorios = [
    {
      id: 1,
      usuario: 'María López',
      fecha: '25 de marzo'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Recordatorios"
        subtitle="Reservas confirmadas pendientes"
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      {mockRecordatorios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No tenés recordatorios
          </Text>
          <Text style={styles.emptySubtitle}>
            Cuando tengas reservas confirmadas aparecerán acá.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS === 'android' && { paddingBottom: navbarHeight },
          ]}
        >
          {mockRecordatorios.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                Tenés una reserva confirmada
              </Text>

              <Text style={styles.cardText}>
                {`Tenés una reserva realizada por `}
                <Text style={styles.bold}>{item.usuario}</Text>
                {` para el `}
                <Text style={styles.bold}>{item.fecha}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <MenuInferior />
    </SafeAreaView>
  );
};

export default Recordatorio;