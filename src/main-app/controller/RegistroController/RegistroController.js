// Formatos permitidos para adjuntos de prestadores (debe coincidir con backend)
export const ALLOWED_ATTACHMENT_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
export const ALLOWED_ATTACHMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
export const ATTACHMENT_FORMAT_ERROR =
  "Formato incorrecto, solo puede ser jpg, jpeg, png o pdf";

// Configuración del registro
export const REGISTRO_CONFIG = {
  FLOATING_MESSAGE_DURATION: 5000,
  MIN_PASSWORD_LENGTH: 6,
  MAX_AGE: 120,
  MIN_DATE: new Date(1900, 0, 1),
  DOCUMENT_FILE_TYPES: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
  SCROLL_PADDING_TO_BOTTOM: 20
};

// Reglas de validación
export const VALIDATION_RULES = {
  nombre: {
    required: true,
    message: "El nombre es obligatorio"
  },
  apellido: {
    required: true,
    message: "El apellido es obligatorio"
  },
  fechaNacimiento: {
    required: true,
    message: "La fecha de nacimiento es obligatoria",
    maxAge: REGISTRO_CONFIG.MAX_AGE,
    maxAgeMessage: "La fecha de nacimiento no es válida"
  },
  correo: {
    required: true,
    message: "El correo es obligatorio",
    email: true,
    emailMessage: "El correo no es válido"
  },
  password: {
    required: true,
    message: "La contraseña es obligatoria",
    minLength: REGISTRO_CONFIG.MIN_PASSWORD_LENGTH,
    minLengthMessage: "La contraseña debe tener al menos 6 caracteres"
  },
  telefono: {
    required: true,
    message: "El número telefónico es obligatorio"
  },
  ubicacion: {
    required: true,
    message: "La ubicación es obligatoria"
  },
  documento: {
    required: true,
    message: "El documento de identidad es obligatorio"
  },
  genero: {
    required: true,
    message: "Debe seleccionar un género"
  },
  perfil: {
    required: true,
    message: "Debe seleccionar un rol"
  },
  especialidad: {
    required: true,
    message: "Debe seleccionar una especialidad"
  },
  documentosFile: {
    required: false,
    message: "Debe adjuntar el documento de identidad y antecedentes (PDF, JPG, PNG, JPEG)"
  },
  certificadosFile: {
    required: false,
    message: "Debe adjuntar los certificados (PDF, JPG, PNG, JPEG)"
  }
};

