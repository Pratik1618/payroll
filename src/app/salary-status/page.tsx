"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, RefreshCw, FileDown, X, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MainLayout } from "@/components/ui/layout/main-layout"

type SalaryStatus = "locked" | "pending"

type SiteRecord = {
  id: string
  client: string
  site: string
  cycleStart: string
  cycleEnd: string
  status: SalaryStatus
  lastLockedAt?: string
}

type EmployeeSalary = {
  id: string
  employeeName: string
  employeeId: string
  basicSalary: number
  hra: number
  conveyance: number
  specialAllowance: number
  grossSalary: number
  pf: number
  esic: number
  tds: number
  otherDeductions: number
  totalDeductions: number
  netPay: number
}

const MOCK_SITES: SiteRecord[] = [
  {
    id: "S001",
    client: "Acme Corp",
    site: "Site A",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "locked",
    lastLockedAt: "2025-10-01",
  },
  {
    id: "S002",
    client: "Acme Corp",
    site: "Site B",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "pending",
  },
  {
    id: "S003",
    client: "Globex Ltd",
    site: "Plant 1",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "locked",
    lastLockedAt: "2025-10-02",
  },
  {
    id: "S004",
    client: "Globex Ltd",
    site: "Warehouse",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "pending",
  },
]

// Mock employee salary data
const MOCK_EMPLOYEE_SALARIES: Record<string, EmployeeSalary[]> = {
  S001: [
    {
      id: "E001",
      employeeName: "Rajesh Kumar",
      employeeId: "EMP001",
      basicSalary: 25000,
      hra: 10000,
      conveyance: 1600,
      specialAllowance: 5000,
      grossSalary: 41600,
      pf: 1800,
      esic: 325,
      tds: 2500,
      otherDeductions: 0,
      totalDeductions: 4625,
      netPay: 36975,
    },
    {
      id: "E002",
      employeeName: "Priya Sharma",
      employeeId: "EMP002",
      basicSalary: 30000,
      hra: 12000,
      conveyance: 1600,
      specialAllowance: 6000,
      grossSalary: 49600,
      pf: 1800,
      esic: 388,
      tds: 3500,
      otherDeductions: 500,
      totalDeductions: 6188,
      netPay: 43412,
    },
    {
      id: "E003",
      employeeName: "Amit Patel",
      employeeId: "EMP003",
      basicSalary: 22000,
      hra: 8800,
      conveyance: 1600,
      specialAllowance: 4000,
      grossSalary: 36400,
      pf: 1800,
      esic: 284,
      tds: 1800,
      otherDeductions: 0,
      totalDeductions: 3884,
      netPay: 32516,
    },
  ],
  S003: [
    {
      id: "E004",
      employeeName: "Sunita Verma",
      employeeId: "EMP004",
      basicSalary: 28000,
      hra: 11200,
      conveyance: 1600,
      specialAllowance: 5500,
      grossSalary: 46300,
      pf: 1800,
      esic: 362,
      tds: 3000,
      otherDeductions: 200,
      totalDeductions: 5362,
      netPay: 40938,
    },
    {
      id: "E005",
      employeeName: "Vikram Singh",
      employeeId: "EMP005",
      basicSalary: 32000,
      hra: 12800,
      conveyance: 1600,
      specialAllowance: 7000,
      grossSalary: 53400,
      pf: 1800,
      esic: 417,
      tds: 4200,
      otherDeductions: 0,
      totalDeductions: 6417,
      netPay: 46983,
    },
  ],
}

// Utility function for consistent date formatting
function formatDate(dateISO: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateISO) return "-"
  const date = new Date(dateISO)
  const defaultOpts: Intl.DateTimeFormatOptions = { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  }
  return date.toLocaleDateString(undefined, options || defaultOpts)
}

function formatCycle(startISO: string, endISO: string): string {
  return `${formatDate(startISO)} – ${formatDate(endISO)}`
}

// Check if a date falls within a cycle
function isDateInCycle(date: Date, cycleStart: string, cycleEnd: string): boolean {
  const start = new Date(cycleStart)
  const end = new Date(cycleEnd)
  return date >= start && date <= end
}

