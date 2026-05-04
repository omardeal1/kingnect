import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Correo electrónico inválido" },
        { status: 400 }
      )
    }

    const { email } = result.data
    const normalizedEmail = email.toLowerCase()

    // Check if user exists, but always return success to avoid revealing
    // whether an email is registered
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      // Generate a verification token for password reset
      const token = crypto.randomUUID()
      const expires = new Date(Date.now() + 3600000) // 1 hour

      // Delete any existing reset tokens for this email
      await db.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      })

      // Create new verification token
      await db.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      })

      // Send password reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

      try {
        await sendPasswordResetEmail({
          to: normalizedEmail,
          resetUrl,
          businessName: user.name || undefined,
        })
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
        // Don't reveal error to user — still return success message
      }
    }

    // Always return the same success message regardless of whether
    // the email exists in the database
    return NextResponse.json(
      {
        message: "Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    // Still return a generic success to not reveal system state
    return NextResponse.json(
      {
        message: "Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.",
      },
      { status: 200 }
    )
  }
}
