import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles';
import GuardarCancelarBtn from '../buttons/GuardarCancelarBtn';
import EstadosChip from '../EstadosChip';
import MenuActions from '../MenuActions';
import { useConexionDetalles } from '../../hooks/useConexionDetalles';
import { useLocation } from '../../contexts';
import { styles } from './ConexionDetalles.styles';

const ConexionDetalles = ({ 
  provider, 
  onClose,
  onResenas,
  onConectar,
  misConexiones = false, 
  esVistaPrestador = false,
  onChat,
  onPago,
  onFinalizarServicio,
  onAgregarResena,
  onRechazar,
  loadingPrimary = false,
}) => {
  const { formatDistance } = useLocation();
  
  const {
    scrollViewRef,
    providerInfo,
    isValidProvider,
    buttonConfig,
    ratingStars,
    modalProps,
    providerTypeText,
    sectionConfig,
    steps,
    createActionHandlers,
    getMenuItems
  } = useConexionDetalles(provider, misConexiones, onClose, esVistaPrestador);

  const actionHandlers = createActionHandlers({
    onResenas,
    onConectar,
    onChat,
    onPago,
    onFinalizarServicio,
    onAgregarResena,
    onRechazar
  });

  const menuItems = getMenuItems(actionHandlers);

  if (!isValidProvider) return null;

  const {
    nombre,
    ubicacion,
    precio,
    horario,
    disponibilidad,
    descripcion,
    descripcionDuenio,
    mascota,
    mascotas,
    estado,
    distance,
  } = providerInfo;

  const tieneDescripcionEstructurada = descripcionDuenio || mascota || (mascotas && mascotas.length > 0);
  const mascotasList = (mascotas && mascotas.length > 0) ? mascotas : (mascota ? [mascota] : []);

  return (
    <Modal {...modalProps} style={styles.modalContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          
          <View style={styles.headerInfo}>
            <View style={styles.nameAndStatusRow}>
              <Text style={styles.nombre}>{nombre}</Text>
              {misConexiones && <EstadosChip estado={estado} showIcon={true} iconSize={14} />}
            </View>
            <View style={styles.ratingContainer}>
              {ratingStars.map((star) => (
                <Ionicons
                  key={star.key}
                  name={star.filled ? "star" : "star-outline"}
                  size={16}
                  color={star.filled ? colors.warning : colors.border.medium}
                />
              ))}
            </View>
            <View style={styles.ubicacionRow}>
              <Text style={styles.ubicacion}>{ubicacion}</Text>
              {distance !== null && distance !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate" size={12} color="#f5a3c1ff" />
                  <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
                </View>
              )}
            </View>
            {misConexiones && !esVistaPrestador && mascota?.nombre ? (
              <Text style={styles.reservaPara}>
                Para: {mascota.nombre}
                {(mascota.tipo || mascota.raza) ? ` (${[mascota.tipo, mascota.raza].filter(Boolean).join(', ')})` : ''}
              </Text>
            ) : null}
          </View>
          
          <View style={styles.headerActions}>
            <MenuActions items={menuItems} />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          persistentScrollbar={true}
        >

          {!esVistaPrestador && (
            <SectionContainer title="Precio y horarios">
              <ContactItem 
                iconName="cash-outline" 
                text={precio} 
              />
              <ContactItem 
                iconName="time-outline" 
                text={horario} 
              />
              <ContactItem 
                iconName="calendar-outline" 
                text={disponibilidad} 
              />
            </SectionContainer>
          )}

          {(tieneDescripcionEstructurada && !(misConexiones && !esVistaPrestador)) ? (
            <>
              {descripcionDuenio ? (
                <SectionContainer title={`Sobre el ${providerTypeText}`}>
                  <Text style={styles.descripcion}>{descripcionDuenio}</Text>
                </SectionContainer>
              ) : null}
              {(mascota || (mascotas && mascotas.length > 0)) ? (
                <SectionContainer title={mascotasList.length > 1 ? 'Mascotas' : 'Mascota'}>
                  <View style={styles.mascotaList}>
                    {mascotasList.map((m, index) => (
                      <MascotaBlock key={m.id || m.nombre || index} mascota={m} />
                    ))}
                  </View>
                </SectionContainer>
              ) : null}
            </>
          ) : (
            <SectionContainer title={`Sobre el ${providerTypeText}`}>
              <Text style={styles.descripcion}>{descripcionDuenio || descripcion}</Text>
            </SectionContainer>
          )}

          {/* Solo mostrar si NO es Mis Conexiones */}
          {sectionConfig.showSteps && (
            <SectionContainer title="Pasos a seguir:">
              {steps.map((step, index) => (
                <StepItem 
                  key={index}
                  number={step.number} 
                  text={step.text} 
                />
              ))}
            </SectionContainer>
          )}

          {sectionConfig.showWarning && (
            <View style={styles.warningContainer}>
              <View style={styles.warningHeader}>
                <Text style={styles.warningIcon}>{sectionConfig.warningIcon}</Text>
                <Text style={styles.warningTitle}>{sectionConfig.warningTitle}</Text>
              </View>
              <View style={styles.warningContent}>
                {sectionConfig.warningItems.map((item, index) => (
                  <Text key={index} style={styles.warningText}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.actionsContainer}>
          <GuardarCancelarBtn
            label={buttonConfig.primary.label}
            onPress={() => {
              const fn = actionHandlers[buttonConfig.primary.action];
              if (typeof fn === 'function') fn();
            }}
            loading={loadingPrimary}
            variant={buttonConfig.primary.variant}
            showCancel={buttonConfig.secondary?.showCancel || false}
            cancelLabel={buttonConfig.secondary?.label}
            onCancel={buttonConfig.secondary ? actionHandlers[buttonConfig.secondary.action] : undefined}
          />
        </View>
      </View>
    </Modal>
  );
};

const SectionContainer = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ContactItem = ({ iconName, text }) => (
  <View style={styles.contactItem}>
    <Ionicons name={iconName} size={20} color={colors.primaryDark} />
    <Text style={styles.contactText}>{text}</Text>
  </View>
);

const StepItem = ({ number, text }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const MascotaRow = ({ label, value }) => (
  <View style={styles.mascotaRow}>
    <Text style={styles.mascotaLabel}>{label}:</Text>
    <Text style={styles.mascotaValue}>{value}</Text>
  </View>
);

const MascotaBlock = ({ mascota }) => {
  const nombre = mascota?.nombre != null && mascota.nombre !== '' ? mascota.nombre : 'Sin nombre';
  const tipo = mascota?.tipo != null && mascota.tipo !== '' ? mascota.tipo : null;
  const titulo = tipo ? `${nombre} (${tipo})` : nombre;
  return (
    <View style={styles.mascotaBlock}>
      <View style={styles.mascotaBlockHeader}>
        <Text style={styles.mascotaBlockEmoji}>🐾</Text>
        <Text style={styles.mascotaBlockTitle}>{titulo}</Text>
      </View>
      <View style={styles.mascotaBlockContent}>
        {mascota?.raza != null && mascota.raza !== '' && (
          <MascotaRow label="Raza" value={mascota.raza} />
        )}
        {mascota?.edad != null && mascota.edad !== '' && (
          <MascotaRow
            label="Edad"
            value={mascota.edadUnidad ? `${mascota.edad} ${mascota.edadUnidad}` : String(mascota.edad)}
          />
        )}
        {mascota?.infoAdicional != null && mascota.infoAdicional !== '' && (
          <MascotaRow label="Información adicional" value={mascota.infoAdicional} />
        )}
        {mascota?.condiciones != null && mascota.condiciones !== '' && (
          <MascotaRow label="Condiciones" value={mascota.condiciones} />
        )}
      </View>
    </View>
  );
};

export default ConexionDetalles;
