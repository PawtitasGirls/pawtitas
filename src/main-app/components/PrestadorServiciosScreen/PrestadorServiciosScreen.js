import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/styles';
import { ROLES } from '../../constants/roles';
import ScreenHeader from '../ScreenHeader';
import BarraBuscador from '../BarraBuscador/BarraBuscador';
import Filtros from '../Filtros/Filtros';
import MenuInferior from '../MenuInferior/MenuInferior';
import ConexionCard from '../ConexionCard';
import ConexionDetalles from '../ConexionDetalles';
import Paginador from '../Paginador';
import { useLocation, useAuth } from '../../contexts';
import { usePaginacion } from '../../hooks/usePaginacion';
import { getMascotasByDuenio, createReserva } from '../../services';
import { styles } from './PrestadorServiciosScreen.styles';

const FILTROS_DATA = [
  { key: 'cercania', label: 'Más cercanos' },
  { key: 'mejor-calificacion', label: 'Mejor calificación' },
  { key: 'mejor-precio', label: 'Mejor precio' },
];

const EMPTY_MESSAGES = {
  cuidador: { title: 'Aún no hay cuidadores', subtitle: 'Pronto tendremos cuidadores verificados en tu zona.' },
  paseador: { title: 'Aún no hay paseadores', subtitle: 'Pronto tendremos paseadores verificados en tu zona.' },
  'médico o clínica veterinaria': { title: 'Aún no hay profesionales de salud', subtitle: 'Pronto tendremos médicos y clínicas veterinarias en tu zona.' },
};

