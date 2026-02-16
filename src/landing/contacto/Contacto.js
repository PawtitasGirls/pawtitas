import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Animated
} from "react-native";
import styles from "./Contacto.styles";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  // Mostrar mensaje flotante
  const showMessage = () => {
    setShowSuccessMessage(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      hideMessage();
    }, 4000);
  };

  // Ocultar mensaje flotante
  const hideMessage = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessMessage(false);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "El email no es válido";
      }
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = "El mensaje es requerido";
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = "El mensaje debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    // Debug: verificar validación
    console.log("Validación:", { newErrors, isValid, formData });
    
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    console.log("handleSubmit llamado", formData);
    
    // Validar primero
    const isValid = validateForm();
    
    if (!isValid) {
      console.log("Formulario inválido, errores:", errors);
      // Forzar re-render mostrando los errores
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      if (!API_BASE) {
        Alert.alert(
          "Error",
          "No se configuró la URL del backend (EXPO_PUBLIC_API_BASE_URL)."
        );
        setLoading(false);
        return;
      }

      console.log("Enviando a:", `${API_BASE}/contacto`);
      console.log("Datos:", formData);

      const response = await fetch(`${API_BASE}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Respuesta status:", response.status);

      const data = await response.json().catch((err) => {
        console.error("Error parseando JSON:", err);
        return {};
      });

      console.log("Respuesta data:", data);

      if (response.ok && data.success) {
        // Limpiar formulario
        setFormData({ nombre: "", email: "", mensaje: "" });
        setErrors({});
        // Mostrar mensaje flotante
        showMessage();
      } else {
        Alert.alert(
          "Error",
          data.message || "No se pudo enviar el mensaje. Intenta nuevamente."
        );
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      Alert.alert(
        "Error",
        `No se pudo conectar con el servidor: ${error.message}. Verifica tu conexión e intenta nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Contacto</Text>
      <Text style={styles.subtitle}>
        Cualquier inquietud no dudes en consultarnos
      </Text>

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput
          placeholder="Nombre completo"
          style={[styles.input, errors.nombre && styles.inputError]}
          value={formData.nombre}
          onChangeText={(value) => handleInputChange("nombre", value)}
        />
        {errors.nombre && (
          <Text style={styles.errorText}>{errors.nombre}</Text>
        )}

        <TextInput
          placeholder="Email"
          style={[styles.input, errors.email && styles.inputError]}
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        <TextInput
          placeholder="Envíanos tus dudas/consultas y con gusto te responderemos a la brevedad"
          style={[
            styles.input,
            styles.textArea,
            errors.mensaje && styles.inputError,
          ]}
          multiline
          numberOfLines={4}
          value={formData.mensaje}
          onChangeText={(value) => handleInputChange("mensaje", value)}
        />
        {errors.mensaje && (
          <Text style={styles.errorText}>{errors.mensaje}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Mensaje flotante de éxito */}
      {showSuccessMessage && (
        <Animated.View
          style={[
            styles.floatingMessage,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.floatingMessageText}>
            Mensaje enviado correctamente. Te responderemos a la brevedad.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}