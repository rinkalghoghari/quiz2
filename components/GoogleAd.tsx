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
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const isAdPushed = useRef(false);

  // Initialize ad settings
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

  // Push ad to AdSense
  useEffect(() => {
    if (!adEnabled || !adSlot || isAdPushed.current) return;

    const pushAd = () => {
      try {
        if (adRef.current && typeof window !== 'undefined') {
          // Check if adsbygoogle is loaded
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isAdPushed.current = true;
            setIsAdLoaded(true);
          } else {
            // Retry after a short delay if script not loaded yet
            setTimeout(pushAd, 100);
          }
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Wait a bit for the ad element to be in DOM
    const timer = setTimeout(pushAd, 100);
    return () => clearTimeout(timer);
  }, [adEnabled, adSlot]);

  if (adEnabled === null) return null;
  if (!adEnabled) return null;

  if (!adSlot) {
    return (
      <div className={`google-ad ${className}`}>
        <div style={{ color: 'red', textAlign: 'center' }}>
          Ad slot not configured. Please set up Firebase Remote Config with google_ad_slot.
        </div>
      </div>
    );
  }

  return (
    <div className={`google-ad ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-5504771682915102"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;