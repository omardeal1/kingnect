import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center bg-background">
      <SearchX className="size-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold">QAIROSS no encontrado</h1>
      <p className="text-muted-foreground max-w-md">
        Este centro digital no existe o ha sido desactivado.
      </p>
      <Button asChild className="bg-[#D4A849] hover:bg-[#C49A3D] text-white">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
