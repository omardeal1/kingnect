// KINGNECT — Production Seed Script
// ⚠️  Este script se usa en producción para crear los datos mínimos necesarios.
// ⚠️  Cambia el hash del admin ANTES de desplegar.
//
// Uso:
//   DATABASE_URL="postgresql://..." npx tsx prisma/seed-prod.ts
//   o: bun run db:seed:prod

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seed de producción iniciado...")

  // ── 1. Planes ────────────────────────────────────────────────────────────────

  const trial = await prisma.plan.upsert({
    where: { slug: "trial" },
    update: {},
    create: {
      name: "Trial",
      slug: "trial",
      price: 0,
      currency: "USD",
      billingInterval: "month",
      trialDays: 30,
      isActive: true,
      sortOrder: 1,
      features: JSON.stringify({
        miniSites: 1,
        qrPng: true,
        basicCatalog: true,
        showBrand: true,
      }),
      limits: JSON.stringify({
        maxSites: 1,
        maxSocialLinks: 5,
        maxContactButtons: 3,
        maxSlides: 0,
        maxMenuCategories: 2,
        maxMenuItems: 10,
        maxGalleryImages: 5,
        maxServices: 3,
        maxTestimonials: 3,
        maxCustomLinks: 3,
        maxLocations: 1,
      }),
    },
  })

  const basico = await prisma.plan.upsert({
    where: { slug: "basico" },
    update: {},
    create: {
      name: "Básico",
      slug: "basico",
      price: 9.99,
      currency: "USD",
      billingInterval: "month",
      trialDays: 0,
      isActive: true,
      sortOrder: 2,
      features: JSON.stringify({
        miniSites: 1,
        qrPng: true,
        socialLinks: true,
        whatsapp: true,
        location: true,
        gallery: true,
        showBrand: true,
      }),
      limits: JSON.stringify({
        maxSites: 1,
        maxSocialLinks: 10,
        maxContactButtons: 5,
        maxSlides: 0,
        maxMenuCategories: 5,
        maxMenuItems: 30,
        maxGalleryImages: 15,
        maxServices: 10,
        maxTestimonials: 5,
        maxCustomLinks: 5,
        maxLocations: 2,
      }),
    },
  })

  const pro = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      price: 24.99,
      currency: "USD",
      billingInterval: "month",
      trialDays: 0,
      isActive: true,
      sortOrder: 3,
      features: JSON.stringify({
        miniSites: 1,
        qrPng: true,
        qrSvg: true,
        fullCatalog: true,
        whatsappOrders: true,
        statistics: true,
        slides: true,
        removeBrand: true,
      }),
      limits: JSON.stringify({
        maxSites: 1,
        maxSocialLinks: 20,
        maxContactButtons: 8,
        maxSlides: 5,
        maxMenuCategories: 10,
        maxMenuItems: 100,
        maxGalleryImages: 30,
        maxServices: 20,
        maxTestimonials: 15,
        maxCustomLinks: 15,
        maxLocations: 5,
      }),
    },
  })

  const premium = await prisma.plan.upsert({
    where: { slug: "premium" },
    update: {},
    create: {
      name: "Premium",
      slug: "premium",
      price: 49.99,
      currency: "USD",
      billingInterval: "month",
      trialDays: 0,
      isActive: true,
      sortOrder: 4,
      features: JSON.stringify({
        miniSites: 1,
        qrPng: true,
        qrSvg: true,
        fullCatalog: true,
        internalOrders: true,
        multipleLocations: true,
        customDomain: true,
        advancedAnalytics: true,
        removeBrand: true,
        prioritySupport: true,
      }),
      limits: JSON.stringify({
        maxSites: 3,
        maxSocialLinks: 999,
        maxContactButtons: 999,
        maxSlides: 10,
        maxMenuCategories: 999,
        maxMenuItems: 999,
        maxGalleryImages: 999,
        maxServices: 999,
        maxTestimonials: 999,
        maxCustomLinks: 999,
        maxLocations: 999,
      }),
    },
  })

  console.log("✅ Planes creados:", {
    trial: trial.id,
    basico: basico.id,
    pro: pro.id,
    premium: premium.id,
  })

  // ── 2. Super Admin ──────────────────────────────────────────────────────────
  // ⚠️  IMPORTANTE: Cambia este hash por uno generado con tu contraseña real:
  //   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TU-CONTRASEÑA', 12))"
  //   o:  npx tsx -e "import {hashSync} from 'bcryptjs'; console.log(hashSync('TU-CONTRASEÑA', 12))"

  const ADMIN_PASSWORD_HASH =
    process.env.ADMIN_PASSWORD_HASH ??
    "$2a$12$CHANGE_THIS_HASH_IN_PRODUCTION_REPLACE_WITH_REAL_BCRYPT_HASH"

  const admin = await prisma.user.upsert({
    where: { email: "admin@kingnect.app" },
    update: {},
    create: {
      name: "King Designs Admin",
      email: "admin@kingnect.app",
      passwordHash: ADMIN_PASSWORD_HASH,
      role: "super_admin",
      emailVerified: new Date(),
    },
  })

  console.log("✅ Super admin creado:", admin.id)

  // ── 3. Platform Settings ────────────────────────────────────────────────────

  const settings = [
    { key: "app_name", value: "Kingnect", type: "text" },
    { key: "app_url", value: "https://links.kingnect.app", type: "text" },
    { key: "primary_color", value: "#D4A849", type: "text" },
    { key: "contact_email", value: "soporte@kingnect.app", type: "text" },
    { key: "whatsapp_number", value: "5215512345678", type: "text" },
    { key: "facebook_url", value: "", type: "text" },
    { key: "instagram_url", value: "", type: "text" },
    { key: "terms_url", value: "/terminos", type: "text" },
    { key: "privacy_url", value: "/privacidad", type: "text" },
    { key: "trial_days", value: "30", type: "number" },
    { key: "maintenance_mode", value: "false", type: "boolean" },
    { key: "max_free_sites", value: "1", type: "number" },
    { key: "default_plan", value: "trial", type: "text" },
    { key: "currency", value: "USD", type: "text" },
    { key: "stripe_enabled", value: "true", type: "boolean" },
    { key: "registration_enabled", value: "true", type: "boolean" },
  ]

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        updatedBy: admin.id,
      },
    })
  }

  console.log("✅ Platform settings creados:", settings.length)

  // ── 4. Platform Sections (landing) ──────────────────────────────────────────

  const sections = [
    {
      sectionKey: "hero",
      title: "Tu negocio en una mini web profesional con QR",
      subtitle:
        "Todos los links de tu negocio en un solo lugar. Crea tu mini web en minutos y compártela con un código QR listo para imprimir.",
      content: "",
      sortOrder: 1,
    },
    {
      sectionKey: "benefits",
      title: "Todo lo que tu negocio necesita",
      subtitle:
        "Una plataforma completa para tener presencia digital profesional",
      content: "",
      sortOrder: 2,
    },
    {
      sectionKey: "how_it_works",
      title: "¿Cómo funciona?",
      subtitle: "En 7 pasos simples tendrás tu mini web lista para compartir",
      content: "",
      sortOrder: 3,
    },
    {
      sectionKey: "pricing",
      title: "Planes y precios",
      subtitle: "Elige el plan que mejor se adapte a tu negocio",
      content: "",
      sortOrder: 4,
    },
    {
      sectionKey: "testimonials",
      title: "Lo que dicen nuestros clientes",
      subtitle: "Negocios reales que ya usan Kingnect",
      content: "",
      sortOrder: 5,
    },
    {
      sectionKey: "faq",
      title: "Preguntas frecuentes",
      subtitle: "Resolvemos tus dudas",
      content: JSON.stringify([
        {
          q: "¿Qué es Kingnect?",
          a: "Kingnect es una plataforma que te permite crear una mini web profesional con código QR para tu negocio, sin necesidad de saber programar.",
        },
        {
          q: "¿Necesito saber programar?",
          a: "No, Kingnect está diseñado para que cualquier persona pueda crear su mini web de forma intuitiva desde su celular o computadora.",
        },
        {
          q: "¿Puedo editar mi mini web cuando quiera?",
          a: "Sí, puedes editar tu mini web en cualquier momento desde tu panel de control y los cambios se reflejan al instante.",
        },
        {
          q: "¿Cómo recibo pedidos?",
          a: "Dependiendo de tu plan, puedes recibir pedidos por WhatsApp o directamente en tu panel de control.",
        },
        {
          q: "¿El QR funciona para imprimir?",
          a: "Sí, puedes descargar tu QR en PNG o SVG con la resolución perfecta para tarjetas, carpas, banderas y cualquier material impreso.",
        },
        {
          q: "¿Puedo usar mi propio dominio?",
          a: "Sí, con el plan Premium puedes conectar tu propio dominio personalizado a tu mini web.",
        },
        {
          q: "¿Hay periodo de prueba?",
          a: "Sí, ofrecemos 1 mes de prueba gratis con el plan Trial para que explores todas las funciones básicas.",
        },
        {
          q: "¿Cómo cancelo mi suscripción?",
          a: "Puedes cancelar en cualquier momento desde tu panel de facturación. No hay contratos de permanencia.",
        },
      ]),
      sortOrder: 6,
    },
  ]

  for (const section of sections) {
    await prisma.platformSection.upsert({
      where: { sectionKey: section.sectionKey },
      update: {
        title: section.title,
        subtitle: section.subtitle,
        content: section.content || null,
        sortOrder: section.sortOrder,
      },
      create: {
        sectionKey: section.sectionKey,
        title: section.title,
        subtitle: section.subtitle,
        content: section.content || null,
        sortOrder: section.sortOrder,
      },
    })
  }

  console.log("✅ Platform sections creados:", sections.length)
  console.log("🎉 Seed de producción completado exitosamente")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed de producción:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
