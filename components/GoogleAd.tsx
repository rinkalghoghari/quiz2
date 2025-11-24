"use client"

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



  if (adEnabled === null) return null;
  if (!adEnabled) return null;

  if (!adSlot) {
    return (
      <div className={`google-ad`}>
        <div style={{ color: 'red', textAlign: 'center' }}>
          Ad slot not configured. Please set up Firebase Remote Config with google_ad_slot.
        </div>
      </div>
    );
  }

  return (
    <div className={`google-ad`}>
   

    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-5504771682915102"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />

    </div>
  );
};

export default GoogleAd;
