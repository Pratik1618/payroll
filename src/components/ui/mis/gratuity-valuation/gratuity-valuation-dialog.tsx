"use client"

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

function calculateYearsOfService(doj: string) {
  const joining = new Date(doj)
  const today = new Date()
  let years = today.getFullYear() - joining.getFullYear()

  if (
    today.getMonth() < joining.getMonth() ||
    (today.getMonth() === joining.getMonth() &&
      today.getDate() < joining.getDate())
  ) {
    years--
  }

  return Math.max(years, 0)
}

function calculateGratuity(salary: number, years: number) {
  return Math.round((salary / 26) * 15 * years)
}

export function GratuityValuationDialog() {
  const handleDownload = () => {
    const rows = [
      {
        SrNo: 1,
        EmpCode: "HYD00177",
        DOB: "25-Apr-87",
        DOJ: "01-Feb-23",
        SalaryAct: 10958,
        SalaryScheme: "",
        Col1: "FO",
        Col2: "ANJAMMA PALAMURI",
        Col3: "",
      },
      {
        SrNo: 2,
        EmpCode: "ANP00081",
        DOB: "28-Mar-00",
        DOJ: "01-Feb-23",
        SalaryAct: 10670,
        SalaryScheme: "",
        Col1: "FO",
        Col2: "BHANUCHANDAR NANDIPATI",
        Col3: "",
      },
    ].map((emp) => {
      const years = calculateYearsOfService(emp.DOJ)
      const gratuity = calculateGratuity(emp.SalaryAct, years)

      return {
        ...emp,
        YearsOfService: years,
        GratuityAmount: gratuity,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gratuity")

    XLSX.writeFile(workbook, "Gratuity_Valuation_Report.xlsx")
    toast.success("Gratuity valuation report downloaded")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Gratuity Valuation</DialogTitle>
        <DialogDescription>
          Act-wise gratuity calculation
        </DialogDescription>
      </DialogHeader>

      <Button onClick={handleDownload} className="w-full gap-2">
        <Download className="h-4 w-4" />
        Download Excel
      </Button>
    </>
  )
}
