import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  exchangeCodeForTokens,
  getPrimaryCalendar,
} from "@/lib/google-calendar"
import { cookies } from "next/headers"
import { APP_URL } from "@/lib/constants"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("Google OAuth error:", error)
      return NextResponse.redirect(
        `${APP_URL}/dashboard?calendar_error=access_denied`
      )
    }

    if (!code || !state) {
      console.error("Missing code or state in Google callback")
      return NextResponse.redirect(
        `${APP_URL}/dashboard?calendar_error=missing_params`
      )
    }

    // Verify state from cookie for CSRF protection
    const cookieStore = await cookies()
    const storedState = cookieStore.get("google_cal_oauth_state")?.value

    // Clean up the state cookie
    cookieStore.delete("google_cal_oauth_state")

    // Extract siteId from state (format: siteId:randomUUID)
    const [siteId] = state.split(":")

    // For CSRF: check that the siteId part matches
    if (!storedState || !storedState.startsWith(siteId)) {
      console.error("CSRF state mismatch")
      return NextResponse.redirect(
        `${APP_URL}/dashboard?calendar_error=invalid_state`
      )
    }

    // Exchange code for tokens
    const tokenResult = await exchangeCodeForTokens(code)
    if (!tokenResult) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard?calendar_error=token_exchange_failed`
      )
    }

    // Get primary calendar ID
    const calendarId = await getPrimaryCalendar(tokenResult.accessToken)

    // Store tokens in ReservationConfig
    await db.reservationConfig.upsert({
      where: { siteId },
      create: {
        siteId,
        googleCalendarConnected: true,
        googleAccessToken: tokenResult.accessToken,
        googleRefreshToken: tokenResult.refreshToken || null,
        googleTokenExpiry: tokenResult.expiry,
        googleCalendarId: calendarId,
      },
      update: {
        googleCalendarConnected: true,
        googleAccessToken: tokenResult.accessToken,
        googleRefreshToken: tokenResult.refreshToken || null,
        googleTokenExpiry: tokenResult.expiry,
        googleCalendarId: calendarId,
      },
    })

    // Redirect to the editor page with success
    return NextResponse.redirect(
      `${APP_URL}/dashboard/sites/${siteId}/edit?calendar=connected`
    )
  } catch (error) {
    console.error("Error in Google Calendar callback:", error)
    return NextResponse.redirect(
      `${APP_URL}/dashboard?calendar_error=internal_error`
    )
  }
}
