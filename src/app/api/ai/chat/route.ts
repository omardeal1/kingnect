import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn("[AI Chat] OPENAI_API_KEY is not set. AI chat will be disabled.")
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function callOpenAI(
  messages: { role: string; content: string }[],
  jsonMode = false
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const body: Record<string, unknown> = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.8,
    max_tokens: 3000,
  }

  if (jsonMode) {
    body.response_format = { type: "json_object" }
    body.temperature = 0.4
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[AI Chat] OpenAI error:", err)
    throw new Error(`OpenAI API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = match ? match[1].trim() : text.trim()
  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error(`Invalid JSON response from AI: ${jsonStr.slice(0, 200)}...`)
  }
}

// ─── Build site context for system prompt ──────────────────────────────────

async function getSiteContext(siteId: string): Promise<string> {
  try {
    const site = await db.miniSite.findUnique({
      where: { id: siteId },
      select: {
        businessName: true,
        tagline: true,
        description: true,
        slug: true,
        menuCategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
              select: { name: true, price: true, description: true },
            },
          },
        },
        services: {
          orderBy: { sortOrder: "asc" },
          select: { name: true, price: true, description: true },
        },
        locations: {
          orderBy: { sortOrder: "asc" },
          select: { name: true, address: true },
        },
        branches: {
          orderBy: { name: "asc" },
          select: { name: true, city: true },
        },
      },
    })

    if (!site) return ""

    const categoryNames = site.menuCategories.map((c) => c.name).join(", ")
    const itemNames = site.menuCategories
      .flatMap((c) => c.menuItems.map((i) => i.name))
      .join(", ")
    const serviceNames = site.services.map((s) => s.name).join(", ")
    const locationNames = site.locations
            .map((l) => l.name)
      .join(", ")
    const branchNames = site.branches
            .map((b) => b.name)
      .join(", ")

    return `
INFORMACIÓN DEL NEGOCIO:
- Nombre: ${site.businessName}
- Eslogan: ${site.tagline || "No definido"}
- Descripción: ${site.description || "No definida"}
- Categorías de menú: ${categoryNames || "Ninguna"}
- Productos: ${itemNames || "Ninguno"}
- Servicios: ${serviceNames || "Ninguno"}
- Ubicaciones: ${locationNames || "Ninguna"}
- Sucursales: ${branchNames || "Ninguna"}`.trim()
  } catch (error) {
    console.error("[AI Chat] Error getting site context:", error)
    return ""
  }
}

async function getTodayReservations(siteId: string): Promise<string> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const reservations = await db.reservation.findMany({
      where: {
        siteId,
        reservationDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { timeSlot: "asc" },
      select: {
        customerName: true,
        timeSlot: true,
        partySize: true,
        status: true,
        notes: true,
      },
    })

    if (reservations.length === 0) {
      return "No hay reservaciones programadas para hoy."
    }

    return reservations
      .map(
        (r) =>
          `- ${r.timeSlot}: ${r.customerName} (${r.partySize} persona${r.partySize > 1 ? "s" : ""}) - Estado: ${r.status}${r.notes ? ` - Nota: ${r.notes}` : ""}`
      )
      .join("\n")
  } catch (error) {
    console.error("[AI Chat] Error getting reservations:", error)
    return "No se pudieron obtener las reservaciones."
  }
}

// ─── System prompts ────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `Eres el asistente de IA de QAIROSS, una plataforma que ayuda a negocios a crear su mini web profesional.

Tu tono es:
- Amigable y profesional
- Directo y útil
- En español (a menos que el usuario hable en otro idioma)
- Usas emojis moderadamente para hacerlo más cálido

Conoces la información del negocio del usuario y puedes ayudar con:
- Crear y mejorar menús
- Sugerir precios
- Dar consejos de negocio
- Consultar reservaciones
- Mejorar descripciones de productos y servicios

REGLAS IMPORTANTES:
- Si el usuario pide crear un menú completo, FIRST pregunta la información que necesites (nombre del negocio, tipo, ciudad, estilo) ANTES de generar el JSON
- Si te piden algo que requiera datos que no tienes, pregunta con claridad
- Siempre responde de forma conversacional, NO como robot
- Cuando generes menús como JSON, el formato debe ser exactamente:
{
  "action": "apply_menu",
  "welcomeMessage": "Mensaje de bienvenida",
  "categories": [
    {
      "name": "Categoría",
      "items": [
        {
          "name": "Producto",
          "description": "Descripción atractiva",
          "suggestedPrice": 150
        }
      ]
    }
  ]
}`

// ─── POST Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Las funciones de IA no están configuradas. Configura OPENAI_API_KEY en .env" },
        { status: 503 }
      )
    }

    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { messages, siteId, quickAction } = body

    // ✅ BUG FIXED: Llave de cierre } añadida correctamente
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages es requerido y debe ser un array no vacío" },
        { status: 400 }
      )
    }

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId es requerido" },
        { status: 400 }
      )
    }

    // Verify user owns the site
    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (!client) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    const site = await db.miniSite.findUnique({
      where: { id: siteId },
      select: { clientId: true },
    })

    if (!site || (site.clientId !== client.id && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { error: "No autorizado para este sitio" },
        { status: 403 }
      )
    }

    // ─── Handle quick actions ─────────────────────────────────────

    // Quick action: Today's reservations
    if (quickAction === "today_reservations") {
      const reservations = await getTodayReservations(siteId)
      const context = await getSiteContext(siteId)
      const businessName = context.match(/Nombre: (.+)/)?.[1] || "el negocio"

      const systemMsg = `${BASE_SYSTEM_PROMPT}\n\n${context}`

      const aiMessages = [
        { role: "system", content: systemMsg },
        { role: "user", content: `¿Qué reservaciones tengo hoy?` },
        {
          role: "assistant",
          content: `Aquí tienes el resumen de las reservaciones de hoy para **${businessName}**:\n\n${reservations}\n\n¿Necesitas hacer algo con alguna de estas reservaciones? Puedo ayudarte a gestionarlas.`,
        },
      ]

      return NextResponse.json({
        message: aiMessages[aiMessages.length - 1].content,
        messages: aiMessages,
      })
    }

    // Quick action: Business tips
    if (quickAction === "business_tips") {
      const context = await getSiteContext(siteId)

      const systemMsg = `${BASE_SYSTEM_PROMPT}\n\n${context}

Cuando el usuario pide consejos para su negocio, da 3-5 consejos específicos y prácticos basados en el tipo de negocio. Sé concreto, no genérico.`

      const fullMessages = [
        { role: "system", content: systemMsg },
        ...messages.slice(-6),
      ]

      const response = await callOpenAI(fullMessages)

      return NextResponse.json({
        message: response,
        messages: [...fullMessages, { role: "assistant", content: response }],
      })
    }

    // ─── Handle generate_menu action ──────────────────────────────
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ""

    const isMenuCreationFlow = messages.some(
      (m: { role: string; content: string }) =>
        m.role === "assistant" &&
        m.content.includes("crear") &&
        m.content.includes("menú")
    )

    const wantsToGenerate =
      lastUserMsg.includes("genera") ||
      lastUserMsg.includes("crear") ||
      lastUserMsg.includes("sí") ||
      lastUserMsg.includes("si,") ||
      lastUserMsg.includes("perfecto") ||
      lastUserMsg.includes("dale") ||
      lastUserMsg.includes("adelante")

    if (wantsToGenerate && isMenuCreationFlow) {
      const conversationContext = messages
        .filter((m: { role: string; content: string }) => m.role === "user")
        .map((m: { content: string }) => m.content)
        .join("\n")

      const menuSystemPrompt = `Eres un experto en menús de restaurantes y negocios.
Genera un menú completo, realista y atractivo basado en la información que el usuario te ha dado.

El usuario te ha proporcionado esta información en la conversación:
${conversationContext}

Responde SOLO con JSON válido (sin texto antes o después):
{
  "action": "apply_menu",
  "welcomeMessage": "Mensaje de bienvenida corto y cálido",
  "categories": [
    {
      "name": "Nombre de categoría",
      "items": [
        {
          "name": "Nombre del producto",
          "description": "Descripción corta y atractiva (1-2 frases)",
          "suggestedPrice": 150.00
        }
      ]
    }
  ]
}

REGLAS:
- Mínimo 3 categorías, máximo 8
- Mínimo 2 items por categoría, máximo 6
- Los precios deben ser realistas
- Las descripciones deben ser en español y apetitosas
- El welcomeMessage debe incluir el nombre del negocio si lo sabes`

      const response = await callOpenAI(
        [{ role: "system", content: menuSystemPrompt }],
        true
      )

      return NextResponse.json({
        message: "¡Aquí tienes tu menú completo generado por IA! Revisa las categorías y productos. Puedes editar cada uno antes de aplicar los cambios.",
        menuData: parseJSON(response),
        messages: [
          ...messages,
          { role: "assistant", content: "¡Aquí tienes tu menú completo generado por IA! Revisa las categorías y productos." },
        ],
      })
    }

    // ─── Default: conversational chat ─────────────────────────────
    const context = await getSiteContext(siteId)
    const systemMsg = `${BASE_SYSTEM_PROMPT}\n\n${context}`

    const fullMessages = [
      { role: "system", content: systemMsg },
      ...messages.slice(-10),
    ]

    const response = await callOpenAI(fullMessages)

    return NextResponse.json({
      message: response,
      messages: [...fullMessages, { role: "assistant", content: response }],
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    console.error("[AI Chat] Error:", msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
