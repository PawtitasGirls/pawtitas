import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView,
  KeyboardAvoidingView,
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

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardAvoidingView}
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
              style={styles.formContainer}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
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
        </KeyboardAvoidingView>
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
