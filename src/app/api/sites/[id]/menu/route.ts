import { NextRequest } from "next/server"
import { getAuthenticatedUser, verifySiteOwnership, errorResponse, successResponse } from "@/lib/api-helpers"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return errorResponse("No autorizado", 401)

    const { id } = await params
    if (!(await verifySiteOwnership(user.id, id))) return errorResponse("No autorizado", 403)

    const categories = await db.menuCategory.findMany({
      where: { miniSiteId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    return successResponse({ menuCategories: categories })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return errorResponse("Error al obtener menú", 500)
  }
}

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

    if (type === "category") {
      const { name, enabled, sortOrder } = body
      if (!name) return errorResponse("Nombre de categoría es requerido")

      const category = await db.menuCategory.create({
        data: {
          miniSiteId: id,
          name,
          enabled: enabled ?? true,
          sortOrder: sortOrder ?? 0,
        },
      })

      return successResponse({ menuCategory: category }, 201)
    }

    if (type === "item") {
      const { categoryId, name, description, price, imageUrl, isOrderable, enabled, sortOrder } = body
      if (!categoryId || !name) return errorResponse("categoryId y nombre son requeridos")

      // Verify category belongs to this site
      const category = await db.menuCategory.findUnique({ where: { id: categoryId } })
      if (!category || category.miniSiteId !== id) return errorResponse("Categoría no encontrada", 404)

      const item = await db.menuItem.create({
        data: {
          miniSiteId: id,
          categoryId,
          name,
          description: description || null,
          price: price ?? null,
          imageUrl: imageUrl || null,
          isOrderable: isOrderable ?? false,
          enabled: enabled ?? true,
          sortOrder: sortOrder ?? 0,
        },
      })

      return successResponse({ menuItem: item }, 201)
    }

    return errorResponse("Tipo debe ser 'category' o 'item'")
  } catch (error) {
    console.error("Error creating menu item:", error)
    return errorResponse("Error al crear elemento del menú", 500)
  }
}

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
    const { type, id: itemId } = body

    if (!type || !itemId) return errorResponse("type e id son requeridos")

    if (type === "category") {
      const { name, enabled, sortOrder } = body

      const existing = await db.menuCategory.findUnique({ where: { id: itemId } })
      if (!existing || existing.miniSiteId !== id) return errorResponse("Categoría no encontrada", 404)

      const category = await db.menuCategory.update({
        where: { id: itemId },
        data: {
          ...(name !== undefined && { name }),
          ...(enabled !== undefined && { enabled }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      })

      return successResponse({ menuCategory: category })
    }

    if (type === "item") {
      const { name, description, price, imageUrl, isOrderable, enabled, sortOrder, categoryId } = body

      const existing = await db.menuItem.findUnique({ where: { id: itemId } })
      if (!existing || existing.miniSiteId !== id) return errorResponse("Item no encontrado", 404)

      // If changing category, verify it belongs to same site
      if (categoryId) {
        const cat = await db.menuCategory.findUnique({ where: { id: categoryId } })
        if (!cat || cat.miniSiteId !== id) return errorResponse("Categoría no encontrada", 404)
      }

      const item = await db.menuItem.update({
        where: { id: itemId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(isOrderable !== undefined && { isOrderable }),
          ...(enabled !== undefined && { enabled }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(categoryId !== undefined && { categoryId }),
        },
      })

      return successResponse({ menuItem: item })
    }

    return errorResponse("Tipo debe ser 'category' o 'item'")
  } catch (error) {
    console.error("Error updating menu item:", error)
    return errorResponse("Error al actualizar elemento del menú", 500)
  }
}

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
    const { type, id: itemId } = body

    if (!type || !itemId) return errorResponse("type e id son requeridos")

    if (type === "category") {
      const existing = await db.menuCategory.findUnique({ where: { id: itemId } })
      if (!existing || existing.miniSiteId !== id) return errorResponse("Categoría no encontrada", 404)

      await db.menuCategory.delete({ where: { id: itemId } })
      return successResponse({ deleted: true })
    }

    if (type === "item") {
      const existing = await db.menuItem.findUnique({ where: { id: itemId } })
      if (!existing || existing.miniSiteId !== id) return errorResponse("Item no encontrado", 404)

      await db.menuItem.delete({ where: { id: itemId } })
      return successResponse({ deleted: true })
    }

    return errorResponse("Tipo debe ser 'category' o 'item'")
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return errorResponse("Error al eliminar elemento del menú", 500)
  }
}
