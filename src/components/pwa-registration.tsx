"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The online app remains usable when a browser or local environment blocks worker registration.
    });
  }, []);

  return null;
}
