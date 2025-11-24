'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GdprConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('gdpr-consent');
    if (consent === null) {
      setShowConsent(true);
    } else {
      setConsentGiven(consent === 'true');
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem('gdpr-consent', 'true');
    setConsentGiven(true);
    setShowConsent(false);
      window.location.reload();

    // Initialize analytics and ads here if needed
  };

  const denyConsent = () => {
    localStorage.setItem('gdpr-consent', 'false');
    setConsentGiven(false);
    setShowConsent(false);
    // Disable analytics and ads here if needed
  };

  // Don't show anything if consent is already given or if we're still checking
  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-6">
          <p className="text-sm md:text-base">
            We use cookies and similar technologies to improve your experience on our website. 
            By clicking &quot;Accept All&quot; you consent to our use of cookies and to our{' '}
            <Link href="/privacy-policy" className="text-blue-300 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={denyConsent}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
          >
            Reject All
          </button>
          <button
            onClick={acceptConsent}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
