"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent, onAnalyticsReady } from "../lib/firebaseConfig";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    onAnalyticsReady().then(() => {
      logEvent("page_view", { page: pathname });
    });
  }, [pathname]);

  return null;
}
        