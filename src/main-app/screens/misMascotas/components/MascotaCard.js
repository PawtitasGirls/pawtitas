import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../../../shared/styles';
import MenuActions from '../../../components/MenuActions';

// Componente para mostrar una tarjeta de mascota individual
const MascotaCard = ({ mascota, onPress, onDelete }) => {
  
  const {
    avatarUri,
    nombre, 
    especie, 
    raza, 
    edad, 
    edadUnidad = 'años',
    infoAdicional, 
    condicionEspecial
  } = mascota;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H2',location:'MascotaCard.js:render',message:'Render mascota card',data:{hasAvatarUri:Boolean(avatarUri),avatarUriPrefix:(avatarUri || '').slice(0,12)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // Formateamos el tipo combinando especie y raza
  const tipo = `${especie}${raza ? ' ' + raza : ''}`;
  
  // Formateamos la edad con su unidad
  const formatearEdad = (edad, unidad) => {
    if (unidad === 'meses') {
      return edad === 1 ? `${edad} mes` : `${edad} meses`;
    } else {
      return edad === 1 ? `${edad} año` : `${edad} años`;
    }
  };

  // Menú
  const menuItems = [
    {
      text: 'Editar',
      icon: 'pencil-outline',
      onPress: onPress,
    },
    {
      text: 'Eliminar',
      icon: 'trash-outline',
      iconColor: colors.error,
      textStyle: { color: colors.error },
      onPress: onDelete,
    },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              avatarUri={avatarUri}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="paw" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.nombre}>{nombre}</Text>
            <MenuActions items={menuItems} />
          </View>
          
          <Text style={styles.tipoEdad}>
            {tipo}, {formatearEdad(edad, edadUnidad)}
          </Text>
          
          <Text style={styles.descripcion} numberOfLines={5}>
            {infoAdicional}
          </Text>
          
          {condicionEspecial && (
            <View style={styles.condicionContainer}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
              <Text style={styles.condicionText}>{condicionEspecial}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nombre: {
    ...typography.styles.h3,
    color: colors.text.primary,
    flex: 1,
  },
  tipoEdad: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  descripcion: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  condicionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  condicionText: {
    ...typography.styles.caption,
    color: colors.warning,
    marginLeft: 4,
  },
});

export default MascotaCard;
