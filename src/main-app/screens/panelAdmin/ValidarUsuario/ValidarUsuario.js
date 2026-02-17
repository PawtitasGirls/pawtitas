import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { styles } from './ValidarUsuario.styles';
import { colors } from '../../../../shared/styles';
import { ESTADOS_USUARIO, ESTADOS_USUARIO_CONFIG } from '../../../constants/estadosUsuario';
import GuardarCancelarBtn from '../../../components/buttons/GuardarCancelarBtn';
import { getPrestadorAttachments } from '../../../services';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '';

const ValidarUsuario = ({ 
  isVisible, 
  onClose, 
  usuario, 
  onActivate, 
  onDeactivate 
}) => {
  const [motivoRechazo, setMotivoRechazo] = useState(usuario?.motivoRechazo || '');
  const [isConfirmingDeactivation, setIsConfirmingDeactivation] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && usuario) {
      setMotivoRechazo(usuario?.motivoRechazo || '');
      setIsConfirmingDeactivation(false);
      if (Array.isArray(usuario.attachments) && usuario.attachments.length > 0) {
        setAttachments(usuario.attachments);
        setAttachmentsLoading(false);
      } else {
        setAttachments([]);
      }
    }
  }, [usuario, isVisible]);

  useEffect(() => {
    let cancelled = false;
    if (!isVisible || !usuario?.prestadorId) {
      if (!Array.isArray(usuario?.attachments) || !usuario.attachments.length) setAttachments([]);
      return;
    }
    if (Array.isArray(usuario.attachments) && usuario.attachments.length > 0) {
      setAttachments(usuario.attachments);
      return;
    }
    setAttachmentsLoading(true);
    getPrestadorAttachments(usuario.prestadorId)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setAttachments(list);
      })
      .catch(() => {
        if (!cancelled) setAttachments([]);
      })
      .finally(() => {
        if (!cancelled) setAttachmentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [isVisible, usuario?.prestadorId, usuario?.attachments]);

  // Si no hay usuario, no renderizamos
  if (!usuario) return null;

  const handleDesactivarClick = () => {
    setIsConfirmingDeactivation(true);
  };

  const handleCancelarDesactivacion = () => {
    setIsConfirmingDeactivation(false);
    setMotivoRechazo(usuario?.motivoRechazo || '');
  };

  const handleConfirmarDesactivacion = () => {
    onDeactivate(motivoRechazo);
    setIsConfirmingDeactivation(false);
  };

  const getStatusStyle = (estado) => {
    if (!estado) return {
      badge: styles.statusBadge,
      text: styles.statusText
    };
    
    switch (estado) {
      case ESTADOS_USUARIO.ACTIVADO:
        return {
          badge: styles.activeStatus,
          text: styles.activeStatusText
        };
      case ESTADOS_USUARIO.PENDIENTE:
        return {
          badge: styles.pendingStatus,
          text: styles.pendingStatusText
        };
      case ESTADOS_USUARIO.DESACTIVADO:
        return {
          badge: styles.inactiveStatus,
          text: styles.inactiveStatusText
        };
      default:
        return {
          badge: styles.statusBadge,
          text: styles.statusText
        };
    }
  };

  const getStatusLabel = (estado) => {
    return ESTADOS_USUARIO_CONFIG[estado]?.label || estado;
  };

  const formatDate = (fecha) => {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const statusStyle = getStatusStyle(usuario.estado);

  const pdfAttachments = attachments.filter(
    (a) => (a.mimeType || '').toLowerCase().includes('pdf')
  );
  const imageAttachments = attachments.filter(
    (a) => (a.mimeType || '').toLowerCase().match(/^image\/(jpeg|jpg|png|gif|webp)$/)
  );
  const otherAttachments = attachments.filter(
    (a) => !(a.mimeType || '').toLowerCase().includes('pdf') &&
      !(a.mimeType || '').toLowerCase().match(/^image\/(jpeg|jpg|png|gif|webp)$/)
  );
  const allDisplayAttachments = [...pdfAttachments, ...imageAttachments, ...otherAttachments];

  const handleOpenAttachment = (downloadUrl) => {
    if (!downloadUrl) return;
    try {
      const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE}${downloadUrl}`;
      Linking.openURL(fullUrl);
    } catch (e) {
      // noop
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modalContainer}
      propagateSwipe={true}
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop={true}
      avoidKeyboard={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Detalles del Usuario</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre y Apellido:</Text>
              <Text style={styles.value}>{usuario.nombreApellido || usuario.nombre || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{usuario.email || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{usuario.telefono || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.value}>{usuario.ubicacion || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Perfil:</Text>
              <Text style={styles.value}>{usuario.perfil || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Estado:</Text>
              <View style={[styles.statusBadge, statusStyle?.badge]}>
                <Text style={[styles.statusText, statusStyle?.text]}>
                  {getStatusLabel(usuario.estado) || 'No disponible'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Registro:</Text>
              <Text style={styles.value}>{formatDate(usuario.fechaRegistro)}</Text>
            </View>
          </View>

          {/* Descripción */}
          {usuario.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.value}>{usuario.descripcion}</Text>
            </View>
          )}

          {/* Documentación (adjuntos desde listado o API) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentación</Text>
            
            {attachmentsLoading ? (
              <ActivityIndicator size="small" />
            ) : allDisplayAttachments.length === 0 ? (
              <Text style={styles.value}>No hay documentos cargados.</Text>
            ) : (
              <View style={styles.documentSection}>
                {allDisplayAttachments.map((att) => {
                  const isPdf = (att.mimeType || '').toLowerCase().includes('pdf');
                  const isImage = (att.mimeType || '').toLowerCase().match(/^image\//);
                  return (
                    <TouchableOpacity
                      key={att.id}
                      style={styles.documentItem}
                      onPress={() => handleOpenAttachment(att.downloadUrl)}
                    >
                      <Ionicons 
                        name={isPdf ? 'document-text-outline' : isImage ? 'image-outline' : 'document-outline'}
                        size={24}
                        color={colors.primary}
                        style={styles.documentIcon}
                      />
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentName}>{att.fileName}</Text>
                        <Text style={styles.value} numberOfLines={1}>
                          {isPdf ? 'PDF' : isImage ? 'Imagen' : att.mimeType || 'Archivo'}{typeof att.size === 'number' ? ` · ${(att.size / 1024).toFixed(1)} KB` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Input de motivo (solo visible cuando está confirmando desactivación) */}
          {isConfirmingDeactivation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Motivo de rechazo</Text>
              <TextInput
                style={styles.motivoInput}
                value={motivoRechazo}
                onChangeText={setMotivoRechazo}
                placeholder="Escribí el motivo del rechazo"
                placeholderTextColor={colors.text.secondary}
                multiline
                autoFocus
              />
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            {isConfirmingDeactivation ? (
              <>
                <GuardarCancelarBtn 
                  label="Cancelar"
                  onPress={handleCancelarDesactivacion}
                  variant="secondary"
                />
                <GuardarCancelarBtn 
                  label="Confirmar"
                  onPress={handleConfirmarDesactivacion}
                  variant="primary"
                />
              </>
            ) : (
              <>
                {usuario.estado !== ESTADOS_USUARIO.DESACTIVADO && (
                  <GuardarCancelarBtn 
                    label="Desactivar"
                    onPress={handleDesactivarClick}
                    variant="secondary"
                  />
                )}
                {usuario.estado !== ESTADOS_USUARIO.ACTIVADO && (
                  <GuardarCancelarBtn 
                    label="Activar"
                    onPress={onActivate}
                    variant="primary"
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ValidarUsuario;