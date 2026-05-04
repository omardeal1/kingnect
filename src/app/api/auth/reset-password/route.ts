import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Datos inválidos" },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido o expirado. Solicita un nuevo enlace de recuperación." },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: "El enlace ha expirado. Solicita un nuevo enlace de recuperación." },
        { status: 400 }
      )
    }

    // Find the user by the token identifier (email)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Update user password and delete the used token in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ])

    return NextResponse.json(
      { message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}
