import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

const VALID_FIELD_NAMES = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "whatsapp",
  "birthday",
  "gender",
  "city",
  "postal_code",
  "custom_1",
  "custom_2",
] as const

const REQUIRED_FIELDS = ["first_name", "phone"] as const

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

    const configs = await db.registrationFieldConfig.findMany({
      where: { siteId: id },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error("Error fetching registration fields:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración de campos" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const fields: Array<{
      fieldName: string
      isEnabled: boolean
      label?: string
      message?: string
      sortOrder: number
    }> = body.fields

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: "fields debe ser un arreglo" },
        { status: 400 }
      )
    }

    // Validate all field names
    for (const field of fields) {
      if (!VALID_FIELD_NAMES.includes(field.fieldName as (typeof VALID_FIELD_NAMES)[number])) {
        return NextResponse.json(
          { error: `Nombre de campo inválido: ${field.fieldName}` },
          { status: 400 }
        )
      }
    }

    // Batch upsert each field config
    const results = await Promise.all(
      fields.map((field) => {
        // Required fields cannot be disabled
        const isEnabled = (REQUIRED_FIELDS as readonly string[]).includes(field.fieldName)
          ? true
          : field.isEnabled

        return db.registrationFieldConfig.upsert({
          where: {
            siteId_fieldName: {
              siteId: id,
              fieldName: field.fieldName,
            },
          },
          create: {
            siteId: id,
            fieldName: field.fieldName,
            isEnabled,
            label: field.label || null,
            message: field.message || null,
            sortOrder: field.sortOrder ?? 0,
          },
          update: {
            isEnabled,
            label: field.label || null,
            message: field.message || null,
            sortOrder: field.sortOrder ?? 0,
          },
        })
      })
    )

    return NextResponse.json({ configs: results })
  } catch (error) {
    console.error("Error updating registration fields:", error)
    return NextResponse.json(
      { error: "Error al actualizar configuración de campos" },
      { status: 500 }
    )
  }
}
