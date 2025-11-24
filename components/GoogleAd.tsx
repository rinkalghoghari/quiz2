import React, { useEffect, useState, useRef } from 'react';
import { getRemoteConfigValue } from '@/lib/firebaseConfig';

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

interface GoogleAdProps {
  adSlot?: string;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAd: React.FC<GoogleAdProps> = ({
  adSlot: propAdSlot = '',
  className = '',
  style = {}
}) => {
  const [adSlot, setAdSlot] = useState(propAdSlot);
  const [adEnabled, setAdEnabled] = useState<boolean | null>(null);

  // ⭐ FIX 1: ref for <ins>
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const gdprConsent = localStorage.getItem('gdpr-consent');
    if (gdprConsent === 'false') {
      setAdEnabled(false);
      return;
    }

    if (!propAdSlot) {
      const remoteAdSlot = getRemoteConfigValue('slotId');
      if (remoteAdSlot) {
        setAdSlot(remoteAdSlot);
      }
    }

    const isAdEnabled = gdprConsent === 'true' &&
      getRemoteConfigValue('google_ad_enabled') !== 'false';

    setAdEnabled(isAdEnabled);
  }, [propAdSlot]);

  // ⭐ FIX 2: prevent multiple push() calls
  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.getAttribute("data-loaded")) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current.setAttribute("data-loaded", "true");
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [adSlot]);


  const demoStyles: React.CSSProperties = {
    margin: '20px 0',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: '#6c757d',
    ...style
  };

  if (adEnabled === null) return null;
  if (!adEnabled) return null;

  if (!adSlot) {
    return (
      <div className={`google-ad ${className}`} style={demoStyles}>
        <div style={{ color: 'red', textAlign: 'center' }}>
          Ad slot not configured. Please set up Firebase Remote Config with google_ad_slot.
        </div>
      </div>
    );
  }

  return (
    <div className={`google-ad ${className}`} style={demoStyles}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        Advertisement - Slot: {adSlot}
      </div>

      {/* ⭐ FIX 3: added ref here */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5504771682915102"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>

    </div>
  );
};

export default GoogleAd;
