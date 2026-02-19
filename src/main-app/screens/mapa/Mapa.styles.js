import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../shared/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  map: {
    flex: 1,
  },

  // Barra de búsqueda
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },

  // Resultados de búsqueda
  searchResults: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  compassButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  compassButtonDisabled: {
    opacity: 0.6,
  },
  compassIcon: {},

  // Botones de POIs
  poiButtonsContainer: {
    position: 'absolute',
    top: 120,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 5,
  },
  poiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  poiButtonActive: {
    backgroundColor: '#f5a3c1ff',
    borderColor: '#f5a3c1ff',
  },
  poiButtonText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  poiButtonTextActive: {
    color: '#fff',
  },

  // Información de ruta
  routeInfoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 15,
    right: 80,
    zIndex: 5,
  },
  routeInfoContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  routeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeProfileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  routeCloseButton: {
    padding: 8,
  },

  // Botón de ubicación actual
  locationButton: {
    position: 'absolute',
    bottom: 110,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  // Atribución OSM
  attribution: {
    position: 'absolute',
    bottom: 85,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: '85%',
  },
  attributionText: {
    fontSize: 10,
    color: '#666',
  },
  attributionDisclaimerText: {
    marginTop: 2,
    fontSize: 10,
    color: '#666',
    lineHeight: 13,
  },
});

const ANDROID_ATTRIBUTION_OFFSET = 70;

export const getAttributionStyle = (bottomInset) => ({
  ...(Platform.OS !== 'ios' && {
    bottom: bottomInset + 90,
    left: ANDROID_ATTRIBUTION_OFFSET,
    right: undefined,
    alignItems: 'flex-start',
  }),
});

export default styles;

