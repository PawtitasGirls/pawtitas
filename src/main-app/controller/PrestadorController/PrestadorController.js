import { getPrestadoresPorPerfil } from '../../services';
import { withCacheBuster } from '../../../shared/utils';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export class PrestadorController {
  static async getPrestadores(perfil, ciudad = null) {
    try {
      const response = await getPrestadoresPorPerfil(perfil, ciudad);
      if (response.success && response.data) {
        return this.mapPrestadores(response.data);
      }
      return [];
    } catch (error) {
      console.error(`Error al cargar prestadores (${perfil}):`, error);
      throw new Error('No se pudieron cargar los prestadores. Intenta nuevamente.');
    }
  }

  static mapPrestadores(prestadores) {
    if (!Array.isArray(prestadores)) {
      return [];
    }

    return prestadores.map((prestador) => this.mapPrestador(prestador));
  }

  static mapPrestador(prestador) {
    const { 
      id, 
      nombreCompleto, 
      domicilio, 
      servicio,
      celular,
      perfil,
      avgRating,
      reviewsCount,
      usuarioId,
    } = prestador;

    return {
      id: id?.toString() || '',
      usuarioId: usuarioId?.toString?.() || usuarioId || '',
      servicioId: servicio?.id?.toString?.() || servicio?.id || '',
      nombre: nombreCompleto || 'Sin nombre',
      avatarUrl: prestador.profilePhotoUrl
        ? withCacheBuster(API_BASE + prestador.profilePhotoUrl)
        : withCacheBuster(prestador.avatar),
      rating: Number(avgRating ?? prestador?.rating ?? 0),
      reviewsCount: Number(reviewsCount || 0),
      descripcion: servicio?.descripcion || 'Sin descripción',
      precio: this.formatPrecio(servicio?.precio),
      ubicacion: domicilio?.ubicacion || 'No especificado',
      disponibilidad: servicio?.horarios || 'A convenir',
      horario: servicio?.duracion || 'A convenir',
      latitude: domicilio?.latitude ?? null,
      longitude: domicilio?.longitude ?? null,
      tipo: perfil || '',
      celular: celular || '',
      tipoMascota: servicio?.tipoMascota || '',
      disponible: servicio?.disponible ?? true,
      reviewedRole: 'PRESTADOR',
      reviewedEntityId: id?.toString() || '',
    };
  }

  static formatPrecio(precio) {
    if (!precio || precio === 0) {
      return 'A convenir';
    }

    const precioNumerico = Number(precio);
    if (isNaN(precioNumerico)) {
      return 'A convenir';
    }

    return `$${precioNumerico.toLocaleString('es-AR')}`;
  }

  static filterBySearch(prestadores, searchText) {
    if (!searchText || searchText.trim() === '') {
      return prestadores;
    }

    const search = searchText.toLowerCase();
    return prestadores.filter((prestador) =>
      prestador.nombre.toLowerCase().includes(search) ||
      prestador.ubicacion.toLowerCase().includes(search) ||
      prestador.descripcion.toLowerCase().includes(search)
    );
  }

  static sortByDistance(prestadores) {
    return [...prestadores].sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  static sortByRating(prestadores) {
    return [...prestadores].sort((a, b) => b.rating - a.rating);
  }

  static sortByPrice(prestadores) {
    return [...prestadores].sort((a, b) => {
      const precioA = this.extractPrecioNumerico(a.precio);
      const precioB = this.extractPrecioNumerico(b.precio);
      
      // Los "A convenir" van al final
      if (precioA === Infinity && precioB === Infinity) return 0;
      if (precioA === Infinity) return 1;
      if (precioB === Infinity) return -1;
      
      return precioA - precioB;
    });
  }

  static extractPrecioNumerico(precio) {
    if (precio === 'A convenir') {
      return Infinity;
    }
    const numerico = parseInt(precio.replace(/[^0-9]/g, ''));
    return isNaN(numerico) ? Infinity : numerico;
  }

  static getTiposPrestadores() {
    return [
      { key: 'cuidador', label: 'Cuidador' },
      { key: 'paseador', label: 'Paseador' },
      { key: 'salud', label: 'Salud' },
    ];
  }

  static isPerfilValido(perfil) {
    const perfiles = ['cuidador', 'paseador', 'salud'];
    return perfiles.includes(perfil?.toLowerCase());
  }
}
