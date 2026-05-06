import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ─── GET: List all employees across the platform (admin only) ─────────────────

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status") || "all"

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          role: {
            include: { permissions: true },
          },
          user: {
            select: {
              name: true,
              client: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
        },
        orderBy: { invitedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.employee.count({ where }),
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin employees GET error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// ─── POST: Admin create employee for any client ───────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, roleId, invitedBy, accessExpiresAt } = body

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

    const employee = await db.employee.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        roleId,
        invitedBy: invitedBy || null,
        accessExpiresAt: accessExpiresAt ? new Date(accessExpiresAt) : null,
        isActive: true,
      },
      include: {
        role: {
          include: { permissions: true },
        },
        user: {
          select: {
            name: true,
            client: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    console.error("Admin employee create error:", error)
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    )
  }
}

// ─── PUT: Admin update any employee ───────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
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
          include: { permissions: true },
        },
        user: {
          select: {
            name: true,
            client: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ employee })
  } catch (error) {
    console.error("Admin employee update error:", error)
    return NextResponse.json(
      { error: "Error al actualizar empleado" },
      { status: 500 }
    )
  }
}

// ─── DELETE: Admin remove any employee ────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
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

    await db.employee.delete({ where: { id: employeeId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin employee delete error:", error)
    return NextResponse.json(
      { error: "Error al eliminar empleado" },
      { status: 500 }
    )
  }
}
