import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from 'expo-document-picker';
import { MensajeFlotante, CampoSeleccion, CampoFecha } from "../../components";
import { RegistroController, REGISTRO_CONFIG, ESPECIALIDADES_OPTIONS, PERFIL_OPTIONS, GENERO_OPTIONS } from "../../controller";
import { registrarUsuario } from "../../services";
import { styles } from "./registro.styles";

const SUCCESS_MESSAGE_DUEÑO = "¡Bienvenido/a! Tu registro fue exitoso, ya podés usar la app.";
const SUCCESS_MESSAGE_PRESTADOR = "¡Listo! Tu registro fue exitoso. Revisaremos tus datos y te notificaremos por correo cuando tu cuenta esté habilitada.";
const NAVIGATE_DELAY_MS = 3000;
const TERMINOS_PAGINAS = [
  {
    titulo: "1. Compromiso con el bienestar animal y la comunidad",
    contenido:
      "Pawtitas es una plataforma orientada al cuidado responsable de las mascotas y al fortalecimiento de una comunidad basada en el respeto, la empatia y la confianza. Al crear una cuenta aceptas utilizar el servicio de forma etica, priorizando siempre el bienestar animal y el trato digno entre las personas.",
  },
  {
    titulo: "2. Uso responsable de la cuenta",
    contenido:
      "Eres responsable de la actividad realizada con tu cuenta y de mantener la confidencialidad de tus credenciales. Debes brindar informacion verdadera, actualizada y verificable. No esta permitido suplantar identidades ni generar perfiles con fines engañosos o discriminatorios. Pawtitas podra suspender cuentas que vulneren estos principios.",
  },
  {
    titulo: "3. Conducta y contenido dentro de la plataforma",
    contenido:
      "Todo el contenido publicado debe ser legitimo, respetuoso y acorde a la normativa vigente. No se permite material ofensivo, discriminatorio, violento, ilegal ni que promueva el maltrato animal. Se espera un trato cordial, inclusivo y profesional entre usuarios. Pawtitas podra moderar o eliminar publicaciones que incumplan el codigo de etica. ",
  },
  {
    titulo: "4. Transparencia en los servicios y relaciones entre usuarios",
    contenido:
      "Los prestadores deben describir sus servicios de forma clara, honesta y completa. Los dueños de mascotas deben proporcionar informacion veraz sobre las necesidades y condiciones de sus animales. Las reservas, pagos y cancelaciones deben gestionarse con responsabilidad promoviendo acuerdos justos para ambas partes. Aceptar los términos y condiciones implica aceptar pagar un 12% de comision por parte de los dueños.",
  },
  {
    titulo: "5. Privacidad, seguridad y uso de datos",
    contenido:
      "Nos comprometemos a proteger la informacion personal de los usuarios y a utilizarla exclusivamente para el funcionamiento y mejora de la plataforma. Los datos se tratan bajo principios de confidencialidad, seguridad y respeto por la privacidad. Los usuarios tambien deben hacer un uso responsable de la informacion a la que accedan dentro de Pawtitas.",
  },
  {
    titulo: "6. Integridad, cumplimiento y mejora continua",
    contenido:
      "Pawtitas promueve un entorno basado en la integridad, la legalidad y el respeto mutuo. No se permiten acuerdos por fuera de la plataforma que busquen evadir sus normas de seguridad y confianza. Nos reservamos el derecho de actualizar estos terminos para mejorar la experiencia y reforzar nuestros principios eticos. No nos hacemos responsables de pagos/reservas realizadas fuera de la app. Se eliminarán perfiles que no respeten las condiciones. El uso continuo de la app implica la aceptacion de estas condiciones.",
  },
];


