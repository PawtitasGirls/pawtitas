import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './perfil.styles';
import { colors } from '../../../shared/styles';
import { PerfilHeader, MenuInferior } from '../../components';
import { PerfilInfoCard, MascotasSection, LogoutBtn, SettingsMenu, SupportService } from './components';
import { useAuth } from '../../contexts';
import { ROLES } from '../../constants/roles';
import { clearAuthToken } from '../../services';

const formatDate = (value) => {
  if (!value) return 'Pendiente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pendiente';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const buildFullName = (user) => {
  const full = [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim();
  return full || user?.name || 'Usuario';
};

const buildLocation = (user) => {
  if (!user) return 'Pendiente';
  if (user.domicilio) {
    const { calle, numero, ciudad } = user.domicilio;
    const calleNumero = [calle, numero].filter(Boolean).join(' ');
    return ciudad ? `${calleNumero}, ${ciudad}` : calleNumero || 'Pendiente';
  }
  return user.ubicacion || 'Pendiente';
};

const roleLabelByRole = (role) => {
  if (role === ROLES.DUENIO) return 'Dueño de mascota';
  if (role === ROLES.PRESTADOR) return 'Prestador de servicios';
  if (role === ROLES.ADMIN) return 'Administrador';
  return 'Usuario';
};

const PerfilScreen = () => {
  const navigation = useNavigation();
  const { user, role, clearAuth } = useAuth();

  const userProfile = useMemo(() => {
    if (!user) {
      return {
        id: null,
        avatarUri: null,
        name: 'Usuario',
        email: '',
        phone: '',
        location: 'Pendiente',
        role: roleLabelByRole(role),
        rating: 0,
        description: 'Sin descripción',
        registrationDate: 'Pendiente',
        petsCount: 0,
      };
    }

    return {
      id: user.id,
      avatarUri: user.avatar || null,
      name: buildFullName(user),
      email: user.email || '',
      phone: user.celular || user.telefono || '',
      location: buildLocation(user),
      role: roleLabelByRole(role),
      rating: user.rating ?? 0,
      description: user.descripcion || 'Sin descripción',
      registrationDate: formatDate(user.creadoEn),
      petsCount: user.petsCount ?? 0,
    };
  }, [user, role]);

  // Acciones del usuario
  const handleEditProfile = () => {
    navigation.navigate('EditarPerfil', { role });
  };

  const handleNavigateToPets = () => {
    navigation.navigate('MisMascotas');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            clearAuth();
            clearAuthToken();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Inicio' }],
            });
          }
        }
      ]
    );
  };

  const handleSupport = () => {
    SupportService.contactEmail();
  };

  const handleSettingsMenu = () => {
    SettingsMenu.showMainMenu(handleSupport);
  };

  return (
    <View style={styles.container}>
      <PerfilHeader
        title="PERFIL"
        rightComponent={
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={colors.brand.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PerfilInfoCard
          user={userProfile}
          onEdit={handleEditProfile}
          role={role}
        />

        {role === ROLES.DUENIO && (
          <MascotasSection
            petsCount={userProfile.petsCount}
            description={userProfile.petsDescription}
            onPress={handleNavigateToPets}
          />
        )}

        <LogoutBtn onPress={handleLogout} />
      </ScrollView>

      <MenuInferior />
    </View>
  );
};

export default PerfilScreen;
