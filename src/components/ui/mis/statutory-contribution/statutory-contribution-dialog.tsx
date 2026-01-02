"use client"

import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

type ContributionType = "PF" | "ESIC"

export function StatutoryContributionDialog() {
  const [empCode, setEmpCode] = useState("")
  const [type, setType] = useState<ContributionType>("PF")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const handleDownload = () => {
    if (!empCode || !fromDate || !toDate) {
      toast.error("Please fill all fields")
      return
    }

    const data =
      type === "PF"
        ? [
            {
              Month: "Apr-2024",
              EmployeeContribution: 1800,
              EmployerContribution: 1800,
              Total: 3600,
            },
          ]
        : [
            {
              Month: "Apr-2024",
              EmployeeContribution: 140,
              EmployerContribution: 560,
              Total: 700,
            },
          ]

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contribution")

    XLSX.writeFile(
      workbook,
      `${type}_Contribution_${empCode}_${fromDate}_to_${toDate}.xlsx`
    )

    toast.success(`${type} contribution report downloaded`)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>PF / ESIC Contribution</DialogTitle>
        <DialogDescription>
          Single employee statutory contribution
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <Input
          placeholder="Employee Code"
          value={empCode}
          onChange={(e) => setEmpCode(e.target.value)}
        />

        <Select value={type} onValueChange={(v) => setType(v as ContributionType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Contribution Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PF">PF</SelectItem>
            <SelectItem value="ESIC">ESIC</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

        <Button onClick={handleDownload} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}
