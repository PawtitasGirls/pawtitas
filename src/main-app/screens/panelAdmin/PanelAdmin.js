import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, MenuInferior, BarraBuscador, Filtros, Paginador } from '../../components';
import { UsuarioCard } from './components';
import { ESTADOS_USUARIO } from '../../constants/estadosUsuario';
import { usePaginacion } from '../../hooks/usePaginacion';
import { getPrestadores, updatePrestadorEstado } from '../../services';
import { styles } from './PanelAdmin.styles';
import ValidarUsuario from './ValidarUsuario';

const PanelAdmin = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPrestadores();
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        setUsers(data.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          nombreApellido: u.nombre,
          email: u.email,
          telefono: u.telefono,
          ubicacion: u.ubicacion,
          perfil: u.perfil,
          estado: u.estado,
          fechaRegistro: u.fechaRegistro,
          descripcion: u.descripcion ?? '',
          motivoRechazo: u.motivoRechazo,
        })));
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Error al cargar prestadores');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Calcular estadísticas
  const statistics = useMemo(() => {
    const activados = users.filter(user => user.estado === ESTADOS_USUARIO.ACTIVADO).length;
    const pendientes = users.filter(user => user.estado === ESTADOS_USUARIO.PENDIENTE).length;
    const desactivados = users.filter(user => user.estado === ESTADOS_USUARIO.DESACTIVADO).length;
    const total = users.length;

    return { activados, pendientes, desactivados, total };
  }, [users]);

  // Filtrar usuarios según búsqueda y filtro seleccionado
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.perfil.toLowerCase().includes(query)
      );
    }

    // Filtrar por estado
    if (selectedFilter !== 'todos') {
      filtered = filtered.filter(user => 
        user.estado.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    return filtered;
  }, [users, searchQuery, selectedFilter]);

  const {
    paginaActual,
    totalPaginas,
    itemsActuales: usuariosActuales,
    manejarCambioPagina,
    reiniciarPagina,
  } = usePaginacion(filteredUsers);

  useEffect(() => {
    reiniciarPagina();
  }, [searchQuery, selectedFilter]);

  // Manejar navegación hacia atrás
  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  // Manejar selección de usuario
  const handleUserPress = (user) => {
    setSelectedUser(user);
    setIsBottomSheetVisible(true);
  };

  // Cerrar el bottom sheet
  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;
    try {
      await updatePrestadorEstado(selectedUser.id, { estado: 'ACTIVO' });
      const next = { ...selectedUser, estado: ESTADOS_USUARIO.ACTIVADO };
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? next : u))
      );
      setSelectedUser(next);
    } catch (e) {
      alert(e?.message ?? 'Error al activar');
    }
  };

  const handleDeactivateUser = async (motivoRechazo) => {
    if (!selectedUser) return;
    try {
      await updatePrestadorEstado(selectedUser.id, { estado: 'RECHAZADO', motivoRechazo });
      const next = { 
        ...selectedUser, 
        estado: ESTADOS_USUARIO.DESACTIVADO,
        motivoRechazo: motivoRechazo?.trim?.() || null,
      };
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? next : u))
      );
      setSelectedUser(next);
    } catch (e) {
      alert(e?.message ?? 'Error al desactivar');
    }
  };

  // Manejar búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Manejar filtro
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };

  // Renderizar un ítem de usuario
  const renderUser = ({ item }) => (
    <UsuarioCard 
      user={item} 
      onPress={() => handleUserPress(item)}
      onStatusChange={() => handleUserPress(item)}
    />
  );

  // Renderizar separador entre usuarios
  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con ScreenHeader */}
      <ScreenHeader 
        title="Panel de Administrador"
        subtitle="Revisá la documentación del usuario para activar o desactivar el perfil."
        onBackPress={handleBackPress}
        showBackButton={true}
      />
      
      {/* Barra de búsqueda */}
      <BarraBuscador
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Buscar usuarios"
        onFilterPress={() => setShowFilters(!showFilters)}
        filterIcon="menu-outline"
      />

      {/* Filtros */}
      <Filtros
        filters={[
          { key: 'todos', label: 'Todos' },
          { key: 'activado', label: 'Activados' },
          { key: 'pendiente', label: 'Pendientes' },
          { key: 'desactivado', label: 'Desactivados' }
        ]}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        visible={showFilters}
      />

      {/* Tarjeta de estadísticas */}
      <View style={styles.statsTabContainer}>
        <View style={styles.statsTab}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.activados}</Text>
            <Text style={styles.statLabel}>Activados</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.desactivados}</Text>
            <Text style={styles.statLabel}>Desactivados</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Lista de usuarios */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Cargando prestadores</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={usuariosActuales}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={renderSeparator}
            showsVerticalScrollIndicator={false}
            bounces={true}
            ListFooterComponent={() => (
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambioPagina={manejarCambioPagina}
              />
            )}
          />
        )}
      </View>
      
      {/* Bottom Sheet para validar usuario */}
      <ValidarUsuario
        isVisible={isBottomSheetVisible}
        onClose={handleCloseBottomSheet}
        usuario={selectedUser}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
      />
      
      {/* Navegación inferior */}
      <MenuInferior />
    </SafeAreaView>
  );
};

export default PanelAdmin;