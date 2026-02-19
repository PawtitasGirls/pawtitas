import React, { useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ROLES } from '../../constants/roles';
import ScreenHeader from '../../components/ScreenHeader';
import MenuInferior, { useNavbarHeight } from '../../components/MenuInferior';
import BarraBuscador from '../../components/BarraBuscador/BarraBuscador';
import Filtros from '../../components/Filtros/Filtros';
import ResenaFormModal from '../../components/ResenaFormModal/ResenaFormModal';
import ConexionCard from '../../components/ConexionCard/ConexionCard';
import ConexionDetalles from '../../components/ConexionDetalles/ConexionDetalles';
import ConfirmacionDialogo from '../../components/ConfirmacionDialogo';
import CalendarioPagoModal from '../../components/CalendarioPagoModal';
import MercadoPagoWebView from '../../components/MercadoPagoWebView';
import Paginador from '../../components/Paginador';
import { MensajeFlotante } from '../../components';
import { useMisConexiones } from '../../hooks/useMisConexiones';
import { usePaginacion } from '../../hooks/usePaginacion';
import { styles } from './MisConexiones.styles';

// Pantalla de Mis Conexiones
const MisConexiones = () => {
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();
  const {
    state,
    providers,
    loadingConexiones,
    isPrestadorView,
    role,
    handleSearch,
    handleFilterChange,
    handleProviderPress,
    handleCloseDetalles,
    handlePago,
    handleConfirmarPago,
    handleCancelarCalendario,
    handlePaymentSuccess,
    handlePaymentFailure,
    handleClosePaymentWebView,
    handleFinalizarServicio,
    handleRechazar,
    handleConfirmarRechazo,
    handleCancelarRechazo,
    handleAgregarResena,
    handleDetallesModalHide,
    handleResenaGuardada,
    handleCloseResenaModal,
    handleHideMensajeFlotante,
    toggleFilters,
    handleResenas,
    handleConectar,
    handleChat,
    getProviderType,
    filterOptions,
    mensajeFlotanteConfig
  } = useMisConexiones();

  // Navegación
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleChatWithNavigation = (provider) => {
    handleChat(provider, navigation);
  };

  const {
    paginaActual,
    totalPaginas,
    itemsActuales: providersActuales,
    manejarCambioPagina,
    reiniciarPagina,
  } = usePaginacion(providers);

  useEffect(() => {
    reiniciarPagina();
  }, [state.searchQuery, state.selectedFilter]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ScreenHeader 
        title="Mis Conexiones"
        subtitle="Visualiza, gestiona y paga tus servicios de cuidado, paseo y salud de tu mascota"
        onBackPress={handleBackPress}
        showBackButton={true}
      />
      
      <BarraBuscador
        value={state.searchQuery}
        onChangeText={handleSearch}
        placeholder="Buscar conexiones"
        onFilterPress={toggleFilters}
        filterIcon="menu-outline"
      />

      <Filtros
        filters={filterOptions}
        selectedFilter={state.selectedFilter}
        onFilterChange={handleFilterChange}
        visible={state.showFilters}
      />

      {loadingConexiones ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Cargando conexiones</Text>
        </View>
      ) : providers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {isPrestadorView ? 'Aún no tenés solicitudes' : 'Aún no tenés conexiones'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isPrestadorView
              ? 'Cuando un cliente te envíe una solicitud de servicio, aparecerá acá.'
              : 'Conectá con prestadores de servicios desde Cuidadores, Paseadores o Salud y aparecerán acá.'}
          </Text>
        </View>
      ) : (
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.usersList,
          Platform.OS === 'android' && { paddingBottom: navbarHeight },
        ]}
      >
        {providersActuales.map((provider) => (
          <ConexionCard
            key={provider.id}
            provider={provider}
            providerType={getProviderType(provider.tipo)}
            onPress={() => handleProviderPress(provider)}
            misConexiones={true}
          />
        ))}
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambioPagina={manejarCambioPagina}
        />
      </ScrollView>
      )}
      
      <ConexionDetalles
        visible={state.showDetalles}
        provider={state.selectedProvider}
        providerType={state.selectedProvider ? getProviderType(state.selectedProvider.tipo) : ''}
        onClose={handleCloseDetalles}
        onResenas={handleResenas}
        onConectar={handleConectar}
        misConexiones={true}
        esVistaPrestador={isPrestadorView}
        onChat={handleChatWithNavigation}
        onPago={handlePago}
        onFinalizarServicio={handleFinalizarServicio}
        onAgregarResena={handleAgregarResena}
        onRechazar={handleRechazar}
        onModalHide={handleDetallesModalHide}
        isAdmin={role === ROLES.ADMIN}
      />

      <ResenaFormModal
        visible={state.showResenaModal}
        usuario={state.selectedProvider}
        tipoUsuario={isPrestadorView ? 'cliente' : 'prestador'}
        onSave={handleResenaGuardada}
        onClose={handleCloseResenaModal}
      />

      <CalendarioPagoModal
        visible={state.showCalendarioModal}
        providerName={state.selectedProvider?.nombre}
        onClose={handleCancelarCalendario}
        onConfirm={handleConfirmarPago}
      />

      <MercadoPagoWebView
        visible={state.showPaymentWebView}
        paymentUrl={state.paymentUrl}
        onClose={handleClosePaymentWebView}
      />

      <ConfirmacionDialogo
        visible={state.showRechazarModal}
        title="Rechazar solicitud"
        message="¿Estás seguro de que quieres rechazar esta solicitud? Esta acción no se puede deshacer."
        onConfirm={handleConfirmarRechazo}
        onCancel={handleCancelarRechazo}
        confirmText="Rechazar"
        cancelText="Cancelar"
        type="danger"
      />

      <MensajeFlotante
        visible={state.showMensajeFlotante}
        message={state.mensajeFlotante.text}
        type={state.mensajeFlotante.type}
        onHide={handleHideMensajeFlotante}
        duration={mensajeFlotanteConfig.duration}
      />

      <MenuInferior />
    </SafeAreaView>
  );
}

export default MisConexiones;