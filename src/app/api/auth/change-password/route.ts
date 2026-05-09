import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, hashPassword, verifyPassword } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva son requeridas" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra mayúscula" },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra minúscula" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un número" },
        { status: 400 }
      )
    }

    // Fetch user with password hash
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user
    await db.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
