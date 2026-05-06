import { PrismaClient } from "@prisma/client"
import { hashSync } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Plans
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

  console.log("Plans created:", { trial: trial.id, basico: basico.id, pro: pro.id, premium: premium.id })

  // Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@qaiross.app" },
    update: {},
    create: {
      name: "QAIROSS Admin",
      email: "admin@qaiross.app",
      passwordHash: hashSync("Admin123!", 12),
      role: "super_admin",
      emailVerified: new Date(),
    },
  })

  console.log("Super admin created:", admin.id)

  // ─── Create Demo Client User ──────────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@qaiross.app" },
    update: {},
    create: {
      name: "Negocio Demo",
      email: "demo@qaiross.app",
      passwordHash: hashSync("Demo123!", 12),
      role: "client",
      emailVerified: new Date(),
    },
  })

  console.log("Demo user created:", demoUser.id)

  // Create Client record for demo user
  const demoClient = await prisma.client.upsert({
    where: { ownerUserId: demoUser.id },
    update: {},
    create: {
      ownerUserId: demoUser.id,
      businessName: "Restaurante El Sabor",
      contactName: "Negocio Demo",
      email: "demo@qaiross.app",
      pipelineStatus: "active",
      accountStatus: "active",
    },
  })

  console.log("Demo client created:", demoClient.id)

  // Create Trial subscription for demo client
  const existingSubscription = await prisma.subscription.findUnique({
    where: { clientId: demoClient.id },
  })

  if (!existingSubscription) {
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + 30)

    await prisma.subscription.create({
      data: {
        clientId: demoClient.id,
        planId: trial.id,
        status: "trial",
        trialStart: now,
        trialEnd: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
      },
    })
    console.log("Demo subscription created")
  } else {
    console.log("Demo subscription already exists, skipping")
  }

  // Create MiniSite for demo client
  const demoSite = await prisma.miniSite.upsert({
    where: { slug: "restaurante-el-sabor" },
    update: {},
    create: {
      clientId: demoClient.id,
      slug: "restaurante-el-sabor",
      businessName: "Restaurante El Sabor",
      tagline: "La mejor comida de la ciudad",
      description: "Restaurante familiar con más de 20 años de tradición",
      accentColor: "#D4A849",
      isActive: true,
      isPublished: true,
      showKingBrand: true,
    },
  })

  console.log("Demo mini site created:", demoSite.id)

  // ─── Social Links ─────────────────────────────────────────────────────────────
  const socialLinksData = [
    { type: "facebook", label: "Facebook", url: "https://facebook.com/restauranteelsabor", sortOrder: 0 },
    { type: "instagram", label: "Instagram", url: "https://instagram.com/restauranteelsabor", sortOrder: 1 },
    { type: "whatsapp", label: "WhatsApp", url: "https://wa.me/5215512345678", sortOrder: 2 },
  ]

  for (const link of socialLinksData) {
    const existing = await prisma.socialLink.findFirst({
      where: { miniSiteId: demoSite.id, type: link.type, url: link.url },
    })
    if (!existing) {
      await prisma.socialLink.create({
        data: { miniSiteId: demoSite.id, ...link, enabled: true },
      })
    }
  }

  // ─── Contact Buttons ──────────────────────────────────────────────────────────
  const contactButtonsData = [
    { type: "whatsapp", label: "WhatsApp", value: "5215512345678", sortOrder: 0 },
    { type: "call", label: "Llamar", value: "+525512345678", sortOrder: 1 },
  ]

  for (const btn of contactButtonsData) {
    const existing = await prisma.contactButton.findFirst({
      where: { miniSiteId: demoSite.id, type: btn.type, value: btn.value },
    })
    if (!existing) {
      await prisma.contactButton.create({
        data: { miniSiteId: demoSite.id, ...btn, enabled: true },
      })
    }
  }

  // ─── Locations ────────────────────────────────────────────────────────────────
  const existingLocation = await prisma.location.findFirst({
    where: { miniSiteId: demoSite.id, name: "Sucursal Centro" },
  })
  if (!existingLocation) {
    await prisma.location.create({
      data: {
        miniSiteId: demoSite.id,
        name: "Sucursal Centro",
        address: "Av. Reforma 123, Col. Centro, CDMX",
        mapsUrl: "https://maps.google.com/?q=Av+Reforma+123+CDMX",
        hours: "Lun-Dom: 12:00 - 22:00",
        enabled: true,
        sortOrder: 0,
      },
    })
  }

  // ─── Menu Categories & Items ──────────────────────────────────────────────────
  // Category 1: Entradas
  const entradasCat = await prisma.menuCategory.upsert({
    where: { id: (await prisma.menuCategory.findFirst({ where: { miniSiteId: demoSite.id, name: "Entradas" } }))?.id ?? "__nonexistent__" },
    update: {},
    create: {
      miniSiteId: demoSite.id,
      name: "Entradas",
      enabled: true,
      sortOrder: 0,
    },
  })

  const entradasItems = [
    { name: "Guacamole con Totopos", description: "Guacamole fresco preparado al momento con aguacate, tomate y cilantro", price: 85, sortOrder: 0 },
    { name: "Quesadillas de Huitlacoche", description: "Tortillas de maíz rellenas de huitlacoche y queso Oaxaca", price: 95, sortOrder: 1 },
  ]

  for (const item of entradasItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { miniSiteId: demoSite.id, categoryId: entradasCat.id, name: item.name },
    })
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          miniSiteId: demoSite.id,
          categoryId: entradasCat.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isOrderable: true,
          enabled: true,
          sortOrder: item.sortOrder,
        },
      })
    }
  }

  // Category 2: Platos Fuertes
  const platosCat = await prisma.menuCategory.upsert({
    where: { id: (await prisma.menuCategory.findFirst({ where: { miniSiteId: demoSite.id, name: "Platos Fuertes" } }))?.id ?? "__nonexistent__" },
    update: {},
    create: {
      miniSiteId: demoSite.id,
      name: "Platos Fuertes",
      enabled: true,
      sortOrder: 1,
    },
  })

  const platosItems = [
    { name: "Mole Poblano con Pollo", description: "Pollo bañado en mole poblano tradicional con arroz y frijoles", price: 165, sortOrder: 0 },
    { name: "Tacos de Cochinita Pibil", description: "5 tacos de cochinita pibil con cebolla morada y habanero", price: 145, sortOrder: 1 },
  ]

  for (const item of platosItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { miniSiteId: demoSite.id, categoryId: platosCat.id, name: item.name },
    })
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          miniSiteId: demoSite.id,
          categoryId: platosCat.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isOrderable: true,
          enabled: true,
          sortOrder: item.sortOrder,
        },
      })
    }
  }

  // ─── Gallery Images ───────────────────────────────────────────────────────────
  const galleryImagesData = [
    { imageUrl: "/uploads/placeholder-gallery-1.jpg", caption: "Fachada del restaurante", sortOrder: 0 },
    { imageUrl: "/uploads/placeholder-gallery-2.jpg", caption: "Nuestro mole especial", sortOrder: 1 },
  ]

  for (const img of galleryImagesData) {
    const existing = await prisma.galleryImage.findFirst({
      where: { miniSiteId: demoSite.id, imageUrl: img.imageUrl },
    })
    if (!existing) {
      await prisma.galleryImage.create({
        data: { miniSiteId: demoSite.id, ...img, enabled: true },
      })
    }
  }

  // ─── Testimonials ─────────────────────────────────────────────────────────────
  const testimonialsData = [
    { name: "María García", content: "El mejor mole que he probado en mi vida. El ambiente es increíble y el servicio muy atento.", rating: 5, sortOrder: 0 },
    { name: "Carlos López", content: "Llevamos 10 años yendo en familia. La cochinita pibil es espectacular, siempre pedimos extra.", rating: 5, sortOrder: 1 },
  ]

  for (const t of testimonialsData) {
    const existing = await prisma.testimonial.findFirst({
      where: { miniSiteId: demoSite.id, name: t.name, content: t.content },
    })
    if (!existing) {
      await prisma.testimonial.create({
        data: { miniSiteId: demoSite.id, ...t, enabled: true },
      })
    }
  }

  console.log("Demo data seeded successfully")

  // ─── Platform Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: "app_name", value: "QAIROSS", type: "text" },
    { key: "app_url", value: "https://links.qaiross.app", type: "text" },
    { key: "primary_color", value: "#D4A849", type: "text" },
    { key: "contact_email", value: "soporte@qaiross.app", type: "text" },
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

  // Create Platform Sections for landing
  const sections = [
    {
      sectionKey: "hero",
      title: "Tu negocio en una mini web profesional con QR",
      subtitle: "Todos los links de tu negocio en un solo lugar. Crea tu mini web en minutos y compártela con un código QR listo para imprimir.",
      content: "",
      sortOrder: 1,
    },
    {
      sectionKey: "benefits",
      title: "Todo lo que tu negocio necesita",
      subtitle: "Una plataforma completa para tener presencia digital profesional",
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
      subtitle: "Negocios reales que ya usan QAIROSS",
      content: "",
      sortOrder: 5,
    },
    {
      sectionKey: "faq",
      title: "Preguntas frecuentes",
      subtitle: "Resolvemos tus dudas",
      content: JSON.stringify([
        { q: "¿Qué es QAIROSS?", a: "QAIROSS es una plataforma que te permite crear una mini web profesional con código QR para tu negocio, sin necesidad de saber programar." },
        { q: "¿Necesito saber programar?", a: "No, QAIROSS está diseñado para que cualquier persona pueda crear su mini web de forma intuitiva desde su celular o computadora." },
        { q: "¿Puedo editar mi mini web cuando quiera?", a: "Sí, puedes editar tu mini web en cualquier momento desde tu panel de control y los cambios se reflejan al instante." },
        { q: "¿Cómo recibo pedidos?", a: "Dependiendo de tu plan, puedes recibir pedidos por WhatsApp o directamente en tu panel de control." },
        { q: "¿El QR funciona para imprimir?", a: "Sí, puedes descargar tu QR en PNG o SVG con la resolución perfecta para tarjetas, carpas, banderas y cualquier material impreso." },
        { q: "¿Puedo usar mi propio dominio?", a: "Sí, con el plan Premium puedes conectar tu propio dominio personalizado a tu mini web." },
        { q: "¿Hay periodo de prueba?", a: "Sí, ofrecemos 1 mes de prueba gratis con el plan Trial para que explores todas las funciones básicas." },
        { q: "¿Cómo cancelo mi suscripción?", a: "Puedes cancelar en cualquier momento desde tu panel de facturación. No hay contratos de permanencia." },
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

  console.log("Platform settings and sections seeded")
  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
