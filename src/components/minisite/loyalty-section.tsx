"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Heart, Gift, Award, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface LoyaltyConfigData {
  id: string
  siteId: string
  isEnabled: boolean
  accumulationType: string
  targetValue: number
  rewardType: string
  rewardValue: number
  rewardLabel: string
  welcomeGiftEnabled: boolean
  welcomeGiftDescription: string | null
}

interface LoyaltySectionProps {
  config: LoyaltyConfigData | null
  siteId: string
  accentColor: string
  textColor: string
  cardColor: string
}

export function LoyaltySection({
  config,
  siteId,
  accentColor,
  textColor,
  cardColor,
}: LoyaltySectionProps) {
  const [customerProgress, setCustomerProgress] = React.useState<number | null>(null)
  const [isIdentified, setIsIdentified] = React.useState(false)

  // Only render if enabled
  if (!config?.isEnabled) return null

  const goldColor = "#D4A849"
  const progressPercent = customerProgress !== null
    ? Math.min(100, (customerProgress / config.targetValue) * 100)
    : 0

  const getRewardText = () => {
    switch (config.rewardType) {
      case "discount":
        return config.rewardValue > 0
          ? `${config.rewardValue}% de descuento`
          : config.rewardLabel
      case "free_product":
        return "Producto gratis"
      case "custom":
        return config.rewardLabel
      default:
        return config.rewardLabel
    }
  }

  const getAccumulationText = () => {
    switch (config.accumulationType) {
      case "visits":
        return `${config.targetValue} visitas`
      case "amount":
        return `$${config.targetValue} en compras`
      case "both":
        return `${config.targetValue} puntos`
      default:
        return `${config.targetValue} visitas`
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 pb-6"
    >
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ backgroundColor: cardColor }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="size-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${goldColor}20` }}
          >
            <Heart className="size-5" style={{ color: goldColor }} />
          </div>
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: textColor }}
            >
              Programa de Lealtad
            </h3>
            <p className="text-xs" style={{ color: `${textColor}99` }}>
              Acumula y gana recompensas
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {isIdentified && customerProgress !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: textColor }}>
                Tu progreso
              </span>
              <span
                className="font-semibold"
                style={{ color: goldColor }}
              >
                {customerProgress}/{config.targetValue}
              </span>
            </div>

            <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${goldColor}20` }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goldColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <p className="text-xs text-center" style={{ color: `${textColor}80` }}>
              {progressPercent >= 100
                ? "🎉 ¡Tienes una recompensa disponible!"
                : `Te faltan ${config.targetValue - customerProgress} para ganar`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: `${goldColor}10` }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="size-4" style={{ color: goldColor }} />
                <span className="text-sm font-medium" style={{ color: textColor }}>
                  ¿Qué ganas?
                </span>
              </div>
              <p className="text-sm" style={{ color: textColor }}>
                {getRewardText()}
              </p>
              <p className="text-xs mt-1" style={{ color: `${textColor}70` }}>
                después de {getAccumulationText()}
              </p>
            </div>

            <p className="text-xs text-center" style={{ color: `${textColor}60` }}>
              Regístrate para empezar a acumular puntos
            </p>
          </div>
        )}

        {/* Welcome Gift Banner */}
        {config.welcomeGiftEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-xl p-3"
            style={{ backgroundColor: `${goldColor}15`, border: `1px solid ${goldColor}30` }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="size-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${goldColor}25` }}
              >
                <Gift className="size-4" style={{ color: goldColor }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: goldColor }}
                >
                  🎁 Regalo de bienvenida
                </p>
                {config.welcomeGiftDescription && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: `${textColor}80` }}
                  >
                    {config.welcomeGiftDescription}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.a
          href={`/${new URL(window.location.href).pathname.split("/")[1]}/loyalty`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: goldColor, color: "#000" }}
          whileTap={{ scale: 0.98 }}
        >
          {isIdentified ? "Ver mi cuenta" : "Regístrate para ganar puntos"}
          <ChevronRight className="size-4" />
        </motion.a>
      </div>
    </motion.section>
  )
}
