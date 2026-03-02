import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts';
import { ROLES } from '../constants/roles';
import { getReservasByDuenio, getReservasByPrestador } from '../services';

const formatFechaLabel = (fecha) => {
  if (!fecha) return 'Sin fecha';
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const useRecordatorios = () => {
  const { user, role } = useAuth();

  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  const duenioId = user?.duenioId || (role === ROLES.DUENIO ? user?.id : null);
  const prestadorId = user?.prestadorId || (role === ROLES.PRESTADOR ? user?.id : null);

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setRecordatorios([]);
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let res = null;

      if (role === ROLES.DUENIO && duenioId) {
        res = await getReservasByDuenio(duenioId);
      } else if (role === ROLES.PRESTADOR && prestadorId) {
        res = await getReservasByPrestador(prestadorId);
      } else {
        setRecordatorios([]);
        return;
      }

      const reservas = res?.reservas || [];

      const reservasPagadas = reservas
        .filter((r) => r.estado === 'PAGADO')
        .sort((a, b) => {
          const da = a.fechaServicio ? new Date(a.fechaServicio).getTime() : 0;
          const db = b.fechaServicio ? new Date(b.fechaServicio).getTime() : 0;
          return da - db;
        });

      const mapped = reservasPagadas.map((r) => {
        const isDuenio = role === ROLES.DUENIO;
        const usuarioNombre = isDuenio
          ? r.prestador?.nombreCompleto || 'Tu prestador'
          : r.duenio?.nombreCompleto || 'Tu cliente';

        const tieneFecha = Boolean(r.fechaServicio);
        const fechaValida = tieneFecha ? new Date(r.fechaServicio) : null;
        const esFutura =
          fechaValida && !Number.isNaN(fechaValida.getTime())
            ? (fechaValida.setHours(0, 0, 0, 0), fechaValida >= hoy)
            : false;

        return {
          id: r.id,
          usuario: usuarioNombre,
          fechaServicio: r.fechaServicio,
          fechaLabel: tieneFecha ? formatFechaLabel(r.fechaServicio) : null,
          tieneFecha,
          esFutura,
          estado: r.estado,
          raw: r,
        };
      });

      setRecordatorios(mapped);
    } catch (error) {
      console.error('Error obteniendo reservas para recordatorios:', error);
      setRecordatorios([]);
    } finally {
      setLoading(false);
    }
  }, [user, role, duenioId, prestadorId]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return {
    recordatorios,
    loading,
    refresh: fetchReservas,
  };
};