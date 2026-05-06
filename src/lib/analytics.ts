// ─── QAIROSS — Client-Side Analytics Tracking ─────────────────────────────────
// Fire-and-forget analytics tracking for public QAIROSS pages
// All calls use .catch() to never block navigation

interface TrackEventPayload {
  miniSiteId: string
  eventType: string
  metadata?: Record<string, unknown>
}

/**
 * Generic event tracker — sends a POST to /api/analytics/track
 * Always fire-and-forget, never blocks the caller
 */
export function trackEvent(
  siteId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): void {
  const payload: TrackEventPayload = {
    miniSiteId: siteId,
    eventType,
    ...(metadata && { metadata }),
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently fail — analytics should never break the UI
  })
}

/**
 * Track a WhatsApp click event
 */
export function trackWhatsAppClick(
  siteId: string,
  phoneNumber: string
): void {
  trackEvent(siteId, "click_whatsapp", { phoneNumber })
}

/**
 * Track a link click event (social links, custom links, etc.)
 */
export function trackLinkClick(
  siteId: string,
  linkType: string,
  url: string
): void {
  trackEvent(siteId, "click_link", { linkType, url })
}

/**
 * Track a QR code scan event
 */
export function trackQRScan(siteId: string): void {
  trackEvent(siteId, "qr_scan")
}
