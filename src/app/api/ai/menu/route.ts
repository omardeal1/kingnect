import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn("[AI Menu] OPENAI_API_KEY is not set. AI features will be disabled.")
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[AI Menu] OpenAI error:", err)
    throw new Error(`OpenAI API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

function parseJSON<T>(text: string): T {
  // Extract JSON from markdown code blocks if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = match ? match[1].trim() : text.trim()
  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error(`Invalid JSON response from AI: ${jsonStr.slice(0, 100)}...`)
  }
}

// ─── System Prompts ─────────────────────────────────────────────────────────────

const MENU_GEN_SYSTEM = `Eres un experto en menús de restaurantes y negocios de servicios.
Generas menús completos, realistas y atractivos basados en el tipo de negocio, ciudad y estilo.

IMPORTANTE:
- Responde SOLO con JSON válido (sin texto antes o después).
- Los precios deben ser realistas para la ciudad indicada, en moneda local.
- Las descripciones deben ser cortas (1-2 frases) y apetitosas/informativas.
- Mínimo 3 categorías, máximo 8.
- Mínimo 2 items por categoría, máximo 6.
- Incluye un mensaje de bienvenida corto y cálido.`

const IMPROVE_DESC_SYSTEM = `Eres un copywriter experto en descripciones de menús de restaurantes y negocios.
Mejoras descripciones para que sean más atractivas, apetitosas y profesionales.
Responde SOLO con JSON: {"description": "..."} (sin texto antes o después).` 

const SUGGEST_PRICE_SYSTEM = `Eres un analista de precios para restaurantes y negocios de servicios en México y Estados Unidos.
Conoces los precios promedio por ciudad y tipo de producto.
Responde SOLO con JSON: {"suggestedPrice": number, "reasoning": "..."} (sin texto antes o después).
El precio sugerido debe ser un número (sin moneda, sin formato).`

const BADGE_SYSTEM = `Eres un analista de negocios que sugiere badges para productos de menú.
Basándote en las ventas y si el producto es nuevo, sugieres un badge.
Responde SOLO con JSON: {"badge": "Nuevo" | "Popular" | "Recomendado" | null} (sin texto antes o después).`

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI features are not configured. Set OPENAI_API_KEY in .env" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      // ─── Generate Full Menu ──────────────────────────────
      case "generate_menu": {
        const { businessType, city, style } = body
        if (!businessType || !city || !style) {
          return NextResponse.json(
            { error: "businessType, city, and style are required" },
            { status: 400 }
          )
        }

        const prompt = `Genera un menú completo para un negocio de tipo "${businessType}" en "${city}" con estilo "${style}".

Responde con este JSON exacto:
{
  "welcomeMessage": "Mensaje de bienvenida corto y cálido",
  "categories": [
    {
      "name": "Nombre de categoría",
      "items": [
        {
          "name": "Nombre del producto",
          "description": "Descripción corta y atractiva",
          "suggestedPrice": 150.00
        }
      ]
    }
  ]
}`

        const raw = await callOpenAI(MENU_GEN_SYSTEM, prompt)
        const result = parseJSON(raw)
        return NextResponse.json(result)
      }

      // ─── Improve Description ─────────────────────────────
      case "improve_description": {
        const { itemName, businessType, city } = body
        if (!itemName) {
          return NextResponse.json(
            { error: "itemName is required" },
            { status: 400 }
          )
        }

        const prompt = `Mejora la descripción del producto "${itemName}"${businessType ? ` para un negocio tipo "${businessType}"` : ""}${city ? ` en "${city}"` : ""}.

La descripción debe ser:
- Atractiva y profesional
- 1-2 frases máximo
- Sin emojis
- En español

Responde: {"description": "Descripción mejorada aquí"}`

        const raw = await callOpenAI(IMPROVE_DESC_SYSTEM, prompt)
        const result = parseJSON<{ description: string }>(raw)
        return NextResponse.json(result)
      }

      // ─── Suggest Price ───────────────────────────────────
      case "suggest_price": {
        const { itemName, businessType, city } = body
        if (!itemName) {
          return NextResponse.json(
            { error: "itemName is required" },
            { status: 400 }
          )
        }

        const prompt = `Sugiere un precio justo para "${itemName}"${businessType ? ` en un negocio tipo "${businessType}"` : ""}${city ? ` en "${city}"` : ""}.

Considera precios de mercado actuales. Explica brevemente tu razonamiento.

Responde: {"suggestedPrice": 150, "reasoning": "Razón del precio..."}`

        const raw = await callOpenAI(SUGGEST_PRICE_SYSTEM, prompt)
        const result = parseJSON<{ suggestedPrice: number; reasoning: string }>(raw)
        return NextResponse.json(result)
      }

      // ─── Suggest Badge ───────────────────────────────────
      case "generate_badge_suggestion": {
        const { itemName, salesCount, isNew } = body
        if (!itemName) {
          return NextResponse.json(
            { error: "itemName is required" },
            { status: 400 }
          )
        }

        const prompt = `Sugiere un badge para el producto "${itemName}".
- Nombre: "${itemName}"
- Ventas: ${salesCount ?? 0}
- Es nuevo: ${isNew ? "Sí" : "No"}

Criterios:
- Si isNew es true → badge: "Nuevo"
- Si salesCount > 50 → badge: "Popular"
- Si salesCount > 20 → badge: "Recomendado"
- Si no cumple ninguno → badge: null

Responde: {"badge": "Nuevo" | "Popular" | "Recomendado" | null}`

        const raw = await callOpenAI(BADGE_SYSTEM, prompt)
        const result = parseJSON<{ badge: string | null }>(raw)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error("[AI Menu] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
