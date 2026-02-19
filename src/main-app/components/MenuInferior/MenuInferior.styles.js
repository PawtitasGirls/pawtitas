import { StyleSheet } from 'react-native';
import { colors } from '../../../shared/styles';

// Estilos para el componente MenuInferior
export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '95%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  activeNavItem: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  navText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
    color: colors.text.primary,
  },
  activeText: {
    color: colors.navigation.active,
    fontWeight: '600',
  },
  inactiveText: {
    color: colors.navigation.inactive,
  },
  chatIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#e53935',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export const getContainerStyle = (bottomInset) => ({
  paddingBottom: bottomInset + 8,
});

export const navColors = {
  active: colors.navigation.active,
  inactive: colors.navigation.inactive,
};

export default styles;

