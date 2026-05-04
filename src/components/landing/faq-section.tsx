"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

const FAQS: FAQ[] = [
  {
    question: "¿Qué es una mini web?",
    answer:
      "Una mini web es una página web optimizada para celular que reúne toda la información de tu negocio en un solo lugar: redes sociales, WhatsApp, ubicación, servicios, productos y más. Se accede mediante un código QR o un enlace directo.",
  },
  {
    question: "¿Necesito saber programar para crear mi mini web?",
    answer:
      "No, para nada. Kingnect está diseñado para que cualquier persona pueda crear su mini web sin conocimientos técnicos. Todo se edita desde un panel visual e intuitivo. Solo necesitas subir tu logo, agregar tus datos y publicar.",
  },
  {
    question: "¿Cómo funciona el código QR?",
    answer:
      "Al publicar tu mini web, Kingnect genera automáticamente un código QR único. Puedes descargarlo en PNG o SVG (según tu plan) e imprimirlo en tarjetas, carpas, banderas, flyers o cualquier material publicitario.",
  },
  {
    question: "¿Puedo editar mi mini web después de publicarla?",
    answer:
      "Sí, puedes editar tu mini web en cualquier momento desde tu panel de administración. Cambia textos, fotos, colores, botones y servicios. Los cambios se reflejan al instante para tus clientes.",
  },
  {
    question: "¿Cómo reciben pedidos mis clientes?",
    answer:
      "Hay dos formas: en el plan Pro, tus clientes arman su pedido y al confirmar se abre WhatsApp con el detalle. En el plan Premium, los pedidos llegan a tu panel interno donde puedes gestionar estados y notificar a tus clientes.",
  },
  {
    question: "¿En qué puedo imprimir el código QR?",
    answer:
      "Puedes imprimir tu QR en tarjetas de presentación, carpas publicitarias, banderas, flyers, stickers, menús, mesas, vitrinas y cualquier material impreso. El formato SVG garantiza calidad en cualquier tamaño.",
  },
  {
    question: "¿Cuál es la diferencia entre los planes?",
    answer:
      "El plan Trial es gratis por 1 mes con funciones básicas. El plan Básico incluye redes sociales y galería. El plan Pro agrega catálogo completo, pedidos por WhatsApp y estadísticas. El plan Premium incluye todo más pedidos internos, dominio personalizado y soporte prioritario.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción cuando quieras sin penalización. Tu mini web seguirá activa hasta el final del período pagado. No hay contratos de permanencia ni cargos ocultos.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Respuestas a las dudas más comunes sobre Kingnect
          </p>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
