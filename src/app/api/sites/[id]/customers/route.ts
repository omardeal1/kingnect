import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import crypto from "crypto"

async function verifyOwnership(siteId: string, userId: string) {
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

function generateQrCode(): string {
  const bytes = crypto.randomBytes(8)
  return bytes.toString("hex").toUpperCase()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const profileCompleted = searchParams.get("profileCompleted")

    const where: Record<string, unknown> = { siteId: id }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (profileCompleted !== null && profileCompleted !== undefined) {
      where.profileCompleted = profileCompleted === "true"
    }

    const [customers, total] = await Promise.all([
      db.businessCustomer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.businessCustomer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Customer registration can be public (no auth required)
    // but we verify the site exists
    const site = await db.miniSite.findUnique({
      where: { id },
      select: { id: true, businessName: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()

    const {
      firstName,
      lastName,
      phone,
      email,
      birthday,
      gender,
      city,
      postalCode,
      hasWhatsapp,
      registrationMethod,
    } = body

    // Phone is required
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "El teléfono es requerido" },
        { status: 400 }
      )
    }

    // Check if customer with same phone already exists for this site
    const existingCustomer = await db.businessCustomer.findFirst({
      where: {
        siteId: id,
        phone: phone.trim(),
      },
    })

    if (existingCustomer) {
      return NextResponse.json({
        customer: existingCustomer,
        message: "Este cliente ya está registrado",
        isNew: false,
      })
    }

    // Generate unique QR check-in code
    let qrCode = generateQrCode()
    let codeExists = await db.businessCustomer.findUnique({
      where: { qrCheckinCode: qrCode },
    })
    while (codeExists) {
      qrCode = generateQrCode()
      codeExists = await db.businessCustomer.findUnique({
        where: { qrCheckinCode: qrCode },
      })
    }

    // Get enabled fields to determine profile completion
    const fieldConfigs = await db.registrationFieldConfig.findMany({
      where: { siteId: id, isEnabled: true },
      select: { fieldName: true },
    })

    const requiredFieldNames = fieldConfigs.map((f) => f.fieldName)
    const profileCompleted = requiredFieldNames.every((fName) => {
      switch (fName) {
        case "first_name":
          return !!firstName?.trim()
        case "last_name":
          return !!lastName?.trim()
        case "phone":
          return !!phone?.trim()
        case "email":
          return !!email?.trim()
        case "whatsapp":
          return hasWhatsapp === true || hasWhatsapp === false
        case "birthday":
          return !!birthday
        case "gender":
          return !!gender
        case "city":
          return !!city?.trim()
        case "postal_code":
          return !!postalCode?.trim()
        default:
          return true
      }
    })

    // Create new customer
    const customer = await db.businessCustomer.create({
      data: {
        siteId: id,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phone: phone.trim(),
        hasWhatsapp: hasWhatsapp === true,
        email: email?.trim() || null,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        registrationMethod: registrationMethod || "manual",
        profileCompleted,
        qrCheckinCode: qrCode,
      },
    })

    return NextResponse.json(
      { customer, message: "Cliente registrado exitosamente", isNew: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error registering customer:", error)
    return NextResponse.json(
      { error: "Error al registrar cliente" },
      { status: 500 }
    )
  }
}
