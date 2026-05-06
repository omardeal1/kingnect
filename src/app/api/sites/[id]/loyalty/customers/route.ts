import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import crypto from "crypto"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return crypto.randomBytes(4).toString("hex").toUpperCase()
}

// ─── GET: List customers ──────────────────────────────────────────────────────

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
    const search = searchParams.get("search")?.trim() || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      siteId: id,
      isActive: true,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const [customers, total] = await Promise.all([
      db.businessCustomer.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          hasWhatsapp: true,
          email: true,
          visitsCount: true,
          totalPurchases: true,
          currentProgress: true,
          rewardsEarned: true,
          rewardsRedeemed: true,
          qrCheckinCode: true,
          createdAt: true,
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.businessCustomer.count({ where }),
    ])

    // Get latest activity for each customer
    const customerIds = customers.map((c) => c.id)
    const latestTransactions = customerIds.length > 0
      ? await db.loyaltyTransaction.findMany({
          where: { customerId: { in: customerIds } },
          select: { customerId: true, type: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          distinct: ["customerId"],
        })
      : []

    const latestActivityMap = new Map(
      latestTransactions.map((t) => [t.customerId, t])
    )

    const customersWithActivity = customers.map((c) => ({
      ...c,
      latestActivity: latestActivityMap.get(c.id) || null,
    }))

    return NextResponse.json({
      customers: customersWithActivity,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching loyalty customers:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}

// ─── POST: Register new customer ──────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { phone, firstName, lastName, email, hasWhatsapp, birthday, gender, city, postalCode } = body

    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio (mínimo 6 dígitos)" },
        { status: 400 }
      )
    }

    // Check for existing customer with same phone on this site
    const existingCustomer = await db.businessCustomer.findFirst({
      where: { siteId, phone: phone.trim(), isActive: true },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Ya existe un cliente registrado con ese teléfono" },
        { status: 409 }
      )
    }

    // Get or create loyalty config
    let loyaltyConfig = await db.loyaltyConfig.findUnique({
      where: { siteId },
    })

    if (!loyaltyConfig) {
      loyaltyConfig = await db.loyaltyConfig.create({
        data: { siteId },
      })
    }

    // Generate unique QR code
    let qrCode = generateQrCode()
    let qrExists = await db.businessCustomer.findUnique({
      where: { qrCheckinCode: qrCode },
    })
    while (qrExists) {
      qrCode = generateQrCode()
      qrExists = await db.businessCustomer.findUnique({
        where: { qrCheckinCode: qrCode },
      })
    }

    // Create customer
    const customer = await db.businessCustomer.create({
      data: {
        siteId,
        loyaltyConfigId: loyaltyConfig.siteId,
        phone: phone.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        email: email?.trim() || null,
        hasWhatsapp: hasWhatsapp === true,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        registrationMethod: "manual",
        profileCompleted: !!(firstName && lastName),
        qrCheckinCode: qrCode,
      },
    })

    // If welcome gift is enabled, create reward_earned transaction
    if (loyaltyConfig.welcomeGiftEnabled) {
      await db.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          siteId,
          type: "reward_earned",
          value: 1,
          description: `Regalo de bienvenida: ${loyaltyConfig.welcomeGiftDescription || "Recompensa de bienvenida"}`,
          createdBy: session.user.id,
        },
      })

      // Update customer rewards earned
      await db.businessCustomer.update({
        where: { id: customer.id },
        data: { rewardsEarned: 1 },
      })
    }

    // Re-fetch with updated rewards
    const updatedCustomer = await db.businessCustomer.findUnique({
      where: { id: customer.id },
    })

    return NextResponse.json({ customer: updatedCustomer }, { status: 201 })
  } catch (error) {
    console.error("Error creating loyalty customer:", error)
    return NextResponse.json(
      { error: "Error al registrar cliente" },
      { status: 500 }
    )
  }
}
