"use client"

import { motion } from "framer-motion"
import { PowerOff } from "lucide-react"
import { useTranslations } from "@/i18n/provider"

interface BlockedScreenProps {
  businessName?: string
}

export function BlockedScreen({ businessName }: BlockedScreenProps) {
  const { t } = useTranslations("minisite")
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <PowerOff className="w-10 h-10 text-gray-400" />
        </div>
        {businessName && (
          <h1 className="text-xl font-semibold text-gray-700 mb-3">
            {businessName}
          </h1>
        )}
        <p className="text-gray-500 text-base leading-relaxed">
          {t("blocked.message")}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {t("blocked.contact")}
        </p>
      </motion.div>
    </div>
  )
}
