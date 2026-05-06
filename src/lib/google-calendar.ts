/**
 * Google Calendar API Helper
 * Uses manual OAuth approach with fetch to Google's token endpoints.
 * All functions return null on failure (never throw for Calendar ops).
 */

interface TokenResult {
  accessToken: string
  refreshToken: string
  expiry: Date
}

interface CalendarConfig {
  googleAccessToken: string
  googleRefreshToken: string | null
  googleTokenExpiry: Date | null
  googleCalendarId: string | null
}

interface CalendarEvent {
  summary: string
  description?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
  attendees?: { email: string }[]
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"

function getClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || ""
}

function getClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || ""
}

function getRedirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI || ""
}

/**
 * Refresh an expired access token using the refresh token.
 * Returns new token data or null on failure.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResult | null> {
  try {
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    if (!clientId || !clientSecret || !refreshToken) return null

    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!res.ok) {
      console.error("Google token refresh failed:", await res.text())
      return null
    }

    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiry: new Date(Date.now() + data.expires_in * 1000),
    }
  } catch (error) {
    console.error("Error refreshing Google access token:", error)
    return null
  }
}

/**
 * Get a valid access token, refreshing if necessary.
 */
async function getValidAccessToken(
  config: CalendarConfig
): Promise<{ token: string; newExpiry?: Date; newRefreshToken?: string } | null> {
  const now = new Date()
  // Consider token expired if within 5 minutes of expiry
  const isExpired =
    !config.googleTokenExpiry || config.googleTokenExpiry <= new Date(now.getTime() + 5 * 60 * 1000)

  if (isExpired && config.googleRefreshToken) {
    const result = await refreshAccessToken(config.googleRefreshToken)
    if (result) {
      return {
        token: result.accessToken,
        newExpiry: result.expiry,
        newRefreshToken:
          result.refreshToken !== config.googleRefreshToken
            ? result.refreshToken
            : undefined,
      }
    }
    return null
  }

  return { token: config.googleAccessToken }
}

/**
 * Get the primary calendar ID for the authenticated user.
 */
export async function getPrimaryCalendar(
  accessToken: string
): Promise<string | null> {
  try {
    const res = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList/primary`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error("Failed to get primary calendar:", await res.text())
      return null
    }

    const data = await res.json()
    return data.id || null
  } catch (error) {
    console.error("Error getting primary calendar:", error)
    return null
  }
}

/**
 * Create a Google Calendar event.
 * Returns the event ID or null on failure.
 */
export async function createEvent(
  config: CalendarConfig,
  reservation: {
    customerName: string
    customerEmail?: string | null
    reservationDate: Date
    timeSlot: string
    partySize: number
    notes?: string | null
  },
  siteBusinessName?: string
): Promise<string | null> {
  try {
    const tokenResult = await getValidAccessToken(config)
    if (!tokenResult) return null

    // Parse timeSlot to build start/end times
    const [startStr] = reservation.timeSlot.split(" - ")
    const [hours, minutes] = (startStr || "00:00").split(":").map(Number)

    const startDate = new Date(reservation.reservationDate)
    startDate.setHours(hours, minutes, 0, 0)

    // Default 1 hour event if no duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    const calendarId = config.googleCalendarId || "primary"
    const summary = siteBusinessName
      ? `Reserva: ${siteBusinessName} — ${reservation.customerName}`
      : `Reserva — ${reservation.customerName}`

    const event: CalendarEvent = {
      summary,
      description: reservation.notes || `Reserva para ${reservation.partySize} persona(s)`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "America/Mexico_City",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "America/Mexico_City",
      },
    }

    if (reservation.customerEmail) {
      event.attendees = [{ email: reservation.customerEmail }]
    }

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )

    if (!res.ok) {
      console.error("Failed to create Google Calendar event:", await res.text())
      return null
    }

    const data = await res.json()
    return {
      eventId: data.id || null,
      newExpiry: tokenResult.newExpiry,
      newRefreshToken: tokenResult.newRefreshToken,
    } as unknown as string | null
  } catch (error) {
    console.error("Error creating Google Calendar event:", error)
    return null
  }
}

/**
 * Extended return type for createEvent that includes token update info.
 */
export interface CreateEventResult {
  eventId: string | null
  newExpiry?: Date
  newRefreshToken?: string
}

/**
 * Create a Google Calendar event (extended version with token update info).
 */
export async function createEventExtended(
  config: CalendarConfig,
  reservation: {
    customerName: string
    customerEmail?: string | null
    reservationDate: Date
    timeSlot: string
    partySize: number
    notes?: string | null
  },
  siteBusinessName?: string
): Promise<CreateEventResult> {
  try {
    const tokenResult = await getValidAccessToken(config)
    if (!tokenResult) return { eventId: null }

    const [startStr] = reservation.timeSlot.split(" - ")
    const [hours, minutes] = (startStr || "00:00").split(":").map(Number)

    const startDate = new Date(reservation.reservationDate)
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    const calendarId = config.googleCalendarId || "primary"
    const summary = siteBusinessName
      ? `Reserva: ${siteBusinessName} — ${reservation.customerName}`
      : `Reserva — ${reservation.customerName}`

    const event: CalendarEvent = {
      summary,
      description: reservation.notes || `Reserva para ${reservation.partySize} persona(s)`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "America/Mexico_City",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "America/Mexico_City",
      },
    }

    if (reservation.customerEmail) {
      event.attendees = [{ email: reservation.customerEmail }]
    }

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )

    if (!res.ok) {
      console.error("Failed to create Google Calendar event:", await res.text())
      return { eventId: null }
    }

    const data = await res.json()
    return {
      eventId: data.id || null,
      newExpiry: tokenResult.newExpiry,
      newRefreshToken: tokenResult.newRefreshToken,
    }
  } catch (error) {
    console.error("Error creating Google Calendar event:", error)
    return { eventId: null }
  }
}

/**
 * Update a Google Calendar event.
 * Returns true on success, null on failure.
 */
export async function updateEvent(
  config: CalendarConfig,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<boolean | null> {
  try {
    const tokenResult = await getValidAccessToken(config)
    if (!tokenResult) return null

    const calendarId = config.googleCalendarId || "primary"

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    )

    if (!res.ok) {
      console.error("Failed to update Google Calendar event:", await res.text())
      return null
    }

    return true
  } catch (error) {
    console.error("Error updating Google Calendar event:", error)
    return null
  }
}

/**
 * Delete a Google Calendar event.
 * Returns true on success, null on failure.
 */
export async function deleteEvent(
  config: CalendarConfig,
  eventId: string
): Promise<boolean | null> {
  try {
    const tokenResult = await getValidAccessToken(config)
    if (!tokenResult) return null

    const calendarId = config.googleCalendarId || "primary"

    const res = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
        },
      }
    )

    // Google returns 204 on successful delete
    if (res.status !== 204 && !res.ok) {
      console.error("Failed to delete Google Calendar event:", await res.text())
      return null
    }

    return true
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error)
    return null
  }
}

/**
 * Generate the Google OAuth authorization URL.
 */
export function getGoogleAuthUrl(siteId: string): string {
  const clientId = getClientId()
  const redirectUri = getRedirectUri()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: siteId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<{ accessToken: string; refreshToken: string; expiry: Date } | null> {
  try {
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    const redirectUri = getRedirectUri()

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing Google OAuth configuration")
      return null
    }

    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!res.ok) {
      console.error("Failed to exchange code for tokens:", await res.text())
      return null
    }

    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || "",
      expiry: new Date(Date.now() + data.expires_in * 1000),
    }
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    return null
  }
}

export type { CalendarConfig, CalendarEvent }
