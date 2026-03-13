import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"
import { SignAgreementButton } from "@/components/dashboard/sign-agreement-button"
import { CnicUploadSection } from "@/components/dashboard/cnic-upload-section"
import { TrackVehicleButton } from "@/components/dashboard/track-vehicle-button"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  signed: "default",
  expired: "destructive",
}

export default async function AgreementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: agreements } = await supabase
    .from("agreements")
    .select(`*, vehicles(id, name, plate_number), bookings(start_date, end_date, status)`)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  const { data: cnicDocs } = await supabase
    .from("cnic_documents")
    .select("*")
    .eq("user_id", user!.id)
    .single()

  const cnicUploaded = !!cnicDocs?.front_url && !!cnicDocs?.back_url

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Rental Agreements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View agreements, upload your CNIC, and track your vehicle
        </p>
      </div>

      <CnicUploadSection userId={user!.id} existingDocs={cnicDocs} />

      {!agreements || agreements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No agreements yet. Agreements will appear here once your bookings are confirmed by an admin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {agreements.map((agreement: any) => {
            const isActive = ["active", "confirmed"].includes(agreement.bookings?.status)
            return (
              <Card key={agreement.id}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-card-foreground">
                        {agreement.vehicles?.name || "Vehicle"}
                      </h3>
                      <Badge variant={statusColors[agreement.status] || "outline"}>{agreement.status}</Badge>
                      {isActive && (
                        <Badge variant="secondary" className="text-green-400 border-green-500/30">
                          🟢 Active Rental
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Plate: {agreement.vehicles?.plate_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(agreement.bookings?.start_date).toLocaleDateString()} —{" "}
                      {new Date(agreement.bookings?.end_date).toLocaleDateString()}
                    </p>
                    {agreement.signed_at && (
                      <p className="text-xs text-muted-foreground">
                        Signed: {new Date(agreement.signed_at).toLocaleString()}
                      </p>
                    )}
                    {agreement.status === "draft" && !cnicUploaded && (
                      <p className="mt-1 text-xs text-amber-500">⚠️ Upload your CNIC before signing</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {isActive && (
                      <TrackVehicleButton
                        vehicleId={agreement.vehicles?.id}
                        vehicleName={agreement.vehicles?.name}
                      />
                    )}
                    {agreement.status === "draft" && (
                      <SignAgreementButton agreementId={agreement.id} cnicUploaded={cnicUploaded} />
                    )}
                    {agreement.pdf_url && (
                      <a
                        href={agreement.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
