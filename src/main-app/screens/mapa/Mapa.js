import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../../contexts';
import MenuInferior from '../../components/MenuInferior';
import { MapaController, MAPA_CONFIG } from '../../controller';
import { styles, getAttributionStyle } from './Mapa.styles';

const MapaScreen = () => {
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { userLocation, getCurrentLocation, isLoadingLocation, isLocationEnabled } = useLocation();

  const [state, setState] = useState(MapaController.getInitialState());
  const [isMapLoading, setIsMapLoading] = useState(true);

  const {
    region,
    mapHeading,
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    activePOIType,
    pois,
    isLoadingPOIs,
    selectedDestination,
    routeCoordinates,
    routeInfo,
    routeProfile,
    isLoadingRoute,
  } = state;

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    loadInitialLocation();
  }, []);

  const loadInitialLocation = async () => {
    // Si el usuario ya tiene ubicación guardada y está habilitada, centrar el mapa ahí
    if (userLocation && isLocationEnabled) {
      const newRegion = MapaController.getRegionForLocation(userLocation, 0.05);
      updateState({ region: newRegion });

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion,  1000);
      }
      return;
    }
    
    if (!isLocationEnabled) {
      return;
    }
    
    // Solo obtener ubicación si está habilitada
    const location = await getCurrentLocation();
    if (location) {
      const newRegion = MapaController.getRegionForLocation(location, 0.05);
      updateState({ region: newRegion });

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  const handleRegionChangeComplete = async (newRegion) => {
    updateState({ region: newRegion });

    if (mapRef.current?.getCamera) {
      try {
        const camera = await mapRef.current.getCamera();
        updateState({ mapHeading: camera?.heading || 0 });
      } catch (error) {
        // Ignorar errores de lectura de cámara
      }
    }
  };

  useEffect(() => {
    if (!MapaController.isValidSearchQuery(searchQuery)) {
      updateState({ searchResults: [], showSearchResults: false });
      return;
    }

    const timeoutId = setTimeout(async () => {
      await handleSearch();
    }, MAPA_CONFIG.SEARCH_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!MapaController.isValidSearchQuery(searchQuery)) return;

    updateState({ isSearching: true });
    try {
      const results = await MapaController.searchAddress(searchQuery, userLocation);
      updateState({
        searchResults: results,
        showSearchResults: true,
      });
    } catch (error) {
    } finally {
      updateState({ isSearching: false });
    }
  };

  const handleSelectSearchResult = (result) => {
    const newRegion = MapaController.getRegionForLocation(result, 0.01);

    updateState({
      region: newRegion,
      showSearchResults: false,
      searchQuery: result.name,
    });

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  // Cargar POIs
  const loadPOIs = async (type) => {
    updateState({
      isLoadingPOIs: true,
      pois: [],
      activePOIType: type,
      // Limpiar ruta y destino al cambiar de categoría
      routeCoordinates: [],
      routeInfo: null,
      selectedDestination: null,
    });

    const results = await MapaController.loadPOIs(type, userLocation);

    updateState({
      pois: results,
      isLoadingPOIs: false,
    });
  };

  const handleGetRoute = async (destination) => {
    const defaultProfile = MAPA_CONFIG.ROUTE_PROFILES.WALKING;

    updateState({
      isLoadingRoute: true,
      selectedDestination: destination,
      routeProfile: defaultProfile,
    });

    const route = await MapaController.calculateRoute(
      userLocation,
      destination,
      defaultProfile
    );

    if (route) {
      const formattedInfo = MapaController.formatRouteInfo(route);

      updateState({
        routeCoordinates: route.coordinates,
        routeInfo: formattedInfo,
      });

      if (mapRef.current) {
        mapRef.current.fitToCoordinates([userLocation, destination], {
          edgePadding: MAPA_CONFIG.ROUTE_EDGE_PADDING,
          animated: true,
        });
      }
    }

    updateState({ isLoadingRoute: false });
  };

  const clearRoute = () => {
    updateState({
      routeCoordinates: [],
      routeInfo: null,
      selectedDestination: null,
    });
  };

  // Cambiar perfil de ruta y recalcular
  const toggleRouteProfile = async () => {
    const newProfile = MapaController.toggleRouteProfile(routeProfile);
    updateState({ routeProfile: newProfile, isLoadingRoute: true });

    if (selectedDestination) {
      const route = await MapaController.calculateRoute(
        userLocation,
        selectedDestination,
        newProfile
      );

      if (route) {
        const formattedInfo = MapaController.formatRouteInfo(route);

        updateState({
          routeCoordinates: route.coordinates,
          routeInfo: formattedInfo,
        });
      }
    }

    updateState({ isLoadingRoute: false });
  };

  const goToUserLocation = () => {
    if (MapaController.hasUserLocation(userLocation) && mapRef.current) {
      const newRegion = MapaController.getRegionForLocation(userLocation, 0.01);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  // Reorientar el mapa al norte
  const resetCompass = async () => {
    if (!mapRef.current?.getCamera) return;

    try {
      const camera = await mapRef.current.getCamera();
      mapRef.current.animateCamera(
        { ...camera, heading: 0, pitch: camera?.pitch || 0 },
        { duration: 250 }
      );
      updateState({ mapHeading: 0 });
    } catch (error) {
      // Ignorar errores de reorientación
    }
  };

  const clearSearch = () => {
    updateState({
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
    });
    Keyboard.dismiss();
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    if (searchResults.length > 0) {
      updateState({ showSearchResults: false });
    }
  };

  // Activar o desactivar POI
  const togglePOI = (type) => {
    if (activePOIType === type) {
      // Al desactivar, limpiar POIs, ruta y destino seleccionado
      updateState({
        activePOIType: MAPA_CONFIG.POI_TYPES.NONE,
        pois: [],
        routeCoordinates: [],
        routeInfo: null,
        selectedDestination: null,
      });
    } else {
      loadPOIs(type);
    }
  };

  const compassIsNeutral = Math.abs(mapHeading) < 1;

  const mapPaddingTop = Platform.select({
    ios: insets.top + 140,
    android: insets.top + 120,
    default: insets.top + 120,
  });

  const mapPaddingBottom = Platform.select({
    ios: insets.bottom + 90,
    android: insets.bottom + 90,
    default: insets.bottom + 90,
  });

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <View style={styles.container}>
        {isMapLoading && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="small" color={MAPA_CONFIG.MARKER_COLORS.USER} />
            <Text style={styles.mapLoadingText}>
              Cargando el mapa… Esto puede demorar unos minutos en la primera sesión.
            </Text>
          </View>
        )}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={region}
          showsCompass={false}
          onMapReady={() => setIsMapLoading(false)}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={MapaController.hasUserLocation(userLocation)}
          showsMyLocationButton={false}
          mapPadding={{
            top: mapPaddingTop,
            bottom: mapPaddingBottom,
            left: 0,
            right: 0,
          }}
        >
          {/* Marcador de ubicación del usuario */}
          {MapaController.hasUserLocation(userLocation) && (
            <Marker
              coordinate={userLocation}
              title="Tu ubicación"
              pinColor={MAPA_CONFIG.MARKER_COLORS.USER}
            />
          )}

          {/* Marcadores de POIs */}
          {pois.map((poi) => {
            const pinColor = MapaController.getMarkerColor(poi.type);

            return (
              <Marker
                key={poi.id}
                coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                title={poi.name}
                description={poi.address}
                pinColor={pinColor}
                onPress={() =>
                  handleGetRoute({ latitude: poi.latitude, longitude: poi.longitude })
                }
              />
            );
          })}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={MAPA_CONFIG.MARKER_COLORS.USER}
              strokeWidth={4}
            />
          )}
        </MapView>

      {/* Barra de búsqueda + brújula */}
      <View style={styles.topControls}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar dirección"
              value={searchQuery}
              onChangeText={(text) => updateState({ searchQuery: text })}
              onFocus={() =>
                searchResults.length > 0 && updateState({ showSearchResults: true })
              }
            />
            {isSearching && <ActivityIndicator size="small" color={MAPA_CONFIG.MARKER_COLORS.USER} />}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Resultados de búsqueda */}
          {showSearchResults && searchResults.length > 0 && (
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {result.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.compassButton,
            compassIsNeutral && styles.compassButtonDisabled,
          ]}
          onPress={resetCompass}
        >
          <Ionicons
            name="compass"
            size={22}
            color="#666"
            style={[
              styles.compassIcon,
              { transform: [{ rotate: `${mapHeading}deg` }] },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Botones de POIs */}
      <View style={styles.poiButtonsContainer}>
        {MAPA_CONFIG.POI_BUTTONS.map((button) => {
          const isActive = activePOIType === button.type;

          return (
            <TouchableOpacity
              key={button.type}
              style={[styles.poiButton, isActive && styles.poiButtonActive]}
              onPress={() => togglePOI(button.type)}
              disabled={isLoadingPOIs}
            >
              <Ionicons
                name={button.icon}
                size={18}
                color={isActive ? '#fff' : button.activeColor}
              />
              <Text
                style={[
                  styles.poiButtonText,
                  isActive && styles.poiButtonTextActive,
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Información de ruta */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoContent}>
            <View style={styles.routeInfoRow}>
              <View style={styles.routeInfoSection}>
                <Ionicons 
                  name={routeProfile === MAPA_CONFIG.ROUTE_PROFILES.DRIVING ? 'car' : 'walk'} 
                  size={18} 
                  color={routeProfile === MAPA_CONFIG.ROUTE_PROFILES.DRIVING ? '#3b82f6' : '#22c55e'} 
                />
                <Text style={styles.routeInfoText}>
                  {routeInfo.distance} • {routeInfo.duration}
                </Text>
              </View>
            </View>

            <View style={styles.routeActions}>
              <TouchableOpacity
                style={styles.routeProfileButton}
                onPress={toggleRouteProfile}
                disabled={isLoadingRoute}
              >
                {isLoadingRoute ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Ionicons
                    name={
                      routeProfile === MAPA_CONFIG.ROUTE_PROFILES.DRIVING ? 'walk' : 'car'
                    }
                    size={18}
                    color="#666"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.routeCloseButton} onPress={clearRoute}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Botón de ubicación actual */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={isLoadingLocation ? null : goToUserLocation}
        disabled={!MapaController.hasUserLocation(userLocation)}
      >
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color={MAPA_CONFIG.MARKER_COLORS.USER} />
        ) : (
          <Ionicons
            name="locate"
            size={24}
            color={
              MapaController.hasUserLocation(userLocation)
                ? MAPA_CONFIG.MARKER_COLORS.USER
                : '#999'
            }
          />
        )}
      </TouchableOpacity>

      {/* Cargando POIs */}
      {isLoadingPOIs && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={MAPA_CONFIG.MARKER_COLORS.USER} />
          <Text style={styles.loadingText}>Buscando lugares cercanos</Text>
        </View>
      )}

      {/* Atribución OSM */}
      <View style={[styles.attribution, getAttributionStyle(insets.bottom)]}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
        <Text style={styles.attributionDisclaimerText}>
        Los lugares mostrados no implican asociación directa con Pawtitas.
        </Text>
      </View>

      <MenuInferior />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MapaScreen;
