'use client';

import { ReactNode } from 'react';
import GdprConsent from './GdprConsent';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <GdprConsent />
    </>
  );
}
