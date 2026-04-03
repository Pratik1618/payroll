"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, RefreshCw, FileDown, X, Eye, ChevronDown, ChevronUp, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { withBasePath } from "@/lib/base-path"

type SalaryStatus = "locked" | "pending" | "unlocked"

type SiteRecord = {
  id: string
  clientId: string
  client: string
  site: string
  cycleStart: string
  cycleEnd: string
  status: SalaryStatus
  lastLockedAt?: string
  unlockedAt?: string
  unlockedBy?: string
}

type ClientRecord = {
  id: string
  name: string
  cycleStart: string
  cycleEnd: string
  totalSites: number
  lockedSites: number
  overallStatus: SalaryStatus
  lastLockedAt?: string
  sites: SiteRecord[]
  processedEmployees:number
  totalEmployees:number

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
    clientId: "client-1",
    client: "Acme Corp",
    site: "Site A",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "locked",
    lastLockedAt: "2025-10-01",
  },
  {
    id: "S002",
    clientId: "client-1",
    client: "Acme Corp",
    site: "Site B",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "locked",
    lastLockedAt: "2025-10-01",
  },

  // ❌ Globex Ltd – PARTIALLY processed (PENDING)
  {
    id: "S003",
    clientId: "client-2",
    client: "Globex Ltd",
    site: "Plant 1",
    cycleStart: "2025-09-01",
    cycleEnd: "2025-09-30",
    status: "locked",
    lastLockedAt: "2025-10-02",
  },
  {
    id: "S004",
    clientId: "client-2",
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

const MOCK_SITE_EMPLOYEES: Record<string, { id: string }[]> = {
  S001: [{ id: "E001" }, { id: "E002" }, { id: "E003" }, { id: "E006" }], // 4 total, 3 processed
  S002: [{ id: "E007" }, { id: "E008" }],                          // 2 total, 0 processed
  S003: [{ id: "E004" }, { id: "E005" }, { id: "E009" }],             // 3 total, 2 processed
  S004: [{ id: "E010" }],                                       // 1 total, 0 processed
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
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>({})
  const [unlockedClients, setUnlockedClients] = useState<Record<string, boolean>>({})
  const [sites, setSites] = useState<SiteRecord[]>(MOCK_SITES)
  const [employeeSalariesBySite, setEmployeeSalariesBySite] =
    useState<Record<string, EmployeeSalary[]>>(MOCK_EMPLOYEE_SALARIES)
  const [siteEmployeesBySite, setSiteEmployeesBySite] =
    useState<Record<string, { id: string }[]>>(MOCK_SITE_EMPLOYEES)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const normalizeStatus = (value: unknown): SalaryStatus => {
      const normalized = String(value ?? "").toLowerCase()
      if (normalized === "locked" || normalized === "unlocked") {
        return normalized
      }
      return "pending"
    }

    const toNumber = (value: unknown) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : 0
    }

    const normalizeEmployee = (item: any, index: number): EmployeeSalary => ({
      id: String(item?.id ?? item?.employeeId ?? item?.empId ?? `EMP-${index}`),
      employeeName: String(item?.employeeName ?? item?.employee_name ?? item?.name ?? "-"),
      employeeId: String(item?.employeeId ?? item?.employee_code ?? item?.empCode ?? item?.id ?? "-"),
      basicSalary: toNumber(item?.basicSalary ?? item?.basic_salary ?? item?.basic),
      hra: toNumber(item?.hra),
      conveyance: toNumber(item?.conveyance),
      specialAllowance: toNumber(item?.specialAllowance ?? item?.special_allowance),
      grossSalary: toNumber(item?.grossSalary ?? item?.gross_salary ?? item?.gross),
      pf: toNumber(item?.pf),
      esic: toNumber(item?.esic),
      tds: toNumber(item?.tds),
      otherDeductions: toNumber(item?.otherDeductions ?? item?.other_deductions),
      totalDeductions: toNumber(item?.totalDeductions ?? item?.total_deductions),
      netPay: toNumber(item?.netPay ?? item?.net_pay ?? item?.netSalary),
    })

    const loadSalaryStatus = async () => {
      setIsLoading(true)
      setApiError(null)

      try {
        const params = new URLSearchParams()
        if (client !== "all") {
          params.set("clientId", client)
        }

        const url = params.toString()
          ? withBasePath(`/api/salary-status?${params.toString()}`)
          : withBasePath("/api/salary-status")

        const res = await fetch(url, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch salary status")
        }

        const rawItems = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.data)
              ? data.data
              : []

        if (rawItems.length === 0) {
          if (!isActive) return
          setSites([])
          setEmployeeSalariesBySite({})
          setSiteEmployeesBySite({})
          return
        }

        const normalizedSites: SiteRecord[] = rawItems.map((item: any, index: number) => ({
          id: String(item?.siteId ?? item?.site_id ?? item?.id ?? `SITE-${index}`),
          clientId: String(item?.clientId ?? item?.client_id ?? item?.clientCode ?? item?.client_code ?? item?.clientName ?? item?.client ?? "unknown-client"),
          client: String(item?.clientName ?? item?.client ?? item?.clientId ?? item?.client_id ?? "Unknown Client"),
          site: String(item?.siteName ?? item?.site ?? `Site ${index + 1}`),
          cycleStart: String(item?.cycleStart ?? item?.cycle_start ?? item?.salaryCycleStart ?? item?.monthStart ?? ""),
          cycleEnd: String(item?.cycleEnd ?? item?.cycle_end ?? item?.salaryCycleEnd ?? item?.monthEnd ?? ""),
          status: normalizeStatus(item?.status),
          lastLockedAt: item?.lastLockedAt ?? item?.last_locked_at,
          unlockedAt: item?.unlockedAt ?? item?.unlocked_at,
          unlockedBy: item?.unlockedBy ?? item?.unlocked_by,
        }))

        const normalizedEmployeeSalaries = rawItems.reduce((acc: Record<string, EmployeeSalary[]>, item: any, index: number) => {
          const siteId = String(item?.siteId ?? item?.site_id ?? item?.id ?? `SITE-${index}`)
          const employees = Array.isArray(item?.employees)
            ? item.employees.map(normalizeEmployee)
            : Array.isArray(item?.salaryDetails)
              ? item.salaryDetails.map(normalizeEmployee)
              : []

          acc[siteId] = employees
          return acc
        }, {})

        const normalizedSiteEmployees = rawItems.reduce((acc: Record<string, { id: string }[]>, item: any, index: number) => {
          const siteId = String(item?.siteId ?? item?.site_id ?? item?.id ?? `SITE-${index}`)
          const totalEmployees = toNumber(item?.totalEmployees ?? item?.total_employees)
          const employeeIds = Array.isArray(item?.employeeIds)
            ? item.employeeIds
            : Array.isArray(item?.employees)
              ? item.employees.map((employee: any, employeeIndex: number) =>
                  employee?.id ?? employee?.employeeId ?? employee?.empId ?? `EMP-${employeeIndex}`
                )
              : []

          const fallbackIds = employeeIds.length > 0
            ? employeeIds
            : Array.from(
                { length: Math.max(totalEmployees, normalizedEmployeeSalaries[siteId]?.length ?? 0) },
                (_, employeeIndex) => `${siteId}-${employeeIndex + 1}`
              )

          acc[siteId] = fallbackIds.map((employeeId: string | number) => ({
            id: String(employeeId),
          }))
          return acc
        }, {})

        if (!isActive) return

        setSites(normalizedSites)
        setEmployeeSalariesBySite(normalizedEmployeeSalaries)
        setSiteEmployeesBySite(normalizedSiteEmployees)
      } catch (error: any) {
        if (!isActive) return
        setApiError(error.message || "Failed to fetch salary status")
        setSites(MOCK_SITES)
        setEmployeeSalariesBySite(MOCK_EMPLOYEE_SALARIES)
        setSiteEmployeesBySite(MOCK_SITE_EMPLOYEES)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadSalaryStatus()

    return () => {
      isActive = false
    }
  }, [client])

  // Group sites by client and compute client-level status
  const clientRecords = useMemo(() => {
    const grouped = new Map<string, SiteRecord[]>()

    sites.forEach((site) => {
      if (!grouped.has(site.clientId)) {
        grouped.set(site.clientId, [])
      }
      grouped.get(site.clientId)!.push(site)
    })

    return Array.from(grouped.entries())
      .map(([clientId, sites]) => {
        const lockedSites = sites.filter((s) => s.status === "locked").length
        const totalSites = sites.length
        const clientName = sites[0]?.client || clientId
        const overallStatus: SalaryStatus =
          unlockedClients[clientId]
            ? "unlocked"
            : lockedSites === totalSites
              ? "locked"
              : "pending"

        const lastLockedAt = sites
          .filter((s) => s.lastLockedAt)
          .sort((a, b) => new Date(b.lastLockedAt!).getTime() - new Date(a.lastLockedAt!).getTime())
        [0]?.lastLockedAt

        const processedSites = lockedSites   // ✅ preserve processed data

       const totalEmployees = sites.reduce((sum, s) => {
  return sum + (siteEmployeesBySite[s.id]?.length || 0)
}, 0)

const processedEmployees = sites.reduce((sum, s) => {
  return sum + (employeeSalariesBySite[s.id]?.length || 0)
}, 0)

        return {
          id: clientId,
          name: clientName,
          cycleStart: sites[0]?.cycleStart || "",
          cycleEnd: sites[0]?.cycleEnd || "",
          totalSites,
          lockedSites: processedSites,
          totalEmployees, // ✅ new
          overallStatus,
          lastLockedAt,
          sites,

          processedEmployees,

        }

      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [employeeSalariesBySite, siteEmployeesBySite, sites, unlockedClients])

  const clientList = useMemo(
    () => [...clientRecords].sort((a, b) => a.name.localeCompare(b.name)),
    [clientRecords]
  )

  // Filter clients based on selected filters
  const filteredClients = useMemo(() => {
    return clientRecords.filter((c) => {
      const byClient = client === "all" || c.id === client
      const byStatus = status === "all" || c.overallStatus === status

      // Check if selected month falls within the salary cycle
      const byMonth = !month || isDateInCycle(month, c.cycleStart, c.cycleEnd)

      return byClient && byStatus && byMonth
    })
  }, [clientRecords, client, status, month])

  const counts = useMemo(() => ({
    total: filteredClients.length,
    locked: filteredClients.filter((c) => c.overallStatus === "locked").length,
    pending: filteredClients.filter((c) => c.overallStatus === "pending").length,
    unlocked: filteredClients.filter((c) => c.overallStatus === "unlocked").length,
  }), [filteredClients])

  const hasActiveFilters = client !== "all" || status !== "all" || month !== undefined

  function resetFilters() {
    setClient("all")
    setStatus("all")
    setMonth(undefined)
  }

  function handleExportCsv() {
    const headers = ["Client", "Salary Cycle Start", "Salary Cycle End", "Total Sites", "Locked Sites", "Status", "Last Locked"]
    const rows = filteredClients.map((c) => [
      c.name,
      c.cycleStart,
      c.cycleEnd,
      c.totalSites,
      c.lockedSites,
      c.overallStatus,
      c.lastLockedAt ?? ""
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(","))
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
    if (status === "locked")
      return "bg-primary text-primary-foreground"
    if (status === "unlocked")
      return "bg-yellow-100 text-yellow-800 border border-yellow-300"
    return "bg-muted text-foreground border border-border"
  }


  function handleViewDetails(clientRecord: ClientRecord) {
    setSelectedClient(clientRecord)
    setIsDialogOpen(true)
  }

  function handleUnlock(clientRecord: ClientRecord) {
    const confirmed = window.confirm(
      `Unlocking will allow salary re-processing for all ${clientRecord.totalSites} sites under ${clientRecord.name}. Are you sure?`
    )
    if (!confirmed) return

    // simulate backend success
    setUnlockedClients((prev) => ({
      ...prev,
      [clientRecord.id]: true,
    }))
  }

  function handleLock(clientRecord: ClientRecord) {
    const confirmed = window.confirm(
      `Locking will prevent further salary modifications for all ${clientRecord.totalSites} sites under ${clientRecord.name}. Are you sure?`
    )
    if (!confirmed) return

    // simulate backend success
    setUnlockedClients((prev) => {
      const newState = { ...prev }
      delete newState[clientRecord.id]
      return newState
    })
  }

  function getStatusLabel(status: SalaryStatus) {
    switch (status) {
      case "locked":
        return "Locked"
      case "pending":
        return "Pending"
      case "unlocked":
        return "Unlocked"
      default:
        return status
    }
  }


  function toggleSiteExpansion(clientId: string) {
    setExpandedSites((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }))
  }
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Salary Status</h1>
            <p className="text-sm text-muted-foreground">
              Track salary lock status and cycles across all clients.
            </p>
            {apiError && (
              <p className="text-sm text-destructive mt-1">
                {apiError}. Showing fallback data.
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleExportCsv} disabled={filteredClients.length === 0}>
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
                      {clientList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
                      <SelectItem value="unlocked">Unlocked</SelectItem>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{counts.locked}</div>
                  <p className="text-sm text-muted-foreground">Clients Locked</p>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{counts.pending}</div>
                  <p className="text-sm text-muted-foreground">Clients Pending</p>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold">{counts.unlocked}</div>
                  <p className="text-sm text-muted-foreground">Clients Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Client Status
              {counts.total > 0 && <span className="text-muted-foreground font-normal"> • {counts.total} total</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Client</TableHead>
                    <TableHead>Salary Cycle</TableHead>
                    <TableHead>Sites Processed</TableHead>
                    <TableHead>Employees</TableHead>

                    <TableHead>Status</TableHead>
                    <TableHead>Last Locked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {isLoading ? "Loading salary status..." : "No clients match the current filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{formatCycle(c.cycleStart, c.cycleEnd)}</TableCell>
                        <TableCell className="text-sm">
                          <span className="font-semibold text-primary">{c.lockedSites}</span>
                          <span className="text-muted-foreground">/{c.totalSites}</span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="text-primary font-semibold">
    {c.processedEmployees}
  </span>
  <span className="text-muted-foreground"> / {c.totalEmployees}</span>
                        </TableCell>

                        <TableCell>
                          <Badge className={cn("uppercase", getStatusBadgeVariant(c.overallStatus))}>
                            {getStatusLabel(c.overallStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(c.lastLockedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(c)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {c.overallStatus === "locked" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlock(c)}
                                className="h-8 px-2 text-destructive border-destructive"
                              >
                                Unlock
                              </Button>
                            )}
                            {c.overallStatus === "unlocked" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLock(c)}
                                className="h-8 px-2 text-primary border-primary"
                              >
                                <Lock className="h-4 w-4 mr-1" />
                                Lock
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Client Details Dialog - Client → Sites → Employees */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] !max-h-[90vh] !h-[90vh] overflow-hidden flex flex-col p-6">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl">
                Salary Details - {selectedClient?.name}
              </DialogTitle>
            <DialogDescription>
  {selectedClient && (
    <>
      {formatCycle(selectedClient.cycleStart, selectedClient.cycleEnd)} • 
      {selectedClient.lockedSites}/{selectedClient.totalSites} sites processed • 
      {selectedClient.processedEmployees}/{selectedClient.totalEmployees} employees processed
    </>
  )}
</DialogDescription>


            </DialogHeader>

            <div className="flex-1 overflow-auto mt-4 -mx-6 px-6">
              {!selectedClient || selectedClient.sites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No sites available for this client.
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedClient.sites.map((site) => {
                    const isExpanded = expandedSites[site.id] ?? false
                    const employeeSalaries = employeeSalariesBySite[site.id] || []

                    return (
                      <div key={site.id} className="border rounded-lg overflow-hidden">
                        {/* Site Header */}
                        <button
                          onClick={() => toggleSiteExpansion(site.id)}
                          className="w-full p-4 bg-muted/40 hover:bg-muted/60 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold flex items-center gap-3">
                                {site.site}
                            
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                {formatCycle(site.cycleStart, site.cycleEnd)}
                              </p>
                            </div>
                           <div className="flex items-center gap-3">
  {/* Status badge */}
  <Badge className={cn("uppercase", getStatusBadgeVariant(site.status))}>
    {getStatusLabel(site.status)}
  </Badge>

  {/* Employee count badge */}
  <Badge variant="outline" className="text-xs">
    <span className="text-primary font-semibold">
      {employeeSalariesBySite[site.id]?.length || 0}
    </span>
    <span className="text-muted-foreground">
      {" "} / {siteEmployeesBySite[site.id]?.length || 0} Employees
    </span>
  </Badge>
</div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 ml-2 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                          )}
                        </button>

                        {/* Site Details - Employee Table */}
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            {employeeSalaries.length === 0 ? (
                              <div className="p-6 text-center text-muted-foreground">
                                No salary data available for this site.
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold sticky left-0 bg-muted/50 z-10 min-w-[180px]">
                                      Employee
                                    </TableHead>
                                    <TableHead className="font-semibold min-w-[120px]">
                                      Employee ID
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[110px]">
                                      Basic
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[110px]">
                                      HRA
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[120px]">
                                      Conveyance
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[140px]">
                                      Special Allow.
                                    </TableHead>
                                    <TableHead className="text-right font-semibold bg-green-50 min-w-[120px]">
                                      Gross
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[100px]">
                                      PF
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[100px]">
                                      ESIC
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[100px]">
                                      TDS
                                    </TableHead>
                                    <TableHead className="text-right font-semibold min-w-[120px]">
                                      Other Ded.
                                    </TableHead>
                                    <TableHead className="text-right font-semibold bg-red-50 min-w-[120px]">
                                      Total Ded.
                                    </TableHead>
                                    <TableHead className="text-right font-semibold bg-primary/10 min-w-[130px]">
                                      Net Pay
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {employeeSalaries.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-muted/30">
                                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                                        {emp.employeeName}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {emp.employeeId}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.basicSalary)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.hra)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.conveyance)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.specialAllowance)}
                                      </TableCell>
                                      <TableCell className="text-right font-semibold bg-green-50 text-green-700">
                                        {formatCurrency(emp.grossSalary)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.pf)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.esic)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.tds)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(emp.otherDeductions)}
                                      </TableCell>
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
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
