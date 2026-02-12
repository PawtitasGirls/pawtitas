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

      if (result.type === "success") {
        setForm({ ...form, [field]: result });
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
    const newErrors = RegistroController.validateForm(form, perfil, especialidad);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || submitting) return;

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
    </View>
  );
}