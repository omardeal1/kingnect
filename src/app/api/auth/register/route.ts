import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { rateLimitRegister } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  businessName: z.string().min(2, "El nombre del negocio debe tener al menos 2 caracteres"),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 60) // Limit length
}

async function generateUniqueSlug(businessName: string): Promise<string> {
  const baseSlug = slugify(businessName)

  if (!baseSlug) {
    // Fallback if slugification results in empty string
    return `site-${Date.now()}`
  }

  let slug = baseSlug
  let counter = 1

  while (await db.miniSite.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitResult = rateLimitRegister(ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: "Demasiados intentos de registro. Intenta de nuevo más tarde." }, { status: 429 })
    }

    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || "Datos inválidos" },
        { status: 400 }
      )
    }

    const { name, email, password, businessName } = result.data

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user with client, subscription, and Kinec in a transaction
    const user = await db.$transaction(async (tx) => {
      // 1. Create user with role "client"
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: "client",
        },
      })

      // 2. Create client record
      const client = await tx.client.create({
        data: {
          ownerUserId: newUser.id,
          businessName,
          contactName: name,
          email: email.toLowerCase(),
          pipelineStatus: "active",
          accountStatus: "active",
        },
      })

      // 3. Find the "trial" plan (seeded in database)
      let plan = await tx.plan.findFirst({
        where: { slug: "trial" },
      })

      if (!plan) {
        // Fallback: try to find any active plan with price 0
        plan = await tx.plan.findFirst({
          where: { price: 0, isActive: true },
        })
      }

      if (!plan) {
        throw new Error("No se encontró un plan de trial disponible")
      }

      // 4. Create trial subscription (30 days)
      const now = new Date()
      const trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + 30)

      await tx.subscription.create({
        data: {
          clientId: client.id,
          planId: plan.id,
          status: "trial",
          trialStart: now,
          trialEnd: trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      })

      // 5. Create default Kinec with slug derived from businessName
      const slug = await generateUniqueSlug(businessName)

      // We need to check uniqueness within the transaction as well
      const existingSite = await tx.miniSite.findUnique({
        where: { slug },
      })

      let finalSlug = slug
      if (existingSite) {
        finalSlug = `${slug}-${Date.now()}`
      }

      await tx.miniSite.create({
        data: {
          clientId: client.id,
          slug: finalSlug,
          businessName,
          description: `Kinec de ${businessName}`,
          accentColor: "#D4A849",
          isActive: true,
          isPublished: false,
          showKingBrand: true,
        },
      })

      return newUser
    })

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}
