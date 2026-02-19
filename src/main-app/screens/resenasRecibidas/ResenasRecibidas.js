import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenHeader, MenuInferior } from '../../components';
import ResenaCard from '../../components/ResenaCard';
import { useAuth } from '../../contexts';
import { ROLES } from '../../constants/roles';
import { getResenasRecibidas } from '../../services';
import { styles } from './ResenasRecibidas.styles';

const ResenasRecibidas = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, role } = useAuth();
  const { targetRole, targetId, targetName } = route.params || {};

  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSelfTarget = useMemo(() => {
    if (!targetRole || !targetId) return false;
    const roleUpper = String(targetRole).toUpperCase();
    if (roleUpper === 'PRESTADOR' && role === ROLES.PRESTADOR) {
      return String(user?.prestadorId || '') === String(targetId);
    }
    if (roleUpper === 'DUENIO' && role === ROLES.DUENIO) {
      return String(user?.duenioId || '') === String(targetId);
    }
    return false;
  }, [targetRole, targetId, role, user]);

  useEffect(() => {
    const load = async () => {
      if (!targetRole || !targetId || isSelfTarget) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getResenasRecibidas({
          targetRole,
          targetId,
        });
        const list = Array.isArray(response?.resenas) ? response.resenas : [];
        const mapped = list.map((item) => ({
          id: item.id,
          usuario: item.autor || { nombre: 'Usuario', avatar: null },
          rating: Number(item.rating || 0),
          texto: item.texto || '',
          fecha: item.fecha,
          tipo: String(targetRole || '').toLowerCase(),
        }));
        setResenas(mapped);
      } catch (err) {
        setResenas([]);
        setError(err?.message || 'No pudimos cargar las reseñas.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [targetRole, targetId, isSelfTarget]);

  const handleBackPress = () => navigation.goBack();

  const subtitle = targetName
    ? `Comentarios que recibió ${targetName}`
    : 'Comentarios y calificaciones recibidas';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Reseñas recibidas"
        subtitle={subtitle}
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      {isSelfTarget ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Esta pantalla solo está disponible para otros usuarios.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.emptyText}>Cargando reseñas...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {resenas.length > 0 ? (
            resenas.map((resena) => <ResenaCard key={resena.id} resena={resena} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error || 'Este usuario todavía no recibió reseñas.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <MenuInferior />
    </SafeAreaView>
  );
};

export default ResenasRecibidas;
