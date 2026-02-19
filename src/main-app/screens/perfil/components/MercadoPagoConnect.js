import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { apiUsuario } from '../../../services';
import { colors } from '../../../../shared/styles';
import { styles } from './MercadoPagoConnect.styles';

const MercadoPagoConnect = ({ prestadorId, compact = false }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!prestadorId) return;
    try {
      setLoading(true);
      const res = await apiUsuario(`/api/mercadopago/oauth-status?prestadorId=${prestadorId}`);
      setStatus(res);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [prestadorId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const res = await apiUsuario(`/api/mercadopago/oauth-url?prestadorId=${prestadorId}`);
      if (!res?.url) throw new Error('No se pudo obtener la URL de autorización');

      const result = await WebBrowser.openAuthSessionAsync(res.url, 'pawtitas://oauth/success');

      if (result.type === 'success') {
        await fetchStatus();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo conectar con MercadoPago');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar MercadoPago',
      '¿Estás seguro? No podrás recibir pagos hasta volver a conectar tu cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiUsuario('/api/mercadopago/oauth-disconnect', {
                method: 'POST',
                body: JSON.stringify({ prestadorId }),
              });
              await fetchStatus();
            } catch {
              Alert.alert('Error', 'No se pudo desconectar la cuenta');
            }
          },
        },
      ]
    );
  };

  if (compact) {
    const handleCompactPress = status?.connected ? handleDisconnect : handleConnect;

    return (
      <TouchableOpacity
        style={styles.compactBtn}
        onPress={handleCompactPress}
        disabled={loading || connecting}
        activeOpacity={0.75}
      >
        <Ionicons name="card-outline" size={18} color="#f9d2ec" />
        <View style={styles.compactTextContainer}>
          <Text style={styles.compactTitle}>MercadoPago</Text>
          {loading || connecting ? (
            <ActivityIndicator size="small" color={colors.brand.accent} style={{ marginTop: 2 }} />
          ) : status?.connected ? (
            <Text style={styles.compactSubConnected}>Cuenta conectada ✓</Text>
          ) : (
            <Text style={styles.compactSubDisconnected}>Conectá para recibir pagos</Text>
          )}
        </View>
        {!loading && !connecting && (
          <Ionicons
            name={status?.connected ? 'ellipsis-horizontal' : 'chevron-forward'}
            size={16}
            color={status?.connected ? '#ccc' : '#aaa'}
          />
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.brand.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={20} color={colors.brand.accent} />
        <Text style={styles.title}>Cobros con MercadoPago</Text>
      </View>

      {status?.connected ? (
        <View style={styles.connectedContainer}>
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#00a650" />
            <Text style={styles.connectedText}>Cuenta conectada</Text>
          </View>
          <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
            <Text style={styles.disconnectText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.description}>
            Conectá tu cuenta de MercadoPago para recibir pagos de tus clientes.
          </Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={handleConnect}
            disabled={connecting}
            activeOpacity={0.8}
          >
            {connecting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="link-outline" size={18} color="#fff" />
                <Text style={styles.connectBtnText}>Conectar MercadoPago</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MercadoPagoConnect;
