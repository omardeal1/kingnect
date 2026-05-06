import { NextRequest } from "next/server"
import { getAuthenticatedUser, verifySiteOwnership, errorResponse, successResponse } from "@/lib/api-helpers"
import { db } from "@/lib/db"
import { modifierCache } from "@/lib/cache"

// ─── GET: Fetch all modifier groups for a site ───────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check cache first
    const cacheKey = `modifiers:${id}`
    const cached = modifierCache.get(cacheKey)
    if (cached) return successResponse(cached)

    const user = await getAuthenticatedUser()
    if (!user) return errorResponse("No autorizado", 401)
    if (!(await verifySiteOwnership(user.id, id))) return errorResponse("No autorizado", 403)

    const groups = await db.modifierGroup.findMany({
      where: { siteId: id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    // Cache the result
    modifierCache.set(cacheKey, { modifierGroups: groups })
    return successResponse({ modifierGroups: groups })
  } catch (error) {
    console.error("Error fetching modifiers:", error)
    return errorResponse("Error al obtener modificadores", 500)
  }
}

// ─── POST: Create modifier group or option ──────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return errorResponse("No autorizado", 401)

    const { id } = await params
    if (!(await verifySiteOwnership(user.id, id))) return errorResponse("No autorizado", 403)

    const body = await request.json()
    const { type } = body

    // Invalidate cache
    modifierCache.invalidate(`modifiers:${id}`)

    if (type === "group") {
      const { name, selectionType, isRequired, productId, isTemplate, sortOrder } = body
      if (!name) return errorResponse("Nombre del grupo es requerido")

      const group = await db.modifierGroup.create({
        data: {
          siteId: id,
          name,
          selectionType: selectionType || "single",
          isRequired: isRequired ?? false,
          productId: productId || null,
          isTemplate: isTemplate ?? false,
          sortOrder: sortOrder ?? 0,
        },
        include: { options: true },
      })

      return successResponse({ modifierGroup: group }, 201)
    }

    if (type === "option") {
      const { groupId, name, extraCost, hasExtraCost, sortOrder } = body
      if (!groupId || !name) return errorResponse("groupId y nombre son requeridos")

      // Verify group belongs to this site
      const group = await db.modifierGroup.findUnique({ where: { id: groupId } })
      if (!group || group.siteId !== id) return errorResponse("Grupo no encontrado", 404)

      const option = await db.modifierOption.create({
        data: {
          groupId,
          name,
          extraCost: extraCost ?? 0,
          hasExtraCost: hasExtraCost ?? false,
          sortOrder: sortOrder ?? 0,
        },
      })

      return successResponse({ modifierOption: option }, 201)
    }

    if (type === "duplicate_group") {
      const { sourceGroupId, newName } = body
      if (!sourceGroupId || !newName) return errorResponse("sourceGroupId y newName son requeridos")

      const sourceGroup = await db.modifierGroup.findUnique({
        where: { id: sourceGroupId },
        include: { options: true },
      })
      if (!sourceGroup || sourceGroup.siteId !== id) return errorResponse("Grupo origen no encontrado", 404)

      const newGroup = await db.modifierGroup.create({
        data: {
          siteId: id,
          name: newName,
          selectionType: sourceGroup.selectionType,
          isRequired: sourceGroup.isRequired,
          productId: sourceGroup.productId,
          isTemplate: true,
          sortOrder: sourceGroup.sortOrder,
          options: {
            create: sourceGroup.options.map((opt) => ({
              name: opt.name,
              extraCost: opt.extraCost,
              hasExtraCost: opt.hasExtraCost,
              sortOrder: opt.sortOrder,
            })),
          },
        },
        include: { options: true },
      })

      return successResponse({ modifierGroup: newGroup }, 201)
    }

    return errorResponse("Tipo debe ser 'group', 'option' o 'duplicate_group'")
  } catch (error) {
    console.error("Error creating modifier:", error)
    return errorResponse("Error al crear modificador", 500)
  }
}

