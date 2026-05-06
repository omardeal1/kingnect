"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { useTranslations } from "@/i18n/provider"

interface FAQItem {
  questionKey: string
  answerKey: string
}

export function FAQSection() {
  const { t } = useTranslations("landing.faq")

  const FAQS: FAQItem[] = [
    {
      questionKey: "items.whatIs.question",
      answerKey: "items.whatIs.answer",
    },
    {
      questionKey: "items.noCode.question",
      answerKey: "items.noCode.answer",
    },
    {
      questionKey: "items.howQr.question",
      answerKey: "items.howQr.answer",
    },
    {
      questionKey: "items.editAfter.question",
      answerKey: "items.editAfter.answer",
    },
    {
      questionKey: "items.orders.question",
      answerKey: "items.orders.answer",
    },
    {
      questionKey: "items.printQr.question",
      answerKey: "items.printQr.answer",
    },
    {
      questionKey: "items.planDifference.question",
      answerKey: "items.planDifference.answer",
    },
    {
      questionKey: "items.cancel.question",
      answerKey: "items.cancel.answer",
    },
  ]

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
            {t("badge")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
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
                  {t(faq.questionKey)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {t(faq.answerKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
