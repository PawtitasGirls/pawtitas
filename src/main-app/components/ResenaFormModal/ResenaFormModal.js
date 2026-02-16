import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView,
  Keyboard,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MensajeFlotante from '../MensajeFlotante';
import { useResenaForm } from '../../hooks';
import { ResenaController, FORM_CONFIG } from '../../controller';
import { SeccionInfoUsuario } from './SeccionInfoUsuario';
import { SeccionCalificacion } from './SeccionCalificacion';
import { SeccionComentario } from './SeccionComentario';
import GuardarCancelarBtn from '../buttons/GuardarCancelarBtn';
import { styles } from './ResenaFormModal.styles';
import { colors } from '../../../shared/styles';

// Modal para crear y enviar reseñas
const ResenaFormModal = ({ 
  visible, 
  onClose, 
  usuario = null,
  onSave,
  tipoUsuario = 'prestador'
}) => {
  const scrollRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    formData,
    errors,
    message,
    loading,
    isFormValid,
    handleInputChange,
    handleSave,
    handleClose,
    handleHideMessage
  } = useResenaForm(visible, onSave, onClose, usuario, tipoUsuario);

  const texts = ResenaController.getTexts(tipoUsuario, usuario);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event) => {
      const nextHeight = event?.endCoordinates?.height || 0;
      setKeyboardHeight(nextHeight);
      setKeyboardOpen(true);
    };

    const onHide = () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleComentarioFocus = useCallback(() => {
    // Espera a que abra el teclado y lleva el comentario al área visible.
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 140);
  }, []);

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{texts.title}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Subtítulo */}
            <Text style={styles.modalSubtitle}>{texts.subtitle}</Text>

            {/* Información del usuario */}
            <SeccionInfoUsuario usuario={usuario} tipoUsuario={tipoUsuario} />

            <ScrollView 
              ref={scrollRef}
              style={styles.formContainer}
              contentContainerStyle={[
                styles.formContent,
                keyboardOpen && styles.formContentKeyboardOpen,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
              {/* Mensaje de error */}
              {errors.general && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.general}</Text>
                </View>
              )}

              {/* Sección de calificación */}
              <SeccionCalificacion
                rating={formData.rating}
                onRatingChange={(rating) => handleInputChange('rating', rating)}
                error={errors.rating}
              />

              {/* Campo de comentario */}
              <SeccionComentario
                comentario={formData.comentario}
                onChangeText={(value) => handleInputChange('comentario', value)}
                placeholder={texts.placeholder}
                error={errors.comentario}
                onFocus={handleComentarioFocus}
              />
            </ScrollView>

            {/* Botones de acción */}
            <GuardarCancelarBtn
              label={texts.saveButton}
              onPress={handleSave}
              loading={loading}
              disabled={!isFormValid}
              variant="primary"
              showCancel={true}
              cancelLabel="Cancelar"
              onCancel={handleClose}
            />
          </View>
        </View>
      </Modal>

      {/* Mensaje flotante */}
      <MensajeFlotante
        message={message.text}
        type={message.type}
        visible={!!message.text}
        onHide={handleHideMessage}
        duration={FORM_CONFIG.FLOATING_MESSAGE_DURATION}
      />
    </>
  );
};

export default ResenaFormModal;
