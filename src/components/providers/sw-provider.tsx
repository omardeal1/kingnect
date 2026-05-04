"use client";

import { useEffect } from "react";

export function SWProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Service Worker registered successfully:", registration.scope);
        })
        .catch((error) => {
          console.error("[SW] Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
