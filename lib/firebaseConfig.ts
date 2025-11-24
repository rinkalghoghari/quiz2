// lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  Analytics,
  logEvent as firebaseLogEvent,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics instance (set later)
let analytics: Analytics | undefined;

// Remote Config instance
let remoteConfig: RemoteConfig;

// Initialize Analytics only in browser
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        
        // Configure analytics
        setAnalyticsCollectionEnabled(analytics, true);
        
        // Manually log page view after a small delay to ensure proper initialization
        setTimeout(() => {
          if (!analytics) {
            console.warn('Analytics not initialized when trying to log page_view');
            return;
          }
          const path = window.location.pathname + window.location.search;
          firebaseLogEvent(analytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: path,
            debug_mode: process.env.NODE_ENV !== 'production',
            timestamp: new Date().toISOString()
          });
        }, 100);

        // Enable debug mode in development
        if (process.env.NODE_ENV !== 'production') {
          // @ts-expect-error - Debug mode is not in the types
          self.FIREBASE_ANALYTICS_DEBUG_MODE = true;
          console.log('[Firebase] Analytics initialized in debug mode');
        }
      } else {
        console.warn('[Firebase] Analytics not supported in this browser');
      }
    })
    .catch((error) => {
      console.error("[Firebase] Analytics init error ❌", error);
    });
}

// --- Helper: wait until analytics ready ---
export const onAnalyticsReady = (): Promise<void> =>
  new Promise((resolve) => {
    const checkReady = () => {
      if (analytics) {
        resolve();
      } else {
        setTimeout(checkReady, 300);
      }
    };
    checkReady();
  });

// --- Safe logEvent wrapper ---
export const logEvent = (
  eventName: string,
  eventParams?: { [key: string]: string | number | boolean | null | undefined }
) => {
  if (typeof window === "undefined") {
    console.warn("[Firebase] logEvent called on server, skipped ❌");
    return;
  }
  if (!analytics) {
    console.warn("[Firebase] logEvent called before analytics ready ❌");
    return;
  }

  try {
    // Add debug info
    const debugParams = {
      ...eventParams,
      debug_mode: process.env.NODE_ENV !== 'production',
      debug_timestamp: new Date().toISOString(),
    };
    
    firebaseLogEvent(analytics, eventName, debugParams);
    
    // For debugging in console
    if (process.env.NODE_ENV !== 'production') {
    }
  } catch (error) {
    console.error("[Firebase] Error logging event ❌:", error);
  }
};

// Initialize Remote Config
if (typeof window !== "undefined") {
  remoteConfig = getRemoteConfig(app);
  
  // Set minimum fetch interval to 1 hour in production, 1 minute in development
  remoteConfig.settings = {
    fetchTimeoutMillis: 60000, // 1 minute timeout
    minimumFetchIntervalMillis: process.env.NODE_ENV === 'production' ? 3600000 : 60000 // 1 hour in production, 1 minute in development
  };

  // Set default values
  remoteConfig.defaultConfig = {
    google_ad_slot: '1279565299',
    google_ad_enabled: 'true'
  };

  // Fetch and activate config
  fetchAndActivate(remoteConfig)
    .then(() => {
      console.log('Remote Config fetched and activated');
    })
    .catch((err) => {
      console.error('Error fetching Remote Config', err);
    });
}

// Function to get Remote Config value
export const getRemoteConfigValue = (key: string): string => {
  if (typeof window === "undefined") return '';
  return getValue(remoteConfig, key).asString();
};

export { analytics, app, remoteConfig };
