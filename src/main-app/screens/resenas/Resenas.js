import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader, MenuInferior, BarraBuscador, Paginador, useNavbarHeight } from '../../components';
import ResenaCard from '../../components/ResenaCard';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useAuth } from '../../contexts';
import { ROLES } from '../../constants/roles';
import { getMisResenas } from '../../services';
import { styles } from './Resenas.styles';

// Pantalla de Mis Reseñas
const Resenas = () => {
  const navigation = useNavigation();
  const navbarHeight = useNavbarHeight();
  const { user, role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roleApi = useMemo(() => {
    if (role === ROLES.DUENIO) return 'DUENIO';
    if (role === ROLES.PRESTADOR) return 'PRESTADOR';
    return null;
  }, [role]);

  const roleEntityId = useMemo(() => {
    if (role === ROLES.DUENIO) return user?.duenioId || null;
    if (role === ROLES.PRESTADOR) return user?.prestadorId || null;
    return null;
  }, [role, user]);

  const loadMisResenas = useCallback(async () => {
    if (!roleApi || !roleEntityId) {
      setResenas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getMisResenas({
        role: roleApi,
        userId: roleEntityId,
      });
      setResenas(Array.isArray(response?.resenas) ? response.resenas : []);
    } catch (err) {
      setResenas([]);
      setError(err?.message || 'No pudimos cargar tus reseñas.');
    } finally {
      setLoading(false);
    }
  }, [roleApi, roleEntityId]);

  useEffect(() => {
    loadMisResenas();
  }, [loadMisResenas]);

  const filteredResenas = useMemo(() => {
    let filtered = [...resenas];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((resena) =>
        (resena?.usuario?.nombre || '').toLowerCase().includes(query) ||
        (resena?.texto || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [resenas, searchQuery]);

  const {
    paginaActual,
    totalPaginas,
    itemsActuales: resenasActuales,
    manejarCambioPagina,
    reiniciarPagina,
  } = usePaginacion(filteredResenas);

  useEffect(() => {
    reiniciarPagina();
  }, [searchQuery, reiniciarPagina]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Mis Reseñas"
        subtitle="Revisa las reseñas que compartiste en tu experiencia"
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      <BarraBuscador
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por usuario o comentario"
      />

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.emptyText}>Cargando tus reseñas...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: navbarHeight }}>
          {resenasActuales.length > 0 ? (
            <>
              {resenasActuales.map((resena) => (
                <ResenaCard key={resena.id} resena={resena} />
              ))}
              {filteredResenas.length > 0 && (
                <Paginador
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  onCambioPagina={manejarCambioPagina}
                />
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error
                  ? error
                  : resenas.length === 0
                    ? 'Todavía no dejaste reseñas. Cuando completes tus servicios, podrás verlas acá.'
                    : 'No se encontraron reseñas con el criterio de búsqueda. Volver a intentarlo con otro criterio.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <MenuInferior />
    </SafeAreaView>
  );
};

export default Resenas;