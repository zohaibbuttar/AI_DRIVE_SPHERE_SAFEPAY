import { requireAdmin } from "@/lib/auth/requireAdmin"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Separator } from "@/components/ui/separator"

/**
 * Admin Layout with optimized auth flow
 * 
 * Security: requireAdmin() ensures:
 * 1. User is authenticated
 * 2. User role === "admin"
 * 3. Redirects to login/dashboard if not
 * 
 * Performance: 
 * - Middleware already checked admin access
 * - requireAdmin() is defensive check only
 * - Single profile fetch (cached by Supabase client)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Defensive check - middleware already verified admin access
  // This ensures layout doesn't render unless user is admin
  const profile = await requireAdmin()

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Admin:</span>
            <span className="text-sm font-semibold text-card-foreground">
              {profile.full_name || profile.id}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
