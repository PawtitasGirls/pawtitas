import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

const MercadoPagoWebView = ({ visible, paymentUrl, onClose }) => {
  const openedRef = useRef(false);

  useEffect(() => {
    if (!visible || !paymentUrl || openedRef.current) return;

    const openBrowser = async () => {
      openedRef.current = true;
      try {
        await Linking.openURL(paymentUrl);
      } catch (e) {
      } finally {
        onClose?.();
        openedRef.current = false;
      }
    };

    openBrowser();
  }, [visible, paymentUrl, onClose]);

  return null;
};

export default MercadoPagoWebView;
