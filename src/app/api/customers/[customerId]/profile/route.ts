import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { customerId } = await params

    // Fetch the customer
    const customer = await db.businessCustomer.findUnique({
      where: { id: customerId },
      include: {
        site: {
          select: { clientId: true },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Auth check: must be site owner OR the customer themselves
    const isOwner = await verifySiteOwnership(customer.siteId, session.user.id)
    const isCustomer = customer.userId === session.user.id

    if (!isOwner && !isCustomer) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      birthday,
      gender,
      city,
      postalCode,
      hasWhatsapp,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {
      profileCompleted: true,
    }

    if (firstName !== undefined) updateData.firstName = firstName.trim() || null
    if (lastName !== undefined) updateData.lastName = lastName.trim() || null
    if (email !== undefined) updateData.email = email.trim() || null
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null
    if (gender !== undefined) updateData.gender = gender || null
    if (city !== undefined) updateData.city = city.trim() || null
    if (postalCode !== undefined) updateData.postalCode = postalCode.trim() || null
    if (hasWhatsapp !== undefined) updateData.hasWhatsapp = hasWhatsapp === true

    // Validate gender if provided
    if (gender && !["masculino", "femenino", "prefiero no decir"].includes(gender)) {
      return NextResponse.json(
        { error: "Género inválido" },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "Correo electrónico inválido" },
          { status: 400 }
        )
      }
    }

    const updated = await db.businessCustomer.update({
      where: { id: customerId },
      data: updateData,
    })

    return NextResponse.json({ customer: updated })
  } catch (error) {
    console.error("Error updating customer profile:", error)
    return NextResponse.json(
      { error: "Error al actualizar perfil del cliente" },
      { status: 500 }
    )
  }
}

async function verifySiteOwnership(siteId: string, userId: string): Promise<boolean> {
  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: { clientId: true },
  })
  if (!site) return false
  const client = await db.client.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  })
  if (!client) return false
  return site.clientId === client.id
}
