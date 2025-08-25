import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export function useQRCode(text: string) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(text, {
          width: 64,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    if (text) {
      generateQR();
    }
  }, [text]);

  return qrCodeUrl;
}