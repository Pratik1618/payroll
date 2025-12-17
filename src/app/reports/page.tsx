"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Download, BarChart3, FileText, TrendingDown, GitCompare, FileSpreadsheet } from "lucide-react"

type ReportType =
  | "salary-report"
  | "payroll-mis"
  | "esic-pending"
  | "pf-pending"
  | "attrition-rate"
  | "salary-comparison"

const reports = [
  {
    id: "salary-report",
    title: "Salary Report",
    description: "Component breakdown by employee",
    icon: FileText,
    iconColor: "text-blue-600",
  },
  {
    id: "payroll-mis",
    title: "Payroll MIS",
    description: "Variance analysis report",
    icon: BarChart3,
    iconColor: "text-green-600",
  },
  {
    id: "esic-pending",
    title: "ESIC Pending List",
    description: "Employees without ESIC number",
    icon: FileSpreadsheet,
    iconColor: "text-orange-600",
  },
  {
    id: "pf-pending",
    title: "PF Pending List",
    description: "Employees without PF number",
    icon: FileSpreadsheet,
    iconColor: "text-purple-600",
  },
  {
    id: "attrition-rate",
    title: "Attrition Rate",
    description: "Monthly, quarterly, or yearly analysis",
    icon: TrendingDown,
    iconColor: "text-red-600",
  },
  {
    id: "salary-comparison",
    title: "Salary Comparison (Site-wise)",
    description: "Compare current vs previous month",
    icon: GitCompare,
    iconColor: "text-cyan-600",
  },
]

export default function MISReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MIS Reports</h1>
          <p className="text-muted-foreground">Download comprehensive payroll and compliance reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Select a report to configure and download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((report) => {
                const Icon = report.icon
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id as ReportType)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <Icon className={`h-5 w-5 ${report.iconColor}`} />
                    <div className="flex-1">
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md">
            {selectedReport === "salary-report" && <SalaryReportDialog />}
            {selectedReport === "payroll-mis" && <PayrollMISDialog />}
            {selectedReport === "esic-pending" && <ESICPendingDialog />}
            {selectedReport === "pf-pending" && <PFPendingDialog />}
            {selectedReport === "attrition-rate" && <AttritionRateDialog />}
            {selectedReport === "salary-comparison" && <SalaryComparisonDialog />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

function SalaryReportDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedOffice, setSelectedOffice] = useState<string>("")

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
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]
  const offices = ["Front Office", "Back Office"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear || !selectedOffice) {
      toast.error("Please select all filters")
      return
    }
    toast.success("Salary report downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear && selectedOffice

  return (
    <>
      <DialogHeader>
        <DialogTitle>Salary Report</DialogTitle>
        <DialogDescription>Component breakdown by employee</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedOffice} onValueChange={setSelectedOffice}>
          <SelectTrigger>
            <SelectValue placeholder="Select Office" />
          </SelectTrigger>
          <SelectContent>
            {offices.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}

function PayrollMISDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedOffice, setSelectedOffice] = useState<string>("")

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
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]
  const offices = ["Front Office", "Back Office"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear || !selectedOffice) {
      toast.error("Please select all filters")
      return
    }
    toast.success("Payroll MIS downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear && selectedOffice

  return (
    <>
      <DialogHeader>
        <DialogTitle>Payroll MIS</DialogTitle>
        <DialogDescription>Variance analysis report</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedOffice} onValueChange={setSelectedOffice}>
          <SelectTrigger>
            <SelectValue placeholder="Select Office" />
          </SelectTrigger>
          <SelectContent>
            {offices.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}

function ESICPendingDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")

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
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year")
      return
    }
    toast.success("ESIC pending list downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear

  return (
    <>
      <DialogHeader>
        <DialogTitle>ESIC Pending List</DialogTitle>
        <DialogDescription>Employees without ESIC number</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}

function PFPendingDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")

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
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year")
      return
    }
    toast.success("PF pending list downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear

  return (
    <>
      <DialogHeader>
        <DialogTitle>PF Pending List</DialogTitle>
        <DialogDescription>Employees without PF number</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}

function AttritionRateDialog() {
  const [period, setPeriod] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")

  const periods = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ]

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
    { value: "12", label: "December" },
  ]

  const quarters = [
    { value: "Q1", label: "Q1 (Apr-Jun)" },
    { value: "Q2", label: "Q2 (Jul-Sep)" },
    { value: "Q3", label: "Q3 (Oct-Dec)" },
    { value: "Q4", label: "Q4 (Jan-Mar)" },
  ]

  const years = ["2024", "2025", "2026"]

  const handleDownload = () => {
    if (!period) {
      toast.error("Please select period type")
      return
    }
    if (period === "monthly" && (!selectedMonth || !selectedYear)) {
      toast.error("Please select month and year")
      return
    }
    if (period === "quarterly" && (!selectedQuarter || !selectedYear)) {
      toast.error("Please select quarter and year")
      return
    }
    if (period === "yearly" && !selectedYear) {
      toast.error("Please select year")
      return
    }
    toast.success("Attrition rate report downloaded successfully")
  }

  const isComplete =
    period &&
    ((period === "monthly" && selectedMonth && selectedYear) ||
      (period === "quarterly" && selectedQuarter && selectedYear) ||
      (period === "yearly" && selectedYear))

  return (
    <>
      <DialogHeader>
        <DialogTitle>Attrition Rate</DialogTitle>
        <DialogDescription>Monthly, quarterly, or yearly analysis</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {period === "monthly" && (
          <>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {period === "quarterly" && (
          <>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Quarter" />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {period === "yearly" && (
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}

function SalaryComparisonDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")

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
    { value: "12", label: "December" },
  ]

  const years = ["2024", "2025", "2026"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year")
      return
    }
    toast.success("Salary comparison report downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear

  return (
    <>
      <DialogHeader>
        <DialogTitle>Salary Comparison (Site-wise)</DialogTitle>
        <DialogDescription>Compare current vs previous month</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}
