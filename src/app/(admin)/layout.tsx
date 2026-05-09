import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "super_admin") {
    redirect("/dashboard")
  }

  // Fetch admin user data
  const adminUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  })

  if (!adminUser) {
    redirect("/login")
  }

  // Fetch first site for logo link
  const firstSite = await db.miniSite.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <AdminShell
      user={{
        name: adminUser.name ?? "Admin",
        email: adminUser.email,
        image: adminUser.image ?? null,
      }}
      firstSiteId={firstSite?.id ?? null}
    >
      {children}
    </AdminShell>
  )
}
