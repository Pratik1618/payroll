"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react"
import { format, isSameMonth } from "date-fns"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  DATA                                      */
/* -------------------------------------------------------------------------- */

const statutoryReports = [
  {
    id: "pf-ecr",
    title: "PF ECR",
    format: "Excel",
    status: "generated",
    dueDate: "2024-01-25",
    lastGenerated: "2024-01-10",
  },
  {
    id: "esic-xml",
    title: "ESIC XML",
    format: "XML",
    status: "generated",
    dueDate: "2024-01-21",
    lastGenerated: "2024-01-12",
  },
  { id: "form-a", title: "Form A – Contractors Register", format: "PDF", status: "pending", dueDate: "2024-01-31" },
  { id: "form-b", title: "Form B – Employment Register", format: "PDF", status: "pending", dueDate: "2024-01-31" },
  { id: "form-c", title: "Form C – Employment Card", format: "PDF", status: "pending", dueDate: "2024-01-31" },
  { id: "form-d", title: "Form D – Service Certificate", format: "PDF", status: "pending", dueDate: "2024-01-31" },
  { id: "muster-roll", title: "Muster Roll", format: "Excel", status: "pending", dueDate: "2024-01-31" },
  { id: "wage-register", title: "Wage & Muster Roll Register", format: "Excel", status: "pending", dueDate: "2024-01-31" },
  { id: "fine-register", title: "Fine Register", format: "Excel", status: "pending", dueDate: "2024-01-31" },
  { id: "bonus-register", title: "Bonus Register", format: "Excel", status: "pending", dueDate: "2024-01-31" },
  { id: "form-f", title: "Form F – Deductions Register", format: "Excel", status: "pending", dueDate: "2024-01-31" },
  { id: "form-2", title: "Form 2 – Return of Contribution", format: "PDF", status: "pending", dueDate: "2024-01-31" },
  { id: "form-xx", title: "Form XX – Annual Return", format: "PDF", status: "pending", dueDate: "2024-01-31" },
]

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export default function StatutoryPage() {
  const [filters, setFilters] = useState({
    branch: "",
    client: "",
    site: "",
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
  })
const isFilterValid =
  Boolean(filters.branch && filters.fromDate && filters.toDate)



  /* ------------------------ SUMMARY COUNTS ------------------------ */

  const generatedCount = statutoryReports.filter(r => r.status === "generated").length
  const pendingCount = statutoryReports.filter(r => r.status === "pending").length
  const overdueCount = statutoryReports.filter(
    r => r.status === "pending" && new Date(r.dueDate) < new Date()
  ).length
  const thisMonthCount = statutoryReports.filter(
    r => r.lastGenerated && isSameMonth(new Date(r.lastGenerated), new Date())
  ).length

  /* ------------------------ ACTIONS ------------------------ */

const handleGenerate = (reportId: string) => {
  if (!filters.branch || !filters.fromDate || !filters.toDate) return

  const payload: any = {
    reportId,
    branch: filters.branch,
    fromDate: format(filters.fromDate, "yyyy-MM-dd"),
    toDate: format(filters.toDate, "yyyy-MM-dd"),
  }

  if (filters.client) payload.client = filters.client
  if (filters.site) payload.site = filters.site

  console.log("GENERATE:", payload)
}


  const handleDownload = (reportId: string) => {
    console.log("DOWNLOAD:", reportId)
  }

  /* -------------------------------------------------------------------------- */

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* ---------------- HEADER ---------------- */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Statutory & Labour Reports</h1>
          <p className="text-muted-foreground">
            Manage compliance registers and statutory filings
          </p>
        </div>

        {/* ---------------- SUMMARY CARDS ---------------- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard 
            title="Generated" 
            count={generatedCount} 
            icon={CheckCircle}
            iconColor="text-emerald-600 dark:text-emerald-500"
          />
          <SummaryCard 
            title="Pending" 
            count={pendingCount} 
            icon={Clock}
            iconColor="text-amber-600 dark:text-amber-500"
          />
          <SummaryCard 
            title="Overdue" 
            count={overdueCount} 
            icon={AlertCircle}
            iconColor="text-rose-600 dark:text-rose-500"
          />
          <SummaryCard 
            title="This Month" 
            count={thisMonthCount} 
            icon={TrendingUp}
            iconColor="text-blue-600 dark:text-blue-500"
          />
        </div>

        {/* ---------------- FILTER BAR ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

              <FilterSelect
                label="Branch"
                value={filters.branch}
                onChange={(v) => setFilters(f => ({ ...f, branch: v }))}
                options={[
                  { value: "north", label: "North" },
                  { value: "south", label: "South" },
                  { value: "west", label: "West" },
                ]}
              />

              <FilterSelect
                label="Client"
                value={filters.client}
                onChange={(v) => setFilters(f => ({ ...f, client: v }))}
                options={[
                  { value: "client-a", label: "Client A" },
                  { value: "client-b", label: "Client B" },
                ]}
              />

              <FilterSelect
                label="Site"
                value={filters.site}
                onChange={(v) => setFilters(f => ({ ...f, site: v }))}
                options={[
                  { value: "site-1", label: "Site 1" },
                  { value: "site-2", label: "Site 2" },
                ]}
              />

              <DatePicker
                label="From Date"
                value={filters.fromDate}
                onChange={(d) => setFilters(f => ({ ...f, fromDate: d }))}
              />

              <DatePicker
                label="To Date"
                value={filters.toDate}
                onChange={(d) => setFilters(f => ({ ...f, toDate: d }))}
              />

            </div>

 {(!filters.branch || !filters.fromDate || !filters.toDate) && (
  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
    <AlertCircle className="h-4 w-4" />
    <span>Please select Branch and Date range to generate reports</span>
  </div>
)}

          </CardContent>
        </Card>

        {/* ---------------- REPORTS GRID ---------------- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statutoryReports.map((report) => (
            <Card key={report.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {report.title}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {report.format}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  {report.status === "generated" ? (
                    <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Generated
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>

                {report.lastGenerated && (
                  <p className="text-xs text-muted-foreground">
                    Last generated: {format(new Date(report.lastGenerated), "dd MMM yyyy")}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Due date: {format(new Date(report.dueDate), "dd MMM yyyy")}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                   disabled={!filters.branch || !filters.fromDate || !filters.toDate}

                    onClick={() => handleGenerate(report.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(report.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  count,
  icon: Icon,
  iconColor,
}: {
  title: string
  count: number
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
          <Icon className={cn("h-8 w-8", iconColor)} />
        </div>
      </CardContent>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value?: Date
  onChange: (date?: Date) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}