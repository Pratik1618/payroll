"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Award } from "lucide-react"
import { toast } from "sonner"
import { generateCertificate } from "./certificate-generator"

export function EmployeeOfMonthDialog() {
  const [client, setClient] = useState("")
  const [site, setSite] = useState("")
  const [employee, setEmployee] = useState("")

  const clients = ["Client A", "Client B"]
  const sites = ["Site A", "Site B"]
  const employees = ["Ramesh Patil", "Suresh Kale"]

  const handleDownload = () => {
    if (!client || !site || !employee) {
      toast.error("Please select all fields")
      return
    }

    generateCertificate({
      employeeName: employee,
      clientName: client,
      siteName: site,
    })

    toast.success("Certificate downloaded")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Employee of the Month</DialogTitle>
        <DialogDescription>
          Generate R&R certificate
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* selects here */}
        <Button className="w-full gap-2" onClick={handleDownload}>
          <Award className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </>
  )
}
