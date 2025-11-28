"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Download, BarChart3 } from "lucide-react"

export default function MISReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedOffice, setSelectedOffice] = useState<string>("")
  const [reportType, setReportType] = useState<"salary" | "payroll">("salary")

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December"},
  ]

  const years = ["2024", "2025", "2026"]
  const offices = ["Front Office", "Back Office"]

  const salaryReportData = [
    {
      id: "EMP001",
      name: "Raj Kumar",
      branch: "Delhi",
      basic: 30000,
      hra: 9000,
      da: 6000,
      cca: 2000,
      pf: 3900,
      esic: 225,
      grossAmount: 47000,
      netPayable: 41875,
    },
    {
      id: "EMP002",
      name: "Priya Singh",
      branch: "Mumbai",
      basic: 25000,
      hra: 7500,
      da: 5000,
      cca: 1500,
      pf: 3250,
      esic: 190,
      grossAmount: 39000,
      netPayable: 35560,
    },
    {
      id: "EMP003",
      name: "Amit Patel",
      branch: "Bangalore",
      basic: 35000,
      hra: 10500,
      da: 7000,
      cca: 2500,
      pf: 4550,
      esic: 270,
      grossAmount: 55000,
      netPayable: 49180,
    },
  ]

  const payrollMisData = [
    {
      client: "Acme Corp",
      employees: 45,
      prevMonthGross: 500000,
      currentMonthGross: 510000,
      variance: 10000,
      deductions: 85000,
      pt: 2000,
      comparison: "+2%",
    },
    {
      client: "Tech Solutions",
      employees: 32,
      prevMonthGross: 380000,
      currentMonthGross: 390000,
      variance: 10000,
      deductions: 65000,
      pt: 1500,
      comparison: "+2.6%",
    },
    {
      client: "Finance Hub",
      employees: 28,
      prevMonthGross: 320000,
      currentMonthGross: 335000,
      variance: 15000,
      deductions: 56000,
      pt: 1200,
      comparison: "+4.7%",
    },
  ]

  const handleGenerateSalaryReport = () => {
    if (!selectedMonth || !selectedYear || !selectedOffice) {
      toast.error("Please select all filters")
      return
    }

    const csvContent = [
      ["SALARY REPORT", selectedMonth + "/" + selectedYear, "(" + selectedOffice + ")"],
      [],
      [
        "Employee ID",
        "Name",
        "Branch",
        "Basic",
        "HRA",
        "DA",
        "CCA",
        "PF (12%)",
        "ESIC (0.75%)",
        "Company PF (13%)",
        "Company ESIC (3.25%)",
        "Leave Provision",
        "Bonus Provision",
        "LWF",
        "LWF Company",
        "Gross Amount",
        "Net Payable",
      ],
      ...salaryReportData.map((row) => [
        row.id,
        row.name,
        row.branch,
        row.basic,
        row.hra,
        row.da,
        row.cca,
        row.pf,
        row.esic,
        row.basic * 0.13,
        row.basic * 0.0325,
        0,
        0,
        0,
        0,
        row.grossAmount,
        row.netPayable,
      ]),
    ]

    const csv = csvContent.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Salary_Report_${selectedMonth}_${selectedYear}_${selectedOffice}.csv`
    link.click()

    toast.success("Salary report downloaded successfully")
  }

  const handleGeneratePayrollMIS = () => {
    if (!selectedMonth || !selectedYear || !selectedOffice) {
      toast.error("Please select all filters")
      return
    }

    const csvContent = [
      ["PAYROLL MIS REPORT", selectedMonth + "/" + selectedYear, "(" + selectedOffice + ")"],
      [],
      [
        "Client",
        "Employees",
        "Previous Month Gross",
        "Current Month Gross",
        "Variance",
        "Deductions",
        "PT",
        "Comparison vs Previous",
      ],
      ...payrollMisData.map((row) => [
        row.client,
        row.employees,
        row.prevMonthGross,
        row.currentMonthGross,
        row.variance,
        row.deductions,
        row.pt,
        row.comparison,
      ]),
    ]

    const csv = csvContent.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Payroll_MIS_${selectedMonth}_${selectedYear}_${selectedOffice}.csv`
    link.click()

    toast.success("Payroll MIS report downloaded successfully")
  }

  const isFilterComplete = selectedMonth && selectedYear && selectedOffice

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MIS Reports</h1>
          <p className="text-muted-foreground">Download salary and payroll analysis reports</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Report Filters
            </CardTitle>
            <CardDescription>Select month, year, and office type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Office</label>
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setSelectedMonth("")
                    setSelectedYear("")
                    setSelectedOffice("")
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Report</CardTitle>
              <CardDescription>Download component breakdown by employee</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateSalaryReport} disabled={!isFilterComplete} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payroll MIS</CardTitle>
              <CardDescription>Download variance analysis report</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGeneratePayrollMIS} disabled={!isFilterComplete} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
