"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

export function SignAgreementButton({ agreementId, cnicUploaded }: { agreementId: string; cnicUploaded?: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSign() {
    if (cnicUploaded === false) {
      toast.error("Please upload your CNIC (front & back) before signing.", {
        description: "Scroll up to the CNIC Verification section.",
        duration: 5000,
      })
      return
    }
    if (!confirm("By clicking OK, you confirm you have read and agree to all rental terms and conditions.")) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("agreements")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", agreementId)
    if (error) { toast.error(error.message) }
    else { toast.success("Agreement signed successfully!"); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={handleSign} disabled={loading} size="sm" variant={cnicUploaded === false ? "outline" : "default"}>
        {loading ? "Signing..." : "Sign Agreement"}
      </Button>
      {cnicUploaded === false && (
        <p className="flex items-center gap-1 text-[10px] text-amber-500">
          <AlertCircle className="h-3 w-3" /> CNIC required first
        </p>
      )}
    </div>
  )
}