// ─── PUT: Update modifier group or option ────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return errorResponse("No autorizado", 401)

    const { id } = await params
    if (!(await verifySiteOwnership(user.id, id))) return errorResponse("No autorizado", 403)

    const body = await request.json()
    const { type } = body

    // Invalidate cache
    modifierCache.invalidate(`modifiers:${id}`)

    if (type === "group") {
      const { groupId, ...fields } = body
      if (!groupId) return errorResponse("groupId es requerido")

      const existing = await db.modifierGroup.findUnique({ where: { id: groupId } })
      if (!existing || existing.siteId !== id) return errorResponse("Grupo no encontrado", 404)

      const { productId, name, selectionType, isRequired, isActive, sortOrder, isTemplate } = fields

      const group = await db.modifierGroup.update({
        where: { id: groupId },
        data: {
          ...(name !== undefined && { name }),
          ...(selectionType !== undefined && { selectionType }),
          ...(isRequired !== undefined && { isRequired }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(isTemplate !== undefined && { isTemplate }),
          ...(productId !== undefined && { productId: productId || null }),
        },
        include: { options: true },
      })

      return successResponse({ modifierGroup: group })
    }

    if (type === "option") {
      const { optionId, ...fields } = body
      if (!optionId) return errorResponse("optionId es requerido")

      const existing = await db.modifierOption.findUnique({
        where: { id: optionId },
        include: { group: true },
      })
      if (!existing || existing.group.siteId !== id) return errorResponse("Opción no encontrada", 404)

      const { name, extraCost, hasExtraCost, isActive, sortOrder } = fields

      const option = await db.modifierOption.update({
        where: { id: optionId },
        data: {
          ...(name !== undefined && { name }),
          ...(extraCost !== undefined && { extraCost }),
          ...(hasExtraCost !== undefined && { hasExtraCost }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      })

      return successResponse({ modifierOption: option })
    }

    if (type === "assign_to_product") {
      const { groupId, productId } = body
      if (!groupId) return errorResponse("groupId es requerido")

      const existing = await db.modifierGroup.findUnique({ where: { id: groupId } })
      if (!existing || existing.siteId !== id) return errorResponse("Grupo no encontrado", 404)

      if (productId) {
        const product = await db.menuItem.findUnique({ where: { id: productId } })
        if (!product || product.miniSiteId !== id) return errorResponse("Producto no encontrado", 404)

        const group = await db.modifierGroup.update({
          where: { id: groupId },
          data: { productId },
          include: { options: true },
        })
        return successResponse({ modifierGroup: group })
      }

      const group = await db.modifierGroup.update({
        where: { id: groupId },
        data: { productId: null },
        include: { options: true },
      })
      return successResponse({ modifierGroup: group })
    }

    return errorResponse("Tipo debe ser 'group', 'option' o 'assign_to_product'")
  } catch (error) {
    console.error("Error updating modifier:", error)
    return errorResponse("Error al actualizar modificador", 500)
  }
}

// ─── DELETE: Delete modifier group or option ─────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return errorResponse("No autorizado", 401)

    const { id } = await params
    if (!(await verifySiteOwnership(user.id, id))) return errorResponse("No autorizado", 403)

    const body = await request.json()
    const { type } = body

    // Invalidate cache
    modifierCache.invalidate(`modifiers:${id}`)

    if (type === "group") {
      const { groupId } = body
      if (!groupId) return errorResponse("groupId es requerido")

      const existing = await db.modifierGroup.findUnique({ where: { id: groupId } })
      if (!existing || existing.siteId !== id) return errorResponse("Grupo no encontrado", 404)

      await db.modifierGroup.delete({ where: { id: groupId } })
      return successResponse({ deleted: true })
    }

    if (type === "option") {
      const { optionId } = body
      if (!optionId) return errorResponse("optionId es requerido")

      const existing = await db.modifierOption.findUnique({
        where: { id: optionId },
        include: { group: true },
      })
      if (!existing || existing.group.siteId !== id) return errorResponse("Opción no encontrada", 404)

      await db.modifierOption.delete({ where: { id: optionId } })
      return successResponse({ deleted: true })
    }

    return errorResponse("Tipo debe ser 'group' o 'option'")
  } catch (error) {
    console.error("Error deleting modifier:", error)
    return errorResponse("Error al eliminar modificador", 500)
  }
}
