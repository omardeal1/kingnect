import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import crypto from "crypto"

function generateQrCode(): string {
  const bytes = crypto.randomBytes(8)
  return bytes.toString("hex").toUpperCase()
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const profileCompleted = searchParams.get("profileCompleted")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { site: { businessName: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (profileCompleted !== null && profileCompleted !== undefined) {
      where.profileCompleted = profileCompleted === "true"
    }

    const [customers, total] = await Promise.all([
      db.businessCustomer.findMany({
        where,
        include: {
          site: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              client: {
                select: {
                  id: true,
                  businessName: true,
                  owner: { select: { name: true, email: true } },
                },
              },
            },
          },
          loyaltyConfig: {
            select: {
              isEnabled: true,
              targetValue: true,
            },
          },
        },
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
    console.error("Admin customers GET error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()

    const {
      siteId,
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

    // Validate required fields
    if (!siteId || typeof siteId !== "string") {
      return NextResponse.json(
        { error: "El sitio es requerido" },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "El teléfono es requerido" },
        { status: 400 }
      )
    }

    // Verify the site exists
    const site = await db.miniSite.findUnique({
      where: { id: siteId },
      select: { id: true, businessName: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    // Check if customer with same phone already exists for this site
    const existingCustomer = await db.businessCustomer.findFirst({
      where: {
        siteId: siteId,
        phone: phone.trim(),
      },
    })

    if (existingCustomer) {
      return NextResponse.json({
        customer: existingCustomer,
        message: "Este cliente ya está registrado en este sitio",
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
      where: { siteId: siteId, isEnabled: true },
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
        siteId: siteId,
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

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Cliente agregado manualmente: ${firstName || ""} ${lastName || ""} (${phone}) → ${site.businessName}`,
        entityType: "business_customer",
        entityId: customer.id,
      },
    })

    return NextResponse.json(
      { customer, message: "Cliente registrado exitosamente", isNew: true },
      { status: 201 }
    )
  } catch (error) {
    console.error("Admin customers POST error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
