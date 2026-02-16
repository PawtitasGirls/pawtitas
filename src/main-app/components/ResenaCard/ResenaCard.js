import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles';
import { styles } from './ResenaCard.styles';

// Componente para mostrar una tarjeta de reseña
const ResenaCard = ({ resena }) => {
  const { 
    id,
    usuario,
    rating,
    texto,
    fecha,
    tipo
  } = resena;
  
  // Obtener el texto del tipo de prestador
  const getProviderTypeText = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const providerTypeText = getProviderTypeText(tipo);
  
  // Renderizar estrellas de calificación
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= maxStars; i++) {
      let starName = "star-outline";
      
      if (i <= fullStars) {
        starName = "star";
      } else if (i === fullStars + 1 && hasHalfStar) {
        starName = "star-half";
      }
      
      stars.push(
        <Ionicons
          key={i}
          name={starName}
          size={16}
          color={i <= fullStars || (i === fullStars + 1 && hasHalfStar) ? colors.warning : colors.border.medium}
        />
      );
    }
    
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            
            <View style={styles.nameContainer}>
              <Text style={styles.nombreUsuario}>{usuario?.nombre || 'Usuario'}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(Number(rating || 0))}
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.textoResena} numberOfLines={5}>
          {texto}
        </Text>
        
        <View style={styles.footerRow}>
          {fecha && (
            <Text style={styles.fecha}>
              {formatDate(fecha)}
            </Text>
          )}
          {providerTypeText && (
            <View style={styles.providerTypeContainer}>
              <Text style={styles.providerTypeText}>{providerTypeText}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ResenaCard;
