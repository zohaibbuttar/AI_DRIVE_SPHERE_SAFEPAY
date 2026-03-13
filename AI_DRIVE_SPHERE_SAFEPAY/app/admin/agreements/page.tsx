import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  signed: "default",
  expired: "destructive",
}

export default async function AdminAgreementsPage() {
  const supabase = await createClient()

  const { data: agreements } = await supabase
    .from("agreements")
    .select(
      "*, vehicles(name, plate_number), bookings(start_date, end_date, total_price), profiles:user_id(full_name)"
    )
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Agreements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all rental agreements
        </p>
      </div>

      {!agreements || agreements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No agreements yet. Generate agreements from the Bookings page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {agreements.map((agreement: any) => (
            <Card key={agreement.id}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg font-bold text-card-foreground">
                      {agreement.vehicles?.name}
                    </h3>
                    <Badge variant={statusColors[agreement.status] || "outline"}>
                      {agreement.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {agreement.profiles?.full_name || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agreement.vehicles?.plate_number} |{" "}
                    {new Date(
                      agreement.bookings?.start_date
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      agreement.bookings?.end_date
                    ).toLocaleDateString()}{" "}
                    | ${agreement.bookings?.total_price}
                  </p>
                  {agreement.signed_at && (
                    <p className="text-xs text-green-600">
                      Signed: {new Date(agreement.signed_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {agreement.pdf_url && (
                    <a
                      href={agreement.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
