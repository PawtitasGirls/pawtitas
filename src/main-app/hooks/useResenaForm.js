import { useState, useEffect, useCallback } from 'react';
import { ResenaController } from '../controller/ResenasController/ResenaController';
import { useAuth } from '../contexts';

// Mnejar el formulario de reseñas
export const useResenaForm = (visible, onSave, onClose, usuario, tipoUsuario) => {
  const { role } = useAuth();
  // Estados de React
  const [formData, setFormData] = useState(() => ResenaController.getInitialFormData());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Resetear formulario cuando el modal se abre
  useEffect(() => {
    if (visible) {
      setFormData(ResenaController.getInitialFormData());
      setErrors(ResenaController.clearAllErrors());
      setMessage({ type: '', text: '' });
    }
  }, [visible]);

  // Manejar cambios en los inputs
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario interactúe
    if (errors[field]) {
      setErrors(prev => ResenaController.clearFieldError(prev, field));
    }
    
    // Limpiar error general
    if (errors.general) {
      setErrors(prev => ResenaController.clearFieldError(prev, 'general'));
    }
  }, [errors]);

  // Validar formulario usando el controller
  const validateForm = useCallback(() => {
    const newErrors = ResenaController.validateForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Guardar reseña
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const reservaId = usuario?.reservaId || usuario?.id;
      const result = await ResenaController.saveResena(formData, tipoUsuario, {
        reservaId,
        role,
      });
      
      if (result.success) {
        setLoading(false);
        setMessage({ 
          type: 'success', 
          text: result.message 
        });

        // Llamar callback personalizado si existe
        onSave?.(result.data);
        
        // Cerrar después de un breve delay
        setTimeout(() => {
          onClose?.();
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: error?.message || 'Error al enviar la reseña. Intenta nuevamente.' 
      });
    }
  }, [formData, validateForm, tipoUsuario, onSave, onClose, usuario, role]);

  // Cerrar modal
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Ocultar mensaje flotante
  const handleHideMessage = useCallback(() => {
    setMessage({ type: '', text: '' });
  }, []);

  // Verificar si el formulario es válido
  const isFormValid = ResenaController.isFormValid(formData, errors);

  return {
    formData,
    errors,
    message,
    loading,
    isFormValid,
    handleInputChange,
    handleSave,
    handleClose,
    handleHideMessage
  };
};

