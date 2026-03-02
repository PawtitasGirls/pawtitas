import React from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import MenuInferior, { useNavbarHeight } from '../../components/MenuInferior';
import { styles } from './recordatorio.styles';
import { useRecordatorios } from '../../hooks/useRecordatorios';

//logica: si el 'estado' de la reserva es 'PAGADO' entonces mostrarla en recordatorios, cualquier otro 'estado' no mostrar.
//las notificaciones estan hardcodeadas con un '3' en 'home.js', modificar para que muestre según la cantidad de tarjetas de reminders que haya.
const Recordatorio = () => {
//const { recordatorios, loading } = useRecordatorios();
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const mockRecordatorios = [
    {
      id: 1,
      usuario: 'María López',
      fecha: '25 de marzo'
    }
  ];
  
const formatFecha = (fecha) => {
  const date = new Date(fecha);

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
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