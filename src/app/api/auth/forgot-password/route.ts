import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

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

    // Check if user exists, but always return success to avoid revealing
    // whether an email is registered
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      // In production, send password reset email here
      // For now, we just acknowledge the request
      console.log(`Password reset requested for: ${email}`)

      // Could create a verification token for password reset:
      // await db.verificationToken.create({
      //   data: {
      //     identifier: email,
      //     token: crypto.randomUUID(),
      //     expires: new Date(Date.now() + 3600000), // 1 hour
      //   },
      // })
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
