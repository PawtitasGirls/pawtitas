import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader, GuardarCancelarBtn, MensajeFlotante, MenuInferior, useNavbarHeight } from "../../../components";
import { styles } from "./editarPerfil.styles";
import PerfilFactory from "./roles/PerfilFactory";
import ROLES from "./roles/types";
import { useAuth } from "../../../contexts";
import { getUserProfile, updateUserProfile } from "../../../services";

const buildLocation = (user) => {
  if (!user) return "";
  if (user.domicilio) {
    const { calle, numero, ciudad } = user.domicilio;
    const calleNumero = [calle, numero].filter(Boolean).join(' ');
    return ciudad ? `${calleNumero}, ${ciudad}` : calleNumero;
  }
  return user.ubicacion || "";
};

const buildFullName = (user) => {
  const full = [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim();
  return full || user?.name || "";
};

const buildFormDataFromUser = (role, userData) => {
  const base = PerfilFactory.getInitialFormState(role);
  if (!userData) return base;

  const next = { ...base };

  if ("avatarUri" in next) next.avatarUri = userData.avatar || null;
  if ("nombreApellido" in next) next.nombreApellido = buildFullName(userData);
  if ("descripcion" in next) next.descripcion = userData.descripcion || next.descripcion;
  if ("email" in next) next.email = userData.email || next.email;
  if ("telefono" in next) next.telefono = userData.celular || userData.telefono || next.telefono;
  if ("ubicacion" in next) next.ubicacion = buildLocation(userData);

  if (role === ROLES.PRESTADOR) {
    const perfil = userData.perfil || "";
    const horarios = userData.horarios || "";
    const tipoMascota = userData.tipoMascota || "";

    next.perfilRegistrado = perfil;

    if ("precio" in next && userData.precio != null) {
      next.precio = String(userData.precio);
    }

    if ("duracion" in next && userData.duracion) {
      next.duracion = userData.duracion;
    }

    if ("serviceActive" in next && userData.serviceActive != null) {
      next.serviceActive = Boolean(userData.serviceActive);
    }

    if ("services" in next) {
      const selected = perfil.split(',').map((s) => s.trim());
      next.services = {
        cuidador: selected.includes('Cuidador'),
        paseador: selected.includes('Paseador'),
        veterinarioDomicilio: selected.includes('Veterinario a domicilio'),
        clinicaVeterinaria: selected.includes('Clínica Veterinaria'),
      };
    }

    if ("availability" in next) {
      const selectedDays = horarios.split(',').map((s) => s.trim()).filter(Boolean);
      next.availability = {
        lunes: selectedDays.includes('lunes'),
        martes: selectedDays.includes('martes'),
        miercoles: selectedDays.includes('miercoles'),
        jueves: selectedDays.includes('jueves'),
        viernes: selectedDays.includes('viernes'),
        sabado: selectedDays.includes('sabado'),
        domingo: selectedDays.includes('domingo'),
      };
    }

    if ("petTypes" in next) {
      const selectedTypes = tipoMascota.split(',').map((s) => s.trim()).filter(Boolean);
      next.petTypes = {
        perro: selectedTypes.includes('Perro'),
        gato: selectedTypes.includes('Gato'),
        conejo: selectedTypes.includes('Conejo'),
        ave: selectedTypes.includes('Ave'),
        roedor: selectedTypes.includes('Roedor'),
        otro: selectedTypes.some((t) => !['Perro', 'Gato', 'Conejo', 'Ave', 'Roedor', 'General'].includes(t)),
      };
      if (next.petTypes.otro) {
        const custom = selectedTypes.find(
          (t) => !['Perro', 'Gato', 'Conejo', 'Ave', 'Roedor', 'General'].includes(t)
        );
        next.petTypesCustom = custom || next.petTypesCustom;
      }
    }
  }

  return next;
};

export default function EditarPerfil({ navigation, route }) {
  const { user, role: authRole, updateUser } = useAuth();
  const navbarHeight = useNavbarHeight();

  const userRole = route?.params?.role || authRole || ROLES.DUENIO;

  const [formData, setFormData] = useState(() => buildFormDataFromUser(userRole, user));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showMensajeFlotante, setShowMensajeFlotante] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [userRole, user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const response = await getUserProfile(user.id, userRole);
        const hydrated = buildFormDataFromUser(userRole, response?.userData || user);
        setFormData(hydrated);
      } else {
        const hydrated = buildFormDataFromUser(userRole, user);
        setFormData(hydrated);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cargar los datos del perfil" });
      setShowMensajeFlotante(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = PerfilFactory.validateForm(formData, userRole);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setMessage({ type: "error", text: "Por favor, corrige los errores en el formulario" });
      setShowMensajeFlotante(true);
      return;
    }

    if (!user?.id) {
      setMessage({ type: "error", text: "No se encontró el usuario autenticado" });
      setShowMensajeFlotante(true);
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    setShowMensajeFlotante(false);

    try {
      const payload = {
        role: userRole,
        nombreApellido: formData.nombreApellido,
        descripcion: formData.descripcion,
        email: formData.email,
        telefono: formData.telefono,
        ubicacion: formData.ubicacion,
        precio: formData.precio,
        duracion: formData.duracion,
        availability: formData.availability,
        petTypes: formData.petTypes,
        petTypesCustom: formData.petTypesCustom,
        serviceActive: formData.serviceActive,
      };
      if (userRole !== ROLES.PRESTADOR) payload.services = formData.services;

      const response = await updateUserProfile(user.id, payload);

      if (response?.userData) {
        updateUser(response.userData);
        setFormData(buildFormDataFromUser(userRole, response.userData));
      }

      setMessage({ type: "success", text: "Perfil actualizado exitosamente" });
      setShowMensajeFlotante(true);

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Perfil" }],
        });
      }, 1000);
      
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Error al guardar el perfil. Inténtalo de nuevo." });
      setShowMensajeFlotante(true);
    } finally {
      setSaving(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHideMensajeFlotante = () => {
    setShowMensajeFlotante(false);
    setMessage({ type: "", text: "" });
  };

  const getTitleByRole = () => "Editar Perfil";

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f9bbd2ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MensajeFlotante
        message={message.text}
        type={message.type}
        visible={showMensajeFlotante}
        onHide={handleHideMensajeFlotante}
        duration={4000}
      />

      <ScreenHeader
        title={getTitleByRole()}
        subtitle="Tu perfil es tu carta de presentación, ¡mantenlo al día!"
        onBackPress={handleBackPress}
      />
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {userRole !== ROLES.ADMIN && (
            <View style={styles.additionalInfoContainer}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.additionalInfoTitle}>Información importante</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.additionalInfoText}>
                    Todos los campos son obligatorios
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.additionalInfoText}>
                    Tu información será visible para otros usuarios de la plataforma, a excepción de tu email y teléfono
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.additionalInfoText}>
                    Tu perfil está protegido y solo se usa para conectar con la comunidad
                  </Text>
                </View>
              </View>
            </View>
          )}

          {PerfilFactory.createProfileForm(userRole, { formData, handleInputChange, errors })}
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: navbarHeight }]}>
          <GuardarCancelarBtn
            label="Guardar"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            showCancel={true}
            onCancel={handleBackPress}
            cancelLabel="Cancelar"
          />
        </View>
      </KeyboardAvoidingView>
      
      <MenuInferior />
    </SafeAreaView>
  );
}