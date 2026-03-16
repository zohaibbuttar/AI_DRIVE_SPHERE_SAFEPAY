import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch agreement with related data
  const { data: agreement, error } = await supabase
    .from("agreements")
    .select(
      "*, vehicles(name, plate_number, type, price_per_day), bookings(start_date, end_date, total_price), profiles:user_id(full_name, phone)"
    )
    .eq("id", id)
    .single()

  if (error || !agreement) {
    return NextResponse.json({ error: "Agreement not found" }, { status: 404 })
  }

  // Generate a simple HTML-based PDF (in production, use a PDF library like jsPDF or Puppeteer)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Rental Agreement - Drive Sphere</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 40px; color: #0f1729; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #0f1729; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin: 0; }
    .header p { color: #64748b; margin: 5px 0; }
    .section { margin-bottom: 25px; }
    .section h2 { font-size: 18px; border-bottom: 1px solid #e5e0db; padding-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f0eb; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { font-weight: bold; font-size: 14px; }
    .terms { background: #faf8f5; padding: 20px; border-radius: 8px; font-size: 13px; }
    .signature { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-line { border-top: 1px solid #0f1729; width: 200px; padding-top: 8px; font-size: 12px; color: #64748b; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Drive Sphere</h1>
    <p>Vehicle Rental Agreement</p>
    <p>Agreement ID: ${agreement.id}</p>
  </div>
  
  <div class="section">
    <h2>Renter Information</h2>
    <div class="detail-row">
      <span class="detail-label">Name</span>
      <span class="detail-value">${agreement.profiles?.full_name || "N/A"}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Phone</span>
      <span class="detail-value">${agreement.profiles?.phone || "N/A"}</span>
    </div>
  </div>

  <div class="section">
    <h2>Vehicle Details</h2>
    <div class="detail-row">
      <span class="detail-label">Vehicle</span>
      <span class="detail-value">${agreement.vehicles?.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Type</span>
      <span class="detail-value">${agreement.vehicles?.type}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Plate Number</span>
      <span class="detail-value">${agreement.vehicles?.plate_number}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Daily Rate</span>
      <span class="detail-value">$${agreement.vehicles?.price_per_day}</span>
    </div>
  </div>

  <div class="section">
    <h2>Rental Period</h2>
    <div class="detail-row">
      <span class="detail-label">Start Date</span>
      <span class="detail-value">${agreement.bookings?.start_date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">End Date</span>
      <span class="detail-value">${agreement.bookings?.end_date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Total Price</span>
      <span class="detail-value">$${agreement.bookings?.total_price}</span>
    </div>
  </div>

  <div class="section">
    <h2>Terms & Conditions</h2>
    <div class="terms">${agreement.terms}</div>
  </div>

  <div class="section">
    <h2>Status</h2>
    <p><strong>${agreement.status.toUpperCase()}</strong>${agreement.signed_at ? ` - Signed on ${new Date(agreement.signed_at).toLocaleString()}` : ""}</p>
  </div>

  <div class="signature">
    <div>
      <div class="signature-line">Renter Signature</div>
    </div>
    <div>
      <div class="signature-line">Company Representative</div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated document from Drive Sphere Vehicle Rental Management System.</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="agreement-${id}.html"`,
    },
  })
}
