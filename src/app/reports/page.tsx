"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Download, BarChart3, FileText, TrendingDown, GitCompare, FileSpreadsheet, Clock, Users, Award, BarChart4, Layers, Network, Diff, BadgeCheck, ShieldCheck, FileWarning, IndianRupee, RefreshCcw, Ban, AlertTriangle, Lock, UserPlus, ClockPlus } from "lucide-react"

type ReportType =
  | "salary-report"
  | "payroll-mis"
  | "esic-pending"
  | "pf-pending"
  | "attrition-rate"
  | "salary-comparison"
  | "pending-salary"
  | "employee-dump"

  | "age-58-locking"
  | "age-report"
  | "blacklisted-employee"
  | "rejoin-employee"
  | "gratuity-report"
  | "monthly-left-employee"
  | "employee-of-month"
  | "double-joining-block"
  | "zone-wise-executive-mapping"
  | "police-verification"
  | "bvg-employee-validity"
  | "minimum-wages-not-updated"
  | "bvg-positive-negative"
  | "salary-unpaid"
  | "region-wise-manpower"
  | "site-mapping-hierarchy"
  | "left-45-days-lock"
  | "under-18-employee"
  | "mediclaim-report"
  | "esic-family-report"
  | "last-month-processed-current-not"
  | "today-emp-id-generated"
  | "payment-date-report"
  | "site-license-applicability"
  | "statutory-contribution-single"
  | "gratuity-valuation"

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
    title: "UAN Pending List",
    description: "Employees without UAN number",
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
  {
    id: "pending-salary",
    title: "Pending Salary Details",
    description: "Salaries pending for disbursement",
    icon: Clock,
    iconColor: "text-amber-600",
  },
  {
    id: "employee-dump",
    title: "Employee Dump",
    description: "All information of employee",
    icon: Users,
    iconColor: "text-emerald-600",
  },
  {
    id: "age-58-locking",
    title: "58 Years Age Locking",
    description: "Employees auto-locked after 58 years",
    icon: Lock,
    iconColor: "text-red-700",
  },
  {
    id: "age-report",
    title: "Age Report",
    description: "Employee age-wise listing",
    icon: Users,
    iconColor: "text-indigo-600",
  },
  {
    id: "under-18-employee",
    title: "Under 18 Employees",
    description: "Compliance check for minors",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },

  // 🔹 Employee Lifecycle
  {
    id: "blacklisted-employee",
    title: "Blacklisted Employees",
    description: "Marked blacklisted employees",
    icon: Ban,
    iconColor: "text-black",
  },
  {
    id: "rejoin-employee",
    title: "Re-Joining Employee Report",
    description: "Employees who joined again",
    icon: RefreshCcw,
    iconColor: "text-green-600",
  },
  {
    id: "left-45-days-lock",
    title: "Left Employee 45 Days Lock",
    description: "Auto lock after 45 days",
    icon: Clock,
    iconColor: "text-orange-600",
  },
  {
    id: "monthly-left-employee",
    title: "Monthly Left Employees",
    description: "Region & site-wise exit list",
    icon: TrendingDown,
    iconColor: "text-rose-600",
  },

  // 🔹 Salary / Payroll
  {
    id: "salary-unpaid",
    title: "Salary Unpaid",
    description: "Employees with unpaid salary",
    icon: IndianRupee,
    iconColor: "text-red-600",
  },
  {
    id: "minimum-wages-not-updated",
    title: "Minimum Wages Not Updated",
    description: "State & central mismatch",
    icon: FileWarning,
    iconColor: "text-yellow-600",
  },

  // 🔹 Compliance / Verification
  {
    id: "police-verification",
    title: "Police Verification Status",
    description: "Verification number & validity",
    icon: ShieldCheck,
    iconColor: "text-blue-700",
  },
  {
    id: "bvg-employee-validity",
    title: "BGV Employee Validity",
    description: "BVG number & validity dates",
    icon: BadgeCheck,
    iconColor: "text-emerald-600",
  },
  {
    id: "bvg-positive-negative",
    title: "BGV Positive / Negative Report",
    description: "Employee status (+ / -)",
    icon: Diff,
    iconColor: "text-cyan-600",
  },

  // 🔹 Mapping / Hierarchy
  {
    id: "zone-wise-executive-mapping",
    title: "Zone-wise Executive Mapping",
    description: "OE → RM → AVP → VP",
    icon: Network,
    iconColor: "text-indigo-700",
  },
  {
    id: "site-mapping-hierarchy",
    title: "Site Mapping Hierarchy",
    description: "Level 1 to Level 4 mapping",
    icon: Layers,
    iconColor: "text-purple-600",
  },

  // 🔹 Analytics
  {
    id: "region-wise-manpower",
    title: "Region-wise(designation/Gender) Manpower Count",
    description: "West, North, South, East",
    icon: BarChart4,
    iconColor: "text-teal-600",
  },

  // 🔹 RnR
  {
    id: "employee-of-month",
    title: "Employee of the Month",
    description: "RNR certificate generation",
    icon: Award,
    iconColor: "text-yellow-600",
  },
  {
    id: "mediclaim-report",
    title: "Mediclaim Eligibility Report",
    description: "Family coverage based on gross salary",
    icon: ShieldCheck,
    iconColor: "text-green-700",
  },
  {
    id: "esic-family-report",
    title: "ESIC Family Coverage",
    description: "Unlimited children allowed",
    icon: Users,
    iconColor: "text-blue-700",
  },
  {
    id: "last-month-processed-current-not",
    title: "Payroll Gap Report (Previous vs Current Month)",
    description: "Employees processed last month but missing this month",
    icon: AlertTriangle,
    iconColor: "text-red-700",
  },
  {
    id: "today-emp-id-generated",
    title: "Employees Created Today",
    description: "Employee IDs generated today",
    icon: ClockPlus,
    iconColor: "text-indigo-700",
  },
  {
    id: "payment-date-report",
    title: "Payment Date Report",
    description: "Site-wise salary payment tracking",
    icon: IndianRupee,
    iconColor: "text-green-700",
  },
  {
    id: "site-license-applicability",
    title: "Site License Applicability",
    description: "State/Central license vs manpower",
    icon: ShieldCheck,
    iconColor: "text-red-700",
  },
  {
    id: "statutory-contribution-single",
    title: "PF / ESIC Contribution (Single Employee)",
    description: "Employee & employer contribution from–to",
    icon: FileSpreadsheet,
    iconColor: "text-indigo-700",
  },
  {
    id: "gratuity-valuation",
    title: "Gratuity Valuation",
    description: "Employee wise gratuity calculation",
    icon: FileSpreadsheet,
    iconColor: "text-purple-700",
  },
  {
    id: "Statutory-damage-intrest",
    title: "Statutory Damage and Interest",
    description: "PF,ESIC,PT  DAMAGE & INTEREST",
    icon: FileSpreadsheet,
    iconColor: "text-purple-700",
  }


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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reports.map((report) => {
                const Icon = report.icon
                return (
                  <button
                    key={report.id}
                    onClick={() => {
                      if (report.id === "employee-dump") {
                        downloadEmployeeDump()
                      }
                      else if (report.id === "mediclaim-report") {
                        downloadMediclaimReport()
                      }

                      else if (report.id === "esic-family-report") {
                        downloadESICReport()
                      }
                      else if (report.id === "gratuity-valuation") {
                        downloadGratuityValuation()
                      } else {
                        setSelectedReport(report.id as ReportType)
                      }
                    }}

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
            {selectedReport === "pending-salary" && <PendingSalaryDialog />}
            {selectedReport === "employee-of-month" && <EmployeeOfMonthDialog />}
            {selectedReport === "statutory-contribution-single" && (<StatutoryContributionDialog />)}
            {selectedReport === "payment-date-report" && <PaymentDateDialog />}

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
        <DialogTitle>UAN Pending List</DialogTitle>
        <DialogDescription>Employees without UAN number</DialogDescription>
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

function PendingSalaryDialog() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSite, setSelectedSite] = useState<string>("")

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
  const sites = ["All Sites", "Site A", "Site B", "Site C", "Site D"]

  const handleDownload = () => {
    if (!selectedMonth || !selectedYear || !selectedSite) {
      toast.error("Please select all filters")
      return
    }

    // Generate mock CSV data for pending salaries
    const csvHeader = "Employee ID,Employee Name,Site,Gross Salary,Deductions,Net Salary,Status,Pending Since\n"
    const csvData = [
      "EMP001,John Doe,Site A,45000,5000,40000,Pending,2024-11-15",
      "EMP002,Jane Smith,Site B,38000,4200,33800,Pending,2024-11-20",
      "EMP003,Mike Johnson,Site A,52000,6500,45500,Pending,2024-11-18",
    ].join("\n")

    const blob = new Blob([csvHeader + csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pending-salary-${selectedMonth}-${selectedYear}-${selectedSite.replace(/\s+/g, "-")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success("Pending salary report downloaded successfully")
  }

  const isComplete = selectedMonth && selectedYear && selectedSite

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pending Salary Details</DialogTitle>
        <DialogDescription>Salaries pending for disbursement</DialogDescription>
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
        <Select value={selectedSite} onValueChange={setSelectedSite}>
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
        <Button onClick={handleDownload} disabled={!isComplete} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
    </>
  )
}
import * as XLSX from "xlsx"
import { EmployeeOfMonthDialog } from "@/components/ui/mis/employee-of-month/employee-of-month-dialog"
import { StatutoryContributionDialog } from "@/components/ui/mis/statutory-contribution/statutory-contribution-dialog"
import { GratuityValuationDialog } from "@/components/ui/mis/gratuity-valuation/gratuity-valuation-dialog"
import { downloadGratuityValuation } from "@/components/ui/mis/gratuity-valuation/gratuity-valuation"
import { PaymentDateDialog } from "@/components/ui/mis/payment-date/payment-date-dialog"

function downloadEmployeeDump() {
  // 🔹 Mock data – replace with API data later
  const employees = [
    {
      EmpCode: "EMP001",
      Name: "Ramesh Patil",
      Aadhaar: "XXXX-XXXX-1234",
      PAN: "ABCDE1234F",
      Mobile: "9876543210",
      Address: "Mumbai, Maharashtra",
      Site: "Site A",
      Designation: "Security Guard",
      GrossSalary: 18000,
      NetSalary: 15500,
      DOJ: "2022-06-15",
      Status: "Active",
    },
    {
      EmpCode: "EMP002",
      Name: "Suresh Kale",
      Aadhaar: "XXXX-XXXX-5678",
      PAN: "PQRSX5678Z",
      Mobile: "9123456780",
      Address: "Pune, Maharashtra",
      Site: "Site B",
      Designation: "Supervisor",
      GrossSalary: 22000,
      NetSalary: 19000,
      DOJ: "2021-03-10",
      Status: "Active",
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(employees)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees")

  XLSX.writeFile(workbook, "Employee_Dump.xlsx")

  toast.success("Employee dump downloaded successfully")
}

type Child = {
  name: string
  gender: "Male" | "Female"
  age: number
}

type Employee = {
  empCode: string
  name: string
  grossSalary: number
  spouse?: string
  parents?: {
    father?: string
    mother?: string
  }
  children: Child[]
}

const employees: Employee[] = [
  {
    empCode: "EMP001",
    name: "Ramesh Patil",
    grossSalary: 23000,
    spouse: "Sunita Patil",
    parents: {
      father: "Vasant Patil",
      mother: "Lata Patil",
    },
    children: [
      { name: "Aarav Patil", gender: "Male", age: 8 },
      { name: "Anaya Patil", gender: "Female", age: 5 },
      { name: "Extra Child", gender: "Male", age: 3 }, // ❌ ignored for mediclaim
    ],
  },
  {
    empCode: "EMP002",
    name: "Suresh Kale",
    grossSalary: 18000,
    spouse: "Meena Kale",
    parents: {
      father: "Raghunath Kale",
      mother: "Shanta Kale",
    },
    children: [
      { name: "Child 1", gender: "Male", age: 10 },
      { name: "Child 2", gender: "Female", age: 7 },
      { name: "Child 3", gender: "Female", age: 4 }, // ✅ allowed for ESIC
    ],
  },
]





function pushCommonMembers(rows: any[], emp: Employee) {
  rows.push({
    EmpCode: emp.empCode,
    EmpName: emp.name,
    GrossSalary: emp.grossSalary,
    DependentType: "Employee",
    DependentName: emp.name,
  })

  if (emp.spouse) {
    rows.push({
      EmpCode: emp.empCode,
      EmpName: emp.name,
      GrossSalary: emp.grossSalary,
      DependentType: "Spouse",
      DependentName: emp.spouse,
    })
  }

  if (emp.parents?.father) {
    rows.push({
      EmpCode: emp.empCode,
      EmpName: emp.name,
      GrossSalary: emp.grossSalary,
      DependentType: "Father",
      DependentName: emp.parents.father,
    })
  }

  if (emp.parents?.mother) {
    rows.push({
      EmpCode: emp.empCode,
      EmpName: emp.name,
      GrossSalary: emp.grossSalary,
      DependentType: "Mother",
      DependentName: emp.parents.mother,
    })
  }
}

function makeChildRow(emp: Employee, child: Child) {
  return {
    EmpCode: emp.empCode,
    EmpName: emp.name,
    GrossSalary: emp.grossSalary,
    DependentType: "Child",
    DependentName: child.name,
    Gender: child.gender,
    Age: child.age,
  }
}


function generateMediclaimRows() {
  return employees
    .filter(emp => emp.grossSalary > 21000)
    .map(emp => {
      const children = emp.children.slice(0, 2)

      return {
        EmpCode: emp.empCode,
        EmpName: emp.name,
        GrossSalary: emp.grossSalary,

        Spouse: emp.spouse || "",
        Father: emp.parents?.father || "",
        Mother: emp.parents?.mother || "",

        Child1Name: children[0]?.name || "",
        Child1Gender: children[0]?.gender || "",
        Child1Age: children[0]?.age || "",

        Child2Name: children[1]?.name || "",
        Child2Gender: children[1]?.gender || "",
        Child2Age: children[1]?.age || "",
      }
    })
}




function generateESICRows() {
  return employees
    .filter(emp => emp.grossSalary <= 21000)
    .map(emp => {
      const children = emp.children

      return {
        EmpCode: emp.empCode,
        EmpName: emp.name,
        GrossSalary: emp.grossSalary,

        Spouse: emp.spouse || "",
        Father: emp.parents?.father || "",
        Mother: emp.parents?.mother || "",

        Child1Name: children[0]?.name || "",
        Child1Gender: children[0]?.gender || "",
        Child1Age: children[0]?.age || "",

        Child2Name: children[1]?.name || "",
        Child2Gender: children[1]?.gender || "",
        Child2Age: children[1]?.age || "",

        Child3Name: children[2]?.name || "",
        Child3Gender: children[2]?.gender || "",
        Child3Age: children[2]?.age || "",

        Child4Name: children[3]?.name || "",
        Child4Gender: children[3]?.gender || "",
        Child4Age: children[3]?.age || "",
      }
    })
}





function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report")
  XLSX.writeFile(workbook, fileName)
}


function downloadMediclaimReport() {
  exportToExcel(
    generateMediclaimRows(),
    "Mediclaim_Eligibility_Report.xlsx"
  )
  toast.success("Mediclaim report downloaded")
}

function downloadESICReport() {
  exportToExcel(
    generateESICRows(),
    "ESIC_Family_Coverage_Report.xlsx"
  )
  toast.success("ESIC family report downloaded")
}
