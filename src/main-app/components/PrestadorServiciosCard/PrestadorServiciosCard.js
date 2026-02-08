import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles';
import EstadosChip from '../EstadosChip';
import { useLocation } from '../../contexts';
import { styles } from './PrestadorServiciosCard.styles';

// Componente reutilizable para mostrar una tarjeta de prestador de servicio (cuidador, paseador o veterinario)
const PrestadorServiciosCard = ({ provider, onPress, providerType, misConexiones = false }) => {
  const { formatDistance } = useLocation();
  
  const { 
    id,
    nombre, 
    rating,
    descripcion,
    precio,
    ubicacion,
    disponibilidad,
    horario,
    estado,
    tipo,
    distance,
    mascota,
  } = provider;
  
  const getProviderTypeText = (type) => {
    if (!type && providerType) {
      return providerType.charAt(0).toUpperCase() + providerType.slice(1);
    }
    if (type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
    return '';
  };

  const providerTypeText = getProviderTypeText(tipo);
  
  // Renderizar estrellas de calificación
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? colors.warning : colors.border.medium}
        />
      );
    }
    
    return stars;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            
            <View style={styles.nameContainer}>
              <View style={styles.nameAndStatusRow}>
                <Text style={styles.nombre}>{nombre}</Text>
                {misConexiones && <EstadosChip estado={estado} showIcon={true} iconSize={14} />}
              </View>
              {misConexiones && mascota?.nombre ? (
                <Text style={styles.mascotaPara}>
                  Para: {mascota.nombre}
                  {(mascota.tipo || mascota.raza) ? ` (${[mascota.tipo, mascota.raza].filter(Boolean).join(', ')})` : ''}
                </Text>
              ) : null}
              <View style={styles.ratingContainer}>
                {renderStars(rating)}
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.arrowButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.descripcion} numberOfLines={3}>
          {descripcion}
        </Text>
        
        {tipo !== 'dueño' && (
          <View style={styles.infoRow}>
            <Text style={styles.precio}>{precio}</Text>
          </View>
        )}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{ubicacion}</Text>
            {distance !== null && distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
              </View>
            )}
          </View>
          
          {tipo !== 'dueño' && (
            <>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.detailText}>{disponibilidad}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.detailText}>{horario}</Text>
              </View>
            </>
          )}
        </View>
        
        {misConexiones && providerTypeText && (
          <View style={styles.footerRow}>
            <View style={styles.providerTypeContainer}>
              <Text style={styles.providerTypeText}>{providerTypeText}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PrestadorServiciosCard;
