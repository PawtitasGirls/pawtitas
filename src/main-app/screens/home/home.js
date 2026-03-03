import { styles } from './home.styles';
import MenuInferior, { useNavbarHeight } from '../../components/MenuInferior';
import iconImage from '../../assets/icon.png';
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator, Platform } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // librería de íconos
import { useLocation, useAuth } from '../../contexts';
import { isRouteAllowed, ROLES } from '../../constants/roles';
import { useRecordatorios } from '../../hooks/useRecordatorios';
import MercadoPagoConnect from '../perfil/components/MercadoPagoConnect';

// Persiste "último count visto" por usuario para que el badge no reaparezca al volver de otra pantalla
const recordatoriosLastSeenByUser = {};

// Componentes de categoría de servicios
const ServiceCategory = ({ emoji, title, description, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <Text style={styles.categoryEmoji}>{emoji}</Text>
    <Text style={styles.categoryTitle}>{title}</Text>
    <Text style={styles.categoryDescription} numberOfLines={2}>
      {description}
    </Text>
  </TouchableOpacity>
);

// Componente para el encabezado de la pantalla Home
const HomeHeader = ({ hidePendingControls, hideForAdmin, showRecordatoriosBadge = false, recordatoriosCount = 0, onGoToRecordatorio }) => {
  const navigation = useNavigation();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const {
    userLocation,
    isLoadingLocation,
    locationError,
    getCurrentLocation,
    clearLocation,
  } = useLocation();
  
  // Manejar la activación de la ubicación GPS
  const handleActivarUbicacion = async () => {
    const location = await getCurrentLocation(true); // Pasar true para habilitar la ubicación
    if (location) {
      alert('¡Ubicación activada correctamente! Ahora verás los servicios más cercanos.');
      setLocationModalVisible(false);
    } else {
      alert(locationError || 'No se pudo obtener la ubicación. Por favor, verifica los permisos en tu dispositivo.');
    }
  };

  // Manejar la desactivación de la ubicación GPS
  const handleDesactivarUbicacion = () => {
    clearLocation();
    alert('Ubicación desactivada. Los servicios ya no se ordenarán por cercanía.');
    setLocationModalVisible(false);
  };

  // Obtener el texto del botón según el estado de la ubicación
  const getLocationButtonText = () => {
    if (userLocation) {
      return 'Ubicación activada';
    }
    return 'Elegí tu ubicación';
  };

  return (
  <>
    {/* Primer bloque:  reminder, modal */}
    <View style={styles.header}>
<View style={styles.header}>
  {!hidePendingControls && !hideForAdmin && (
    <View style={styles.topRow}>

      {/* Ubicación (reemplaza al buscador) */}
      <TouchableOpacity
        style={[
          styles.locationButton,
          userLocation && styles.locationButtonActive
        ]}
        onPress={() => setLocationModalVisible(true)}
      >
        <Ionicons 
          name={userLocation ? "location" : "location-outline"} 
          size={18} 
          color={userLocation ? "#f5a3c1ff" : "#4f0d01ff"} 
        />
        <Text style={[
          styles.backText,
          userLocation && styles.locationActiveText
        ]}>
          {getLocationButtonText()}
        </Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onGoToRecordatorio || (() => navigation.navigate("Recordatorio"))}
      >
        <Ionicons name="notifications-outline" size={24} color="#333" />
        {showRecordatoriosBadge && recordatoriosCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{recordatoriosCount}</Text>
          </View>
        )}
      </TouchableOpacity>

    </View>
  )}
</View>

      {/* Modal de ubicación */}
      {!hidePendingControls && !hideForAdmin && (
        <Modal
          transparent
          visible={locationModalVisible}
          animationType="slide"
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elegí tu ubicación</Text>
              <Text style={styles.modalSubtitle}>
                Activá tu ubicación para encontrar servicios cercanos a ti
              </Text>
              
              {locationError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{locationError}</Text>
                </View>
              )}

              {isLoadingLocation ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#f5a3c1ff" />
                  <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
                </View>
              ) : (
                <>
                  {userLocation && (
                    <View style={styles.locationInfoContainer}>
                      <Ionicons name="checkmark-circle" size={20} color="#f5a3c1ff" />
                      <Text style={styles.locationInfoText}>
                        Ubicación activada correctamente
                      </Text>
                    </View>
                  )}

                  {/* Activar si no hay ubicación */}
                  {!userLocation && (
                    <TouchableOpacity
                      style={styles.modalOptionPrimary}
                      onPress={handleActivarUbicacion}
                    >
                      <Ionicons name="navigate" size={20} color="#fff" />
                      <Text style={styles.modalOptionTextPrimary}>Activar ubicación GPS</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.modalButtonsRow}>
                {userLocation && (
                  <TouchableOpacity
                    style={styles.modalOptionSecondary}
                    onPress={handleDesactivarUbicacion}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.modalOptionTextSecondary}>Desactivar</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.closeButton, userLocation && styles.closeButtonSmall]}
                  onPress={() => setLocationModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>

    {/* Segundo bloque: logo y tagline */}
    <View style={styles.header}>
      <View style={styles.statusBarSpace} />
      <View style={styles.logoContainer}>
        <Image 
          source={iconImage} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.logoText}>PAWTITAS</Text>
        <Text style={styles.taglineText}>Todo lo que tu mascota necesita, cerca tuyo.</Text>
      </View>
    </View>
  </>
);

};

const HomeScreen = () => {
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();
  const { role, user } = useAuth();
  const { recordatorios } = useRecordatorios();
  const [wentToRecordatorio, setWentToRecordatorio] = useState(false);

  const userId = user?.id != null ? String(user.id) : '';
  const lastSeenCount = recordatoriosLastSeenByUser[userId] ?? 0;

  useFocusEffect(
    React.useCallback(() => {
      if (wentToRecordatorio && userId) {
        recordatoriosLastSeenByUser[userId] = recordatorios.length;
        setWentToRecordatorio(false);
      }
    }, [wentToRecordatorio, userId, recordatorios.length])
  );

  const handleGoToRecordatorio = () => {
    setWentToRecordatorio(true);
    navigation.navigate('Recordatorio');
  };

  const estadoPrestador = String(user?.estadoPrestador || '').toUpperCase();
  const isPrestadorPendiente =
    role === ROLES.PRESTADOR && estadoPrestador === 'PENDIENTE';
  const isPrestadorActivo = role === ROLES.PRESTADOR && !isPrestadorPendiente;
  const isAdmin = role === ROLES.ADMIN;
  const showRecordatoriosBadge = recordatorios.length > lastSeenCount;

  // Categorías de servicios
  const serviceCategories = [
    {
      id: "1",
      emoji: "🏠",
      title: "Cuidadores",
      description: "Encontrá el cuidador ideal.",
      route: "Cuidadores",
      onPress: () => navigation.navigate("Cuidadores"),
    },
    {
      id: "2",
      emoji: "🦮",
      title: "Paseadores",
      description: "Caminatas seguras por tu zona.",
      route: "Paseadores",
      onPress: () => navigation.navigate("Paseadores"),
    },
    {
      id: "3",
      emoji: "🚑",
      title: "Veterinarias",
      description: "Clínicas y profesionales.",
      route: "Salud",
      onPress: () => navigation.navigate("Salud"),
    },

    {
      id: "4",
      emoji: "💌",
      title: "Mis conexiones",
      description: "Tu red de confianza en un solo lugar.",
      route: "MisConexiones",
      onPress: () => navigation.navigate("MisConexiones"),
    },

    {
      id: "5",
      emoji: "👨‍💻",
      title: "Panel de Administrador",
      description: "Gestión de usuarios",
      route: "PanelAdmin",
      onPress: () => navigation.navigate("PanelAdmin"),
    },
  ];

  const visibleCategories = serviceCategories.filter((category) => {
    if (!isRouteAllowed(role, category.route)) return false;
    if (isPrestadorPendiente && category.route === 'MisConexiones') return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === 'android' && { paddingBottom: navbarHeight },
          ]}
        >
        <HomeHeader
          hidePendingControls={isPrestadorPendiente}
          hideForAdmin={isAdmin}
          showRecordatoriosBadge={showRecordatoriosBadge}
          recordatoriosCount={recordatorios.length}
          onGoToRecordatorio={handleGoToRecordatorio}
        />

        {isPrestadorPendiente && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={18} color="#f5a3c1ff" />
            <Text style={styles.pendingText}>
              Tu perfil está en revisión ⏳
              {'\n'}
              Muy pronto vas a poder usar todas las funciones.
              {'\n'}
              {'\n'}
              Mientras tanto, podés completar o editar tu información desde Perfil 📝💛
            </Text>
          </View>
        )}
        
        {/* Bloque de categorías */}
        <View style={styles.categoriesContainer}>
          {visibleCategories.map((category) => (
            <ServiceCategory
              key={category.id}
              emoji={category.emoji}
              title={category.title}
              description={category.description}
              onPress={category.onPress}
            />
          ))}
        </View>

        {isRouteAllowed(role, "Resenas") && !isPrestadorPendiente && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Resenas")}
          >
            <Ionicons name="star" size={18} color="#f9d2ec" />
            <Text style={styles.backText}>Mis reseñas</Text>
          </TouchableOpacity>
        )}

        {isPrestadorActivo && (
          <MercadoPagoConnect prestadorId={user?.prestadorId ?? user?.id} />
        )}
        </ScrollView>
      </View>

      <MenuInferior />
    </View>
  );
};

export default HomeScreen;