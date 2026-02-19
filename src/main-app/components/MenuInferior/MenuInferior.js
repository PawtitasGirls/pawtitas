import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, getContainerStyle } from './MenuInferior.styles';
import { colors } from '../../../shared/styles';
import { useAuth, useStreamChat } from '../../contexts';
import { isRouteAllowed, ROLES } from '../../constants/roles';

const MenuInferior = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const { totalUnreadCount = 0 } = useStreamChat();
  const estadoPrestador = String(user?.estadoPrestador || '').toUpperCase();
  const isPrestadorPendiente =
    role === ROLES.PRESTADOR && estadoPrestador === 'PENDIENTE';
  
  // Configuración de las rutas de navegación
  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home-sharp', route: 'Home' },
    { name: 'Mapa', icon: 'location-outline', activeIcon: 'location-sharp', route: 'Mapa' },
    { name: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', route: 'Chat' },
    { name: 'Perfil', icon: 'person-outline', activeIcon: 'person-sharp', route: 'Perfil' },
  ];

  // Navega a la ruta
  const navigateTo = (routeName) => {
    if (route.name !== routeName) {
      navigation.navigate(routeName);
    }
  };

  const visibleItems = navItems.filter((item) => {
    if (!isRouteAllowed(role, item.route)) return false;
    if (isPrestadorPendiente && item.route === 'Chat') return false;
    return true;
  });

  return (
    <View style={[styles.container, getContainerStyle(insets.bottom)]}>
      <View style={styles.navBar}>
        {visibleItems.map((item) => {
          const isActive = route.name === item.route;
          const isChat = item.route === 'Chat';
          const showBadge = isChat && totalUnreadCount > 0 && !isActive;
          const badgeLabel = totalUnreadCount > 99 ? '99+' : String(totalUnreadCount);
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => navigateTo(item.route)}
              accessibilityLabel={item.name}
              accessibilityRole="button"
            >
              <View style={isChat ? styles.chatIconWrapper : undefined}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? colors.navigation.active : colors.navigation.inactive}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeLabel}</Text>
                  </View>
                )}
              </View>
              {isActive && (
                <Text style={[styles.navText, styles.activeText]}>
                  {item.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MenuInferior;

