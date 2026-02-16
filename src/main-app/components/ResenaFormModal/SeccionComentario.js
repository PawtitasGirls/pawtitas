import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '../../../shared/styles';
import { styles } from './ResenaFormModal.styles';
import { FORM_CONFIG } from '../../controller/ResenasController/ResenaController';

// Sección de comentario del formulario de reseña
export const SeccionComentario = ({ 
  comentario, 
  onChangeText, 
  placeholder, 
  error,
  onFocus,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Comentario </Text>
    <TextInput
      style={[
        styles.textarea,
        error && styles.textareaError
      ]}
      value={comentario}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.disabled}
      multiline={true}
      numberOfLines={FORM_CONFIG.TEXTAREA_LINES}
      maxLength={FORM_CONFIG.MAX_COMMENT_LENGTH}
      textAlignVertical="top"
      scrollEnabled={true}
      onFocus={onFocus}
    />
    <Text style={styles.characterCount}>
      {comentario.length}/{FORM_CONFIG.MAX_COMMENT_LENGTH}
    </Text>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);