// Format currency in Indian format
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function SalaryStatusPage() {
  const [client, setClient] = useState<string | "all">("all")
  const [status, setStatus] = useState<SalaryStatus | "all">("all")
  const [month, setMonth] = useState<Date | undefined>(undefined)
  const [selectedSite, setSelectedSite] = useState<SiteRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const clients = useMemo(() => 
    Array.from(new Set(MOCK_SITES.map((s) => s.client))).sort(), 
  [])

  const filtered = useMemo(() => {
    return MOCK_SITES.filter((s) => {
      const byClient = client === "all" || s.client === client
      const byStatus = status === "all" || s.status === status
      
      // Check if selected month falls within the salary cycle
      const byMonth = !month || isDateInCycle(month, s.cycleStart, s.cycleEnd)
      
      return byClient && byStatus && byMonth
    })
  }, [client, status, month])

  const counts = useMemo(() => ({
    total: filtered.length,
    locked: filtered.filter((s) => s.status === "locked").length,
    pending: filtered.filter((s) => s.status === "pending").length,
  }), [filtered])

  const hasActiveFilters = client !== "all" || status !== "all" || month !== undefined

  function resetFilters() {
    setClient("all")
    setStatus("all")
    setMonth(undefined)
  }

  function handleExportCsv() {
    const headers = ["Client", "Site", "Salary Cycle Start", "Salary Cycle End", "Status", "Last Locked"]
    const rows = filtered.map((s) => [
      s.client, 
      s.site, 
      s.cycleStart, 
      s.cycleEnd, 
      s.status, 
      s.lastLockedAt ?? ""
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `salary-status-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadgeVariant = (status: SalaryStatus) => {
    return status === "locked" 
      ? "bg-primary text-primary-foreground" 
      : "bg-muted text-foreground border border-border"
  }

  function handleViewDetails(site: SiteRecord) {
    setSelectedSite(site)
    setIsDialogOpen(true)
  }

  const employeeSalaries = selectedSite ? MOCK_EMPLOYEE_SALARIES[selectedSite.id] || [] : []

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Salary Status</h1>
            <p className="text-sm text-muted-foreground">
              Track salary lock status and cycles across all client sites.
            </p>
          </div>
          <Button variant="outline" onClick={handleExportCsv} disabled={filtered.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Filters */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-filter" className="text-sm text-muted-foreground">
                    Client
                  </Label>
                  <Select value={client} onValueChange={setClient}>
                    <SelectTrigger id="client-filter">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Month</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !month && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {month ? formatDate(month.toISOString(), { month: "long", year: "numeric" }) : "Pick month"}
                        {month && (
                          <X 
                            className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" 
                            onClick={(e) => {
                              e.stopPropagation()
                              setMonth(undefined)
                            }}
                          />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar 
                        mode="single" 
                        selected={month} 
                        onSelect={setMonth}
                        initialFocus 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{counts.locked}</div>
                  <p className="text-sm text-muted-foreground">Sites Locked</p>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{counts.pending}</div>
                  <p className="text-sm text-muted-foreground">Sites Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Sites Status
              {counts.total > 0 && <span className="text-muted-foreground font-normal"> • {counts.total} total</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Client</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Salary Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Locked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No sites match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{s.client}</TableCell>
                        <TableCell>{s.site}</TableCell>
                        <TableCell>{formatCycle(s.cycleStart, s.cycleEnd)}</TableCell>
                        <TableCell>
                          <Badge className={cn("uppercase", getStatusBadgeVariant(s.status))}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(s.lastLockedAt)}</TableCell>
                        <TableCell className="text-right">
                          {s.status === "locked" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(s)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Salary Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] !max-h-[90vh] !h-[90vh] overflow-hidden flex flex-col p-6">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl">
                Salary Details - {selectedSite?.site}
              </DialogTitle>
              <DialogDescription>
                {selectedSite && (
                  <>
                    {selectedSite.client} • {formatCycle(selectedSite.cycleStart, selectedSite.cycleEnd)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto mt-4 -mx-6 px-6">
              {employeeSalaries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No salary data available for this site.
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold sticky left-0 bg-muted/50 z-10 min-w-[180px]">Employee</TableHead>
                          <TableHead className="font-semibold min-w-[120px]">Employee ID</TableHead>
                          <TableHead className="text-right font-semibold min-w-[110px]">Basic</TableHead>
                          <TableHead className="text-right font-semibold min-w-[110px]">HRA</TableHead>
                          <TableHead className="text-right font-semibold min-w-[120px]">Conveyance</TableHead>
                          <TableHead className="text-right font-semibold min-w-[140px]">Special Allow.</TableHead>
                          <TableHead className="text-right font-semibold bg-green-50 min-w-[120px]">Gross</TableHead>
                          <TableHead className="text-right font-semibold min-w-[100px]">PF</TableHead>
                          <TableHead className="text-right font-semibold min-w-[100px]">ESIC</TableHead>
                          <TableHead className="text-right font-semibold min-w-[100px]">TDS</TableHead>
                          <TableHead className="text-right font-semibold min-w-[120px]">Other Ded.</TableHead>
                          <TableHead className="text-right font-semibold bg-red-50 min-w-[120px]">Total Ded.</TableHead>
                          <TableHead className="text-right font-semibold bg-primary/10 min-w-[130px]">Net Pay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeSalaries.map((emp) => (
                          <TableRow key={emp.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium sticky left-0 bg-background z-10">{emp.employeeName}</TableCell>
                            <TableCell className="text-muted-foreground">{emp.employeeId}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.basicSalary)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.hra)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.conveyance)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.specialAllowance)}</TableCell>
                            <TableCell className="text-right font-semibold bg-green-50 text-green-700">
                              {formatCurrency(emp.grossSalary)}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.pf)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.esic)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.tds)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(emp.otherDeductions)}</TableCell>
                            <TableCell className="text-right font-semibold bg-red-50 text-red-700">
                              {formatCurrency(emp.totalDeductions)}
                            </TableCell>
                            <TableCell className="text-right font-bold bg-primary/10 text-primary">
                              {formatCurrency(emp.netPay)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}