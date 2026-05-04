import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch client data with subscription and Kinec
  const client = await db.client.findUnique({
    where: { ownerUserId: session.user.id },
    include: {
      subscription: {
        include: { plan: true },
      },
      miniSites: {
        select: {
          id: true,
          slug: true,
          businessName: true,
        },
        take: 1,
      },
    },
  })

  const isBlocked = client?.accountStatus === "blocked"
  const businessName = client?.businessName ?? session.user.name ?? "Negocio"
  const planName = client?.subscription?.plan?.name ?? "Trial"
  const planSlug = client?.subscription?.plan?.slug ?? "trial"
  const planId = client?.subscription?.plan?.id ?? ""
  const planPrice = client?.subscription?.plan?.price ?? 0
  const siteSlug = client?.miniSites?.[0]?.slug ?? ""
  const siteId = client?.miniSites?.[0]?.id ?? ""
  const clientId = client?.id ?? ""
  const periodStart = client?.subscription?.currentPeriodStart?.toISOString() ?? null
  const periodEnd = client?.subscription?.currentPeriodEnd?.toISOString() ?? null

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      dashboardData={{
        businessName,
        planName,
        planPrice,
        planSlug,
        planId,
        siteSlug,
        siteId,
        clientId,
        isBlocked,
        periodStart,
        periodEnd,
      }}
    >
      {children}
    </DashboardShell>
  )
}
