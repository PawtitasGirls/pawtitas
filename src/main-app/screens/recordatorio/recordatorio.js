import React from 'react';
import { ScrollView, View, Text, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import MenuInferior, { useNavbarHeight } from '../../components/MenuInferior';
import { styles } from './recordatorio.styles';
import { useRecordatorios } from '../../hooks/useRecordatorios';

//logica: si el 'estado' de la reserva es 'PAGADO' entonces mostrarla en recordatorios, cualquier otro 'estado' no mostrar.
//las notificaciones estan hardcodeadas con un '3' en 'home.js', modificar para que muestre según la cantidad de tarjetas de reminders que haya.
const Recordatorio = () => {
  const { recordatorios, loading } = useRecordatorios();
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();

  const handleBackPress = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Recordatorios"
        subtitle="Reservas confirmadas pendientes"
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#f5a3c1ff" />
          <Text style={styles.emptySubtitle}>
            Cargando tus recordatorios
          </Text>
        </View>
      ) : recordatorios.length === 0 ? (
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
          {recordatorios.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                Tenés una reserva confirmada
              </Text>

              {item.tieneFecha ? (
                <Text style={styles.cardText}>
                  {`Tenés una reserva con `}
                  <Text style={styles.bold}>{item.usuario}</Text>
                  {` para el `}
                  <Text style={styles.bold}>{item.fechaLabel}</Text>
                </Text>
              ) : (
                <Text style={styles.cardText}>
                  No pudimos guardar la fecha de este servicio. Volvé a intentarlo.
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      

      <MenuInferior />
    </SafeAreaView>
  );
};

export default Recordatorio;