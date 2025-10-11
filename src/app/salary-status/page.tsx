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
import { CalendarIcon, RefreshCw, FileDown, X } from "lucide-react"
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

export default function SalaryStatusPage() {
  const [client, setClient] = useState<string | "all">("all")
  const [status, setStatus] = useState<SalaryStatus | "all">("all")
  const [month, setMonth] = useState<Date | undefined>(undefined)

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

  return (
    <MainLayout>
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Salary Status</h1>
            <p className=" text-muted-foreground">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}