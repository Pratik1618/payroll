"use client"

import { useState } from "react"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { toast } from "sonner"
import { generateCertificate } from "./certificate-generator"

export function EmployeeOfMonthDialog() {
  const [client, setClient] = useState("")
  const [site, setSite] = useState("")
  const [employee, setEmployee] = useState("")

  // 🔹 Mock data (replace with API later)
  const clients = ["iSmart Facilities", "BVG India"]
  const sites = ["Mumbai Corporate Park", "Pune IT Hub"]
  const employees = [
    { id: "EMP001", name: "Ramesh Patil" },
    { id: "EMP002", name: "Suresh Kale" },
  ]

  const handleDownload = () => {
    if (!client || !site || !employee) {
      toast.error("Please select client, site and employee")
      return
    }

    const selectedEmployee = employees.find((e) => e.id === employee)

    if (!selectedEmployee) return

    generateCertificate({
      employeeName: selectedEmployee.name,
      clientName: client,
      siteName: site,
    })

    toast.success("Certificate downloaded successfully")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Employee of the Month</DialogTitle>
        <DialogDescription>
          Select details to generate R&amp;R certificate
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Client */}
        <Select value={client} onValueChange={setClient}>
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Site */}
        <Select value={site} onValueChange={setSite} disabled={!client}>
          <SelectTrigger>
            <SelectValue placeholder="Select Site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employee */}
        <Select value={employee} onValueChange={setEmployee} disabled={!site}>
          <SelectTrigger>
            <SelectValue placeholder="Select Employee ID" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.id} — {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="w-full gap-2"
          onClick={handleDownload}
          disabled={!client || !site || !employee}
        >
          <Award className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </>
  )
}