function isAllowedAttachmentFile(file) {
  if (!file) return false;
  const mime = (file.mimeType || file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (ALLOWED_ATTACHMENT_MIMES.some((allowed) => mime === allowed)) return true;
  return ALLOWED_ATTACHMENT_EXTENSIONS.some((ext) => name.endsWith(ext));
}

// Opciones de especialidades para prestadores
export const ESPECIALIDADES_OPTIONS = [
  { label: "Seleccione una especialidad...", value: "" },
  { label: "Cuidador", value: "Cuidador" },
  { label: "Paseador", value: "Paseador" },
  { label: "Veterinaria", value: "Veterinaria" },
  { label: "Veterinaria a domicilio", value: "Veterinaria a Domicilio" }
];

// Opciones de perfil
export const PERFIL_OPTIONS = [
  { label: "Seleccione un rol...", value: "" },
  { label: "Dueño", value: "dueno" },
  { label: "Prestador de Servicio", value: "prestador" }
];

// Opciones de género
export const GENERO_OPTIONS = [
  { label: "Seleccione un género", value: "" },
  { label: "Femenino", value: "femenino" },
  { label: "Masculino", value: "masculino" }
];

export class RegistroController {
  // Obtener formulario inicial vacío
  static getInitialFormData() {
    return {
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      genero: "",
      correo: "",
      password: "",
      telefono: "",
      ubicacion: "",
      documento: "",
      documentosFile: null,
      certificadosFile: null
    };
  }

  // Obtener estado inicial
  static getInitialState() {
    return {
      perfil: "",
      especialidad: "",
      showDatePicker: false,
      form: this.getInitialFormData(),
      errors: {},
      successMessage: "",
      isScrollAtBottom: false
    };
  }

  // Formatear la fecha
  static formatDate(date) {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Calcular edad a partir de una fecha de nacimiento
  static calculateAge(birthDate) {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Validar campo individual
  static validateField(field, value, rules, additionalData = {}) {
    // Validar campo requerido
    if (rules.required) {
      if (typeof value === "string") {
        if (!value || value.trim().length === 0) {
          return rules.message;
        }
      } else if (value === null || value === undefined) {
        return rules.message;
      }
    }

    // Validar email
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return rules.emailMessage || rules.message;
      }
    }

    // Validar longitud mínima
    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.minLengthMessage || rules.message;
    }

    // Validar edad máxima para fecha de nacimiento
    if (rules.maxAge && field === "fechaNacimiento" && value) {
      const age = this.calculateAge(value);
      if (age > rules.maxAge) {
        return rules.maxAgeMessage || rules.message;
      }
    }

    return null;
  }

  // Validar formulario completo
  static validateForm(formData, perfil, especialidad) {
    const errors = {};

    // Validar campos básicos
    Object.keys(VALIDATION_RULES).forEach((field) => {
      if (field === "especialidad" && perfil !== "prestador") {
        return;
      }
      if (field === "documentosFile" || field === "certificadosFile") {
        return;
      }

      const rules = VALIDATION_RULES[field];
      const value = formData[field];

      if (field === "perfil") {
        const error = this.validateField(field, perfil, rules);
        if (error) {
          errors[field] = error;
        }
      } else if (field === "especialidad") {
        const error = this.validateField(field, especialidad, rules);
        if (error) {
          errors[field] = error;
        }
      } else {
        const error = this.validateField(field, value, rules);
        if (error) {
          errors[field] = error;
        }
      }
    });

    // Prestador: documentos y certificados obligatorios y formato válido (pdf, jpg, jpeg, png)
    if (perfil === "prestador") {
      if (!formData.documentosFile?.uri) {
        errors.documentosFile = VALIDATION_RULES.documentosFile.message;
      } else if (!isAllowedAttachmentFile(formData.documentosFile)) {
        errors.documentosFile = ATTACHMENT_FORMAT_ERROR;
      }
      if (!formData.certificadosFile?.uri) {
        errors.certificadosFile = VALIDATION_RULES.certificadosFile.message;
      } else if (!isAllowedAttachmentFile(formData.certificadosFile)) {
        errors.certificadosFile = ATTACHMENT_FORMAT_ERROR;
      }
    }

    return errors;
  }

  // Verificar si el formulario es válido
  static isFormValid(formData, perfil, especialidad, errors) {
    const baseValid =
      Object.keys(errors).length === 0 &&
      formData.nombre.trim() !== "" &&
      formData.fechaNacimiento !== null &&
      formData.correo.trim() !== "" &&
      formData.password.length >= REGISTRO_CONFIG.MIN_PASSWORD_LENGTH &&
      formData.telefono.trim() !== "" &&
      formData.ubicacion.trim() !== "" &&
      formData.documento.trim() !== "" &&
      perfil !== "" &&
      (perfil !== "prestador" || especialidad !== "");

    if (perfil !== "prestador") return baseValid;
    return (
      baseValid &&
      !!formData.documentosFile?.uri &&
      !!formData.certificadosFile?.uri
    );
  }

  // Preparar datos para navegación
  static prepareDataForNavigation(formData, perfil) {
    return {
      tipoPerfil: perfil,
      formData: {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento
          ? formData.fechaNacimiento.toISOString()
          : null
      }
    };
  }

    // Limpiar error 
  static clearFieldError(errors, field) {
    const { [field]: _, ...rest } = errors;
    return rest;
  }

  static clearAllErrors() {
    return {};
  }

  // Obtener opciones de especialidades
  static getEspecialidadesOptions() {
    return ESPECIALIDADES_OPTIONS;
  }

  // Obtener opciones de perfil
  static getPerfilOptions() {
    return PERFIL_OPTIONS;
  }

  static isScrollAtBottom(layoutMeasurement, contentOffset, contentSize) {
    const paddingToBottom = REGISTRO_CONFIG.SCROLL_PADDING_TO_BOTTOM;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  }

  // Cambio de fecha
  static handleDateChange(event, selectedDate, currentForm, platform) {
    const result = {
      shouldClosePicker: false,
      updatedForm: currentForm
    };

    if (platform === "android") {
      result.shouldClosePicker = true;
      if (event.type === "set" && selectedDate) {
        result.updatedForm = { ...currentForm, fechaNacimiento: selectedDate };
      }
    } else {
      if (event.type === "set" && selectedDate) {
        result.updatedForm = { ...currentForm, fechaNacimiento: selectedDate };
      }
    }

    return result;
  }
}