export default function RegistroScreen({ navigation }) {
  const [perfil, setPerfil] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGeneroPicker, setShowGeneroPicker] = useState(false);
  const [form, setForm] = useState(() => RegistroController.getInitialFormData());
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsPage, setTermsPage] = useState(0);
  const scrollViewRef = useRef(null);

  const handleDateChange = (event, selectedDate) => {
    const result = RegistroController.handleDateChange(
      event,
      selectedDate,
      form,
      Platform.OS
    );
    
    if (result.shouldClosePicker) {
      setShowDatePicker(false);
    }
    
    if (result.updatedForm !== form) {
      setForm(result.updatedForm);
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const toggleGeneroPicker = () => {
    setShowGeneroPicker(!showGeneroPicker);
  };

  const closeGeneroPicker = () => {
    setShowGeneroPicker(false);
  };

  const handleGeneroChange = (value) => {
    handleInputChange("genero", value);
    if (errors.genero) {
      setErrors(RegistroController.clearFieldError(errors, "genero"));
    }
    closeGeneroPicker();
  };

  const pickFile = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: REGISTRO_CONFIG.DOCUMENT_FILE_TYPES,
        copyToCacheDirectory: true,
      });

      // Compatible con API legacy (type === 'success') y nueva (canceled + assets)
      const canceled = result.canceled === true;
      const file = result.assets?.[0] ?? (result.type === 'success' ? result : null);
      if (!canceled && file?.uri) {
        const normalized = {
          uri: file.uri,
          name: file.name || 'documento.pdf',
          mimeType: file.mimeType || 'application/pdf',
        };
        setForm({ ...form, [field]: normalized });
        if (errors[field]) {
          setErrors(RegistroController.clearFieldError(errors, field));
        }
      }
    } catch (error) {
      console.log("Error al seleccionar archivo:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Limpiar error del campo cuando el usuario interactúe
    if (errors[field]) {
      setErrors(RegistroController.clearFieldError(errors, field));
    }
  };

  const handlePerfilChange = (value) => {
    setPerfil(value);
    if (value !== "prestador") {
      setEspecialidad("");
      setForm({
        ...form,
        documentosFile: null,
        certificadosFile: null
      });
    }
    if (errors.perfil) {
      setErrors(RegistroController.clearFieldError(errors, "perfil"));
    }
  };

  const handleEspecialidadChange = (value) => {
    setEspecialidad(value);
    // Limpiar error del campo
    if (errors.especialidad) {
      setErrors(RegistroController.clearFieldError(errors, "especialidad"));
    }
  };

  const validateForm = () => {
    const validationErrors = RegistroController.validateForm(form, perfil, especialidad);
    const newErrors = { ...validationErrors };

    if (!acceptedTerms) {
      newErrors.acceptedTerms = "Debes aceptar terminos y condiciones para continuar.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openTermsModal = () => {
    setTermsPage(0);
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const goToNextTermsPage = () => {
    setTermsPage((prevPage) => Math.min(prevPage + 1, TERMINOS_PAGINAS.length - 1));
  };

  const goToPreviousTermsPage = () => {
    setTermsPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const clearTermsError = () => {
    setErrors((prevErrors) => RegistroController.clearFieldError(prevErrors, "acceptedTerms"));
  };

  const toggleTermsAcceptance = () => {
    setAcceptedTerms((prevAccepted) => {
      const nextAccepted = !prevAccepted;
      if (nextAccepted) {
        clearTermsError();
      }
      return nextAccepted;
    });
  };

  const acceptTermsFromModal = () => {
    setAcceptedTerms(true);
    clearTermsError();
    closeTermsModal();
  };

  const handleSubmit = async () => {
    if (!validateForm() || submitting) return;

    if (typeof __DEV__ !== 'undefined' && __DEV__ && perfil === 'prestador') {
      console.log('[DEBUG_UPLOADS] form.documentosFile', form.documentosFile ? { uri: form.documentosFile.uri, name: form.documentosFile.name, mimeType: form.documentosFile.mimeType } : null);
      console.log('[DEBUG_UPLOADS] form.certificadosFile', form.certificadosFile ? { uri: form.certificadosFile.uri, name: form.certificadosFile.name, mimeType: form.certificadosFile.mimeType } : null);
    }

    try {
      setSubmitting(true);
      await registrarUsuario(form, perfil, especialidad);

      const message = perfil === "prestador" ? SUCCESS_MESSAGE_PRESTADOR : SUCCESS_MESSAGE_DUEÑO;
      setSuccessMessage(message);
      setTimeout(() => navigation.navigate("Inicio"), NAVIGATE_DELAY_MS);
    } catch (error) {
      alert(error?.message || "No se pudo completar el registro");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHideMessage = () => {
    setSuccessMessage("");
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = RegistroController.isScrollAtBottom(
      layoutMeasurement,
      contentOffset,
      contentSize
    );
    setIsScrollAtBottom(isAtBottom);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
      <Text style={styles.title}>Registrarse</Text>

      <TextInput
        placeholder="Nombre"
        style={[styles.input, errors.nombre && styles.inputError]}
        value={form.nombre}
        onChangeText={(v) => handleInputChange("nombre", v)}
        onFocus={closeDatePicker}
      />
      {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

      <TextInput
        placeholder="Apellido"
        style={[styles.input, errors.apellido && styles.inputError]}
        value={form.apellido}
        onChangeText={(v) => handleInputChange("apellido", v)}
        onFocus={closeDatePicker}
      />
      {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

      <CampoSeleccion
        value={form.fechaNacimiento}
        placeholder="Fecha de Nacimiento"
        error={errors.fechaNacimiento}
        onOpen={toggleDatePicker}
        label={
          form.fechaNacimiento
            ? RegistroController.formatDate(form.fechaNacimiento)
            : null
        }
      />
      <CampoFecha
        visible={showDatePicker}
        value={form.fechaNacimiento}
        onChange={handleDateChange}
      />

      <CampoSeleccion
        value={form.genero}
        placeholder="Género"
        error={errors.genero}
        onOpen={toggleGeneroPicker}
        label={
          form.genero
            ? GENERO_OPTIONS.find(o => o.value === form.genero)?.label
            : null
        }
      />
      {showGeneroPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showGeneroPicker}
          onRequestClose={closeGeneroPicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Género</Text>
                <TouchableOpacity onPress={closeGeneroPicker}>
                  <Text style={styles.modalCloseButton}>Cerrar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalOptionsContainer}>
                {GENERO_OPTIONS.filter(option => option.value !== "").map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      form.genero === option.value && styles.modalOptionSelected
                    ]}
                    onPress={() => handleGeneroChange(option.value)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      form.genero === option.value && styles.modalOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      <TextInput
        placeholder="Correo Electrónico"
        style={[styles.input, errors.correo && styles.inputError]}
        keyboardType="email-address"
        textContentType="emailAddress"
        value={form.correo}
        onChangeText={(v) => handleInputChange("correo", v)}
        onFocus={closeDatePicker}
      />
      {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

      <TextInput
        placeholder="Contraseña"
        style={[styles.input, errors.password && styles.inputError]}
        secureTextEntry={true}
        value={form.password}
        onChangeText={(v) => handleInputChange("password", v)}
        onFocus={closeDatePicker}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        placeholder="Número Telefónico"
        style={[styles.input, errors.telefono && styles.inputError]}
        keyboardType="phone-pad"
        value={form.telefono}
        onChangeText={(v) => handleInputChange("telefono", v)}
        onFocus={closeDatePicker}
      />
      {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

      <TextInput
        placeholder="Ubicación"
        style={[styles.input, errors.ubicacion && styles.inputError]}
        value={form.ubicacion}
        onChangeText={(v) => handleInputChange("ubicacion", v)}
        onFocus={closeDatePicker}
      />
      {errors.ubicacion && <Text style={styles.errorText}>{errors.ubicacion}</Text>}

      <TextInput
        placeholder="Documento de Identidad"
        style={[styles.input, errors.documento && styles.inputError]}
        keyboardType="numeric"
        value={form.documento}
        onChangeText={(v) => handleInputChange("documento", v)}
        onFocus={closeDatePicker}
      />
      {errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}

      <Text style={styles.subtitle}>Defina su rol</Text>
      <Picker
        selectedValue={perfil}
        style={styles.picker}
        onValueChange={handlePerfilChange}
      >
        {PERFIL_OPTIONS.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
      {errors.perfil && <Text style={styles.errorText}>{errors.perfil}</Text>}

      {perfil === "prestador" && (
        <>
          <Text style={styles.subtitle}>Defina su especialidad</Text>
          <Picker
            selectedValue={especialidad}
            style={styles.picker}
            onValueChange={handleEspecialidadChange}
          >
            {ESPECIALIDADES_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
          {errors.especialidad && <Text style={styles.errorText}>{errors.especialidad}</Text>}

          <Text style={styles.reminderText}>Adjuntar documento de identidad y antecedentes penales no menor a 3 meses.</Text>
          <TouchableOpacity
            style={[styles.clipButton, errors.documentosFile && styles.clipButtonError]}
            onPress={() => pickFile("documentosFile")}
          >
            <Text style={styles.clipText}>
              {form.documentosFile ? `📎 ${form.documentosFile.name}` : "Adjuntar documentos"}
            </Text>
          </TouchableOpacity>
          {errors.documentosFile && <Text style={styles.errorText}>{errors.documentosFile}</Text>}

          <Text style={styles.reminderText}>Adjuntar certificados de logros obtenidos y/o constancia de estudios.</Text>
          <TouchableOpacity
            style={[styles.clipButton, errors.certificadosFile && styles.clipButtonError]}
            onPress={() => pickFile("certificadosFile")}
          >
            <Text style={styles.clipText}>
              {form.certificadosFile ? `📎 ${form.certificadosFile.name}` : "Adjuntar certificados"}
            </Text>
          </TouchableOpacity>
          {errors.certificadosFile && <Text style={styles.errorText}>{errors.certificadosFile}</Text>}
        </>
      )}

      <View style={styles.termsSection}>
        <View style={styles.termsAcceptanceRow}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              acceptedTerms && styles.checkboxChecked,
              errors.acceptedTerms && styles.checkboxError,
            ]}
            onPress={toggleTermsAcceptance}
            activeOpacity={0.8}
          >
            {acceptedTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </TouchableOpacity>

          <Text style={styles.termsText}>Aceptar </Text>
          <TouchableOpacity onPress={openTermsModal}>
            <Text style={styles.termsLink}>Terminos y condiciones</Text>
          </TouchableOpacity>
        </View>
        {errors.acceptedTerms ? <Text style={styles.errorText}>{errors.acceptedTerms}</Text> : null}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.continue]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.continueText}>{submitting ? "Confirmando" : "Confirmar"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>Más adelante podrás editar tu perfil y agregar más información.</Text>
      </ScrollView>

      <MensajeFlotante
        visible={!!successMessage}
        message={successMessage}
        type="success"
        onHide={handleHideMessage}
        duration={REGISTRO_CONFIG.FLOATING_MESSAGE_DURATION}
        position="top"
      />

      <Modal
        transparent
        animationType="slide"
        visible={showTermsModal}
        onRequestClose={closeTermsModal}
      >
        <View style={styles.termsModalOverlay}>
          <View style={styles.termsModalContent}>
            <View style={styles.termsModalHeader}>
              <Text style={styles.termsModalTitle}>Terminos y condiciones</Text>
              <TouchableOpacity onPress={closeTermsModal}>
                <Text style={styles.modalCloseButton}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.termsModalBody}
              contentContainerStyle={styles.termsModalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.termsPageIndicator}>
                Pagina {termsPage + 1} de {TERMINOS_PAGINAS.length}
              </Text>
              <Text style={styles.termsPageTitle}>{TERMINOS_PAGINAS[termsPage].titulo}</Text>
              <Text style={styles.termsPageText}>{TERMINOS_PAGINAS[termsPage].contenido}</Text>
            </ScrollView>

            <View style={styles.termsModalFooter}>
              <TouchableOpacity
                style={[
                  styles.termsNavButton,
                  termsPage === 0 && styles.termsNavButtonDisabled,
                ]}
                onPress={goToPreviousTermsPage}
                disabled={termsPage === 0}
              >
                <Text style={styles.termsNavButtonText}>Anterior</Text>
              </TouchableOpacity>

              {termsPage < TERMINOS_PAGINAS.length - 1 ? (
                <TouchableOpacity style={styles.termsNavButton} onPress={goToNextTermsPage}>
                  <Text style={styles.termsNavButtonText}>Siguiente</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.termsAcceptButton} onPress={acceptTermsFromModal}>
                  <Text style={styles.termsAcceptButtonText}>Aceptar y cerrar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}