const PrestadorServiciosScreen = ({ 
  navigation, 
  providers, 
  providerType, // cuidador, paseador o veterinario
  screenTitle,
  screenSubtitle
}) => {
  const { userLocation, getDistanceFromUser, isLocationEnabled } = useLocation();
  const { user, role } = useAuth();
  
  // Filtro por defecto: 'cercania' si hay ubicación activada, sino 'mejor-calificacion'
  const defaultFilter = isLocationEnabled && userLocation ? 'cercania' : 'mejor-calificacion';
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showMascotaModal, setShowMascotaModal] = useState(false);
  const [providerToConnect, setProviderToConnect] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loadingMascotas, setLoadingMascotas] = useState(false);
  const [loadingReserva, setLoadingReserva] = useState(false);
  const [selectedMascotaIds, setSelectedMascotaIds] = useState([]);

  // Filtrar y ordenar proveedores basado en búsqueda y filtro seleccionado
  const filteredProviders = useMemo(() => {
    let filtered = providers;

    // Distancia a cada proveedor si tiene coordenadas y hay ubicación del usuario
    filtered = filtered.map(provider => {
      if (provider.latitude != null && provider.longitude != null && userLocation) {
        const distance = getDistanceFromUser(provider.latitude, provider.longitude);
        return { ...provider, distance };
      }
      return { ...provider, distance: null };
    });

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      filtered = filtered.filter(provider =>
        provider.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        provider.ubicacion.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Ordenar según el filtro seleccionado
    switch (selectedFilter) {
      case 'cercania':
        filtered = filtered.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1; // Sin distancia van al final
          if (b.distance === null) return -1;
          return a.distance - b.distance; // Ordenar de menor a mayor distancia
        });
        break;
      case 'mejor-calificacion':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'mejor-precio':
        filtered = filtered.sort((a, b) => {
          const precioA = parseInt(a.precio.replace(/[^0-9]/g, ''));
          const precioB = parseInt(b.precio.replace(/[^0-9]/g, ''));
          return precioA - precioB;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [searchText, selectedFilter, providers, userLocation, getDistanceFromUser]);

  const {
    paginaActual,
    totalPaginas,
    itemsActuales,
    manejarCambioPagina,
    reiniciarPagina,
  } = usePaginacion(filteredProviders);

  useEffect(() => {
    reiniciarPagina();
  }, [searchText, selectedFilter]);

  // Cambiar a filtro de cercanía cuando se active la ubicación
  useEffect(() => {
    if (isLocationEnabled && userLocation && selectedFilter !== 'cercania') {
      setSelectedFilter('cercania');
    }
  }, [isLocationEnabled, userLocation]);

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleFilterPress = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  const handleProviderPress = (provider) => {
    setSelectedProvider(provider);
    setShowDetalles(true);
  };

  const handleCloseDetalles = () => {
    setShowDetalles(false);
    setSelectedProvider(null);
  };

  const handleResenas = (provider) => {
    if (!provider) return;
    const isSelfPrestador =
      role === ROLES.PRESTADOR &&
      String(user?.prestadorId || '') === String(provider?.reviewedEntityId || provider?.id || '');

    if (isSelfPrestador) {
      Alert.alert('No disponible', 'No podés ver tus propias reseñas recibidas desde esta pantalla.');
      return;
    }

    navigation.navigate('ResenasRecibidas', {
      targetRole: provider?.reviewedRole || 'PRESTADOR',
      targetId: provider?.reviewedEntityId || provider?.id,
      targetName: provider?.nombre || 'Prestador',
    });
    handleCloseDetalles();
  };

  const enviarSolicitud = useCallback(async (provider, mascotaId) => {
    const duenioId = user?.duenioId ?? user?.id;
    const servicioId = provider?.servicioId ?? provider?.servicio?.id;
    if (!duenioId || !provider?.id || !servicioId) {
      Alert.alert('Error', 'Faltan datos para enviar la solicitud.');
      return;
    }
    setLoadingReserva(true);
    try {
      await createReserva({
        duenioId,
        prestadorId: provider.id,
        mascotaId,
        servicioId: String(servicioId),
      });
      setShowMascotaModal(false);
      setProviderToConnect(null);
      setSelectedMascotaIds([]);
      handleCloseDetalles();
      Alert.alert('Solicitud enviada', 'Tu solicitud fue enviada. Podés verla en Mis Conexiones.', [
        { text: 'OK', onPress: () => navigation.navigate('MisConexiones') },
      ]);
    } catch (err) {
      const msg = err?.message || 'No se pudo enviar la solicitud. Intentá de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingReserva(false);
    }
  }, [user, handleCloseDetalles, navigation]);

  const enviarSolicitudesMulti = useCallback(async (provider, mascotaIds) => {
    const duenioId = user?.duenioId ?? user?.id;
    const servicioId = provider?.servicioId ?? provider?.servicio?.id;
    if (!duenioId || !provider?.id || !servicioId || !mascotaIds?.length) {
      Alert.alert('Error', 'Faltan datos o no hay mascotas seleccionadas.');
      return;
    }
    setLoadingReserva(true);
    try {
      for (const mascotaId of mascotaIds) {
        await createReserva({
          duenioId,
          prestadorId: provider.id,
          mascotaId,
          servicioId: String(servicioId),
        });
      }
      setShowMascotaModal(false);
      setProviderToConnect(null);
      setSelectedMascotaIds([]);
      handleCloseDetalles();
      const msg = mascotaIds.length === 1
        ? 'Tu solicitud fue enviada. Podés verla en Mis Conexiones.'
        : `${mascotaIds.length} solicitudes enviadas. Podés verlas en Mis Conexiones.`;
      Alert.alert('Solicitud enviada', msg, [
        { text: 'OK', onPress: () => navigation.navigate('MisConexiones') },
      ]);
    } catch (err) {
      const msg = err?.message || 'No se pudo enviar la solicitud. Intentá de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingReserva(false);
    }
  }, [user, handleCloseDetalles, navigation]);

  const toggleMascotaSelection = useCallback((mascota) => {
    const id = String(mascota.id);
    setSelectedMascotaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleAvanzarMascotas = useCallback(() => {
    if (!providerToConnect || loadingReserva) return;
    if (selectedMascotaIds.length === 0) {
      Alert.alert('Seleccioná al menos una mascota', 'Elegí una o más mascotas para conectar con el prestador.');
      return;
    }
    enviarSolicitudesMulti(providerToConnect, selectedMascotaIds);
  }, [providerToConnect, loadingReserva, selectedMascotaIds, enviarSolicitudesMulti]);

  const handleConectar = useCallback(async (provider) => {
    if (!provider) return;
    const duenioId = user?.duenioId ?? user?.id;
    if (!duenioId) {
      Alert.alert('Error', 'Debés iniciar sesión como dueño para conectar.');
      handleCloseDetalles();
      return;
    }
    const servicioId = provider.servicioId ?? provider.servicio?.id;
    if (!servicioId) {
      Alert.alert('Error', 'Este prestador no tiene servicio disponible para conectar.');
      handleCloseDetalles();
      return;
    }
    const providerConServicio = { ...provider, servicioId: String(servicioId) };
    setLoadingMascotas(true);
    setProviderToConnect(providerConServicio);
    try {
      const res = await getMascotasByDuenio(duenioId);
      const lista = Array.isArray(res?.mascotas) ? res.mascotas : [];
      setMascotas(lista);
      if (lista.length === 0) {
        Alert.alert('Sin mascotas', 'Agregá al menos una mascota en Mis Mascotas para poder conectar.');
        setProviderToConnect(null);
      } else if (lista.length === 1) {
        await enviarSolicitud(providerConServicio, lista[0].id);
      } else {
        handleCloseDetalles();
        setSelectedMascotaIds([]);
        setTimeout(() => setShowMascotaModal(true), 350);
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'No se pudieron cargar tus mascotas. Revisá tu conexión.');
      setProviderToConnect(null);
    } finally {
      setLoadingMascotas(false);
    }
  }, [user, enviarSolicitud, handleCloseDetalles]);

  const closeMascotaModal = useCallback(() => {
    if (!loadingReserva) {
      setShowMascotaModal(false);
      setProviderToConnect(null);
      setSelectedMascotaIds([]);
    }
  }, [loadingReserva]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isEmptyCategory = providers.length === 0;
  const showEmptyState = itemsActuales.length === 0;

  const emptyMessage = isEmptyCategory
    ? (EMPTY_MESSAGES[providerType] || { title: 'No hay prestadores', subtitle: 'Vuelve más tarde.' })
    : { title: 'No hay resultados', subtitle: 'Prueba con otros términos de búsqueda.' };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <ScreenHeader
        title={screenTitle}
        subtitle={screenSubtitle}
        onBackPress={handleBackPress}
      />

      <BarraBuscador
        value={searchText}
        onChangeText={handleSearchChange}
        placeholder={`Buscar ${providerType}`}
        onFilterPress={handleFilterPress}
        filterIcon="menu-outline"
      />

      <Filtros
        filters={FILTROS_DATA}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        visible={showFilters}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {showEmptyState ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
            <Text style={styles.emptySubtitle}>{emptyMessage.subtitle}</Text>
          </View>
        ) : (
          <>
            {itemsActuales.map((provider) => (
              <ConexionCard
                key={provider.id}
                provider={provider}
                providerType={providerType}
                onPress={() => handleProviderPress(provider)}
                onRatingPress={provider?.reviewsCount > 0 ? handleResenas : undefined}
              />
            ))}
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onCambioPagina={manejarCambioPagina}
            />
          </>
        )}
      </ScrollView>
      
      <MenuInferior />

      <ConexionDetalles
        visible={showDetalles}
        provider={selectedProvider}
        providerType={providerType}
        onClose={handleCloseDetalles}
        onResenas={handleResenas}
        onConectar={handleConectar}
        loadingPrimary={loadingMascotas || loadingReserva}
        isAdmin={role === ROLES.ADMIN}
      />

      <Modal
        visible={showMascotaModal}
        transparent
        animationType="fade"
        onRequestClose={closeMascotaModal}
      >
        <TouchableOpacity
          style={styles.mascotaModalOverlay}
          activeOpacity={1}
          onPress={closeMascotaModal}
        >
          <TouchableOpacity style={styles.mascotaModalContent} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.mascotaModalTitle}>Elegí una o más mascotas</Text>
            {mascotas.map((m) => {
              const idStr = String(m.id);
              const isSelected = selectedMascotaIds.includes(idStr);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.mascotaModalItem, isSelected && styles.mascotaModalItemSelected]}
                  onPress={() => toggleMascotaSelection(m)}
                  disabled={loadingReserva}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mascotaModalItemText}>{m.nombre} {m.tipo ? `(${m.tipo})` : ''}</Text>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isSelected ? colors.primary : colors.border.medium}
                  />
                </TouchableOpacity>
              );
            })}
            {loadingReserva && (
              <View style={styles.mascotaModalLoading}>
                <ActivityIndicator size="small" />
              </View>
            )}
            <TouchableOpacity
              style={[styles.mascotaModalAvanzar, selectedMascotaIds.length === 0 && styles.mascotaModalAvanzarDisabled]}
              onPress={handleAvanzarMascotas}
              disabled={loadingReserva || selectedMascotaIds.length === 0}
            >
              <Text style={styles.mascotaModalAvanzarText}>
                Avanzar {selectedMascotaIds.length > 0 ? `(${selectedMascotaIds.length})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mascotaModalCancel} onPress={closeMascotaModal} disabled={loadingReserva}>
              <Text style={styles.mascotaModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PrestadorServiciosScreen;
