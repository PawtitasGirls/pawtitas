import React from 'react';
import ROLES from './types';
import PetOwnerProfileForm from './PetOwnerProfileForm';
import PrestadorServicioPerfilForm from './PrestadorServicioPerfilForm';
import AdminPerfilForm from './AdminPerfilForm';

// Factory Pattern. Componente de formulario según el rol del usuario autenticado
export default class PerfilFactory {
  static createProfileForm(role, props) {
    switch (role) {
      case ROLES.DUENIO:
        return <PetOwnerProfileForm {...props} />;
      case ROLES.PRESTADOR:
        return <PrestadorServicioPerfilForm {...props} />;
      case ROLES.ADMIN:
        return <AdminPerfilForm {...props} />;
      default:
        console.warn(`Rol desconocido: ${role}, usando formulario de dueño por defecto`);
        return <PetOwnerProfileForm {...props} />;
    }
  }
  // Obtener la configuración inicial del formulario según el rol
  static getInitialFormState(role) {
    const baseFormState = {
      avatarUri: null,
      avatarFile: null,
      nombreApellido: "",
      descripcion: "",
      email: "",
    };

    switch (role) {
      case ROLES.DUENIO:
        return {
          ...baseFormState,
          telefono: "",
          ubicacion: "",
        };
      case ROLES.PRESTADOR:
        return {
          ...baseFormState,
          telefono: "",
          ubicacion: "",
          precio: "",
          duracion: "",
          perfilRegistrado: "",
          services: {
            cuidador: false,
            paseador: false,
            veterinarioDomicilio: false,
            clinicaVeterinaria: false,
          },
          petTypes: {
            perro: false,
            gato: false,
            conejo: false,
            ave: false,
            roedor: false,
            otro: false,
          },
          petTypesCustom: "",
          availability: {
            lunes: false,
            martes: false,
            miercoles: false,
            jueves: false,
            viernes: false,
            sabado: false,
            domingo: false,
          },
          serviceActive: false,
        };
      case ROLES.ADMIN:
        return baseFormState;
      default:
        return baseFormState;
    }
  }

  // Validar el formulario según el rol del usuario
  static validateForm(formData, role) {
    const errors = {};

    // Validaciones para todos los roles
    if (!formData.nombreApellido?.trim()) {
      errors.nombreApellido = "El nombre y apellido son requeridos";
    }

    if (!formData.descripcion?.trim()) {
      errors.descripcion = "La descripción es requerida";
    } else if (formData.descripcion.length > 255) {
      errors.descripcion = "La descripción no puede exceder 255 caracteres";
    }

    if (!formData.email?.trim()) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El email no es válido";
    }

    // Validaciones específicas por rol
    switch (role) {
      case ROLES.DUENIO:
      case ROLES.PRESTADOR:
        if (!formData.telefono?.trim()) {
          errors.telefono = "El número de teléfono es requerido";
        }

        if (!formData.ubicacion?.trim()) {
          errors.ubicacion = "La ubicación es requerida";
        }

        // Validaciones específicas para prestador de servicios
        if (role === ROLES.PRESTADOR) {
          if (!formData.precio?.trim()) {
            errors.precio = "El precio es requerido";
          }

          if (!formData.duracion?.trim()) {
            errors.duracion = "La duración es requerida";
          }

          const hasPerfil = formData.perfilRegistrado?.trim();
          if (!hasPerfil) {
            errors.services = "No se encontró tu perfil de servicio";
          }

          if (formData.serviceActive === true) {
            const hasAvailability = Object.values(formData.availability || {}).some(value => value === true);
            if (!hasAvailability) {
              errors.availability = "Debes seleccionar al menos un día de disponibilidad";
            }
          }

          if (formData.petTypes?.otro && !formData.petTypesCustom?.trim()) {
            errors.petTypesCustom = "Especificá el tipo de mascota";
          }
        }
        break;
      case ROLES.ADMIN:
        break;
      default:
        break;
    }

    return errors;
  }
}
