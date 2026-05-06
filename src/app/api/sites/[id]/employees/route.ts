import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { randomBytes } from "crypto"

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

// ─── GET: List employees for a site ──────────────────────────────────────────

export async function GET(
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

    const employees = await db.employee.findMany({
      where: { invitedBy: session.user.id },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { invitedAt: "desc" },
    })

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 }
    )
  }
}

// ─── POST: Create employee (invite) ──────────────────────────────────────────

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
    const { name, email, phone, roleId, accessExpiresAt } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio y debe ser válido" },
        { status: 400 }
      )
    }

    if (!roleId || typeof roleId !== "string") {
      return NextResponse.json(
        { error: "El rol es obligatorio" },
        { status: 400 }
      )
    }

    // Verify role exists
    const role = await db.role.findUnique({
      where: { id: roleId },
    })
    if (!role) {
      return NextResponse.json(
        { error: "El rol seleccionado no existe" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await db.employee.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un empleado con ese correo electrónico" },
        { status: 409 }
      )
    }

    // Generate invite token (mock - stored as userId placeholder for now)
    const inviteToken = randomBytes(32).toString("hex")

    const employee = await db.employee.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        roleId,
        invitedBy: session.user.id,
        accessExpiresAt: accessExpiresAt ? new Date(accessExpiresAt) : null,
        isActive: true,
      },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    })

    // Mock: send invite email (in production, integrate with email service)
    console.log(`[MOCK] Invite email sent to ${employee.email} with token: ${inviteToken}`)

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    )
  }
}

// ─── PUT: Update employee ─────────────────────────────────────────────────────

export async function PUT(
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
    const { employeeId, ...fields } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId es requerido" },
        { status: 400 }
      )
    }

    // Verify employee belongs to this inviter
    const existing = await db.employee.findFirst({
      where: { id: employeeId, invitedBy: session.user.id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    // If changing role, verify it exists
    if (fields.roleId && typeof fields.roleId === "string") {
      const role = await db.role.findUnique({ where: { id: fields.roleId } })
      if (!role) {
        return NextResponse.json(
          { error: "El rol seleccionado no existe" },
          { status: 400 }
        )
      }
    }

    // Trim string fields
    const stringFields = ["name", "phone"] as const
    for (const key of stringFields) {
      if (fields[key] !== undefined && typeof fields[key] === "string") {
        fields[key] = fields[key].trim()
      }
    }

    // Handle accessExpiresAt
    if (fields.accessExpiresAt !== undefined) {
      fields.accessExpiresAt = fields.accessExpiresAt
        ? new Date(fields.accessExpiresAt)
        : null
    }

    const employee = await db.employee.update({
      where: { id: employeeId },
      data: fields,
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    })

    return NextResponse.json({ employee })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Error al actualizar empleado" },
      { status: 500 }
    )
  }
}

// ─── DELETE: Remove employee ──────────────────────────────────────────────────

export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId es requerido" },
        { status: 400 }
      )
    }

    // Verify employee belongs to this inviter
    const existing = await db.employee.findFirst({
      where: { id: employeeId, invitedBy: session.user.id },
    })
    if (!existing) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    await db.employee.delete({ where: { id: employeeId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json(
      { error: "Error al eliminar empleado" },
      { status: 500 }
    )
  }
}
