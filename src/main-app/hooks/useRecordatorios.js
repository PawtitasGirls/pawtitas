import { useEffect, useState, useCallback } from 'react';
//import { getReservas } from '../../controllers/controller.Reserva.js'; 

export const useRecordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);

      const reservas = await getReservas();

      const reservasPagadas = reservas.filter(
        (r) => r.estado === 'PAGADO'
      );

      setRecordatorios(reservasPagadas);

    } catch (error) {
      console.error('Error obteniendo reservas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return {
    recordatorios,
    loading,
    refresh: fetchReservas
  };
};