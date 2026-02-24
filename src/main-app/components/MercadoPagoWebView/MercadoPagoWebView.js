import { useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';

const MercadoPagoWebView = ({ visible, paymentUrl, onClose }) => {
  const openedRef = useRef(false);

  useEffect(() => {
    if (!visible || !paymentUrl || openedRef.current) return;

    const openBrowser = async () => {
      openedRef.current = true;
      try {
        await WebBrowser.openBrowserAsync(paymentUrl);
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
