import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Benefits } from "@/components/landing/benefits"
import { HowItWorks } from "@/components/landing/how-it-works"
import { BusinessExamples } from "@/components/landing/business-examples"
import { OrdersSection } from "@/components/landing/orders-section"
import { Pricing } from "@/components/landing/pricing"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Benefits />
        <HowItWorks />
        <BusinessExamples />
        <OrdersSection />
        <Pricing />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
