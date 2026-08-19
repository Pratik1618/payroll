"use client"

import { useEffect, useRef, useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus, ChevronDown } from "lucide-react"
import { EmployeeAutocomplete } from "@/components/ui/payroll/employee-autocomplete"
import { useClients, useClientSites } from "@/hooks/use-shared-master-data"
import { withBasePath } from "@/lib/base-path"

function getCurrentUser(): { userId: string; role: string } {
  if (typeof document === "undefined") return { userId: "unknown", role: "unknown" }
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  if (!match) return { userId: "unknown", role: "unknown" }
  try {
    const payload = JSON.parse(atob(match[1].split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return { userId: payload.user_id || payload.sub || "unknown", role: payload.role || "unknown" }
  } catch {
    return { userId: "unknown", role: "unknown" }
  }
}

interface ScheduledEntry {
  id: string
  empCode: string
  empName: string
  branch: string
  client: string
  site: string
  month: string
  type: "Earning" | "Deduction"
  component: string
  amount: number
  reference: string
  status: "Scheduled" | "Applied" | "Cancelled"
}

const earningComponents = [
  "Incentive",
  "Mobile Allowance",
  "Arrears",
  "Bonus",
  "Performance Bonus",
  "Travel Allowance",
  "Other Allowance",
]

const deductionComponents = [
  "Advance",
  "Uniform",
  "Penalty",
  "Recovery",
  "Loan Repayment",
  "Damage Recovery",
  "Other Deduction",
]

const fallbackClients = [
  { id: "client-1", name: "ABC Corporation" },
  { id: "client-2", name: "XYZ Industries" },
]

const fallbackSites = [
  { id: "site-a", name: "Corporate Office", clientId: "client-1" },
  { id: "site-b", name: "Manufacturing Unit", clientId: "client-1" },
]

export default function EarningDeductionPage() {
  const [selectedBranch, setSelectedBranch] = useState("")
  const { clients: masterClients } = useClients(fallbackClients as any)
  const clients = masterClients.length ? masterClients : fallbackClients
  const [selectedClient, setSelectedClient] = useState(clients.length ? clients[0]?.id : "")
  const [selectedSite, setSelectedSite] = useState("")
  const { sites: clientSites } = useClientSites(selectedClient, fallbackSites)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false)
  const [siteSearch, setSiteSearch] = useState("")
  const siteDropdownRef = useRef<HTMLDivElement>(null)
  const [employeeCode, setEmployeeCode] = useState("")
  const [entryType, setEntryType] = useState<"Earning" | "Deduction">("Earning")
  const [selectedComponent, setSelectedComponent] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>([])
  const [employees, setEmployees] = useState<
    { code: string; name: string; designation: string; site: string }[]
  >([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  useEffect(() => {
    fetch(withBasePath("/api/employees/search?query="), { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const rows = json?.results?.data ?? json?.results ?? []
        setEmployees(
          (Array.isArray(rows) ? rows : []).map((r: any) => ({
            code: r.empCode,
            name: r.empName,
            designation: r.designation,
            site: r.site,
          }))
        )
      })
      .catch((error) => {
        console.error("Failed to load employees:", error)
        toast.error("Failed to load employees")
      })
  }, [])

  const loadScheduledEntries = async (empCode: string) => {
    if (!empCode) {
      setScheduledEntries([])
      return
    }
    setEntriesLoading(true)
    try {
      const res = await fetch(withBasePath(`/api/earning-deduction/employee/${encodeURIComponent(empCode)}`), {
        credentials: "include",
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || `Failed to load entries (${res.status})`)
      }
      const rows = json?.results?.entries ?? []
      setScheduledEntries(
        rows.map((r: any) => ({
          id: r.id,
          empCode,
          empName: employees.find((e) => e.code === empCode)?.name || "Unknown",
          branch: selectedBranch,
          client: selectedClient,
          site: selectedSite,
          month: r.month,
          type: r.type,
          component: r.component,
          amount: r.amount,
          reference: r.reference || "",
          status: r.status,
        }))
      )
    } catch (error: any) {
      toast.error(error.message || "Failed to load scheduled entries")
    } finally {
      setEntriesLoading(false)
    }
  }

  useEffect(() => {
    loadScheduledEntries(employeeCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeCode])

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.id.toLowerCase().includes(clientSearch.toLowerCase())
  )
  const filteredSites = clientSites.filter((site) =>
    site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
    site.id.toLowerCase().includes(siteSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setClientDropdownOpen(false)
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setSiteDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!selectedClient) {
      setSelectedSite("")
      return
    }

    if (!clientSites.some((site) => site.id === selectedSite)) {
      setSelectedSite(clientSites[0]?.id ?? "")
    }
  }, [clientSites, selectedClient, selectedSite])

  const selectedEmployee = employees.find((emp) => emp.code === employeeCode)
    ? {
        name: employees.find((emp) => emp.code === employeeCode)?.name || "Unknown",
        designation: employees.find((emp) => emp.code === employeeCode)?.designation || "N/A",
        site: employees.find((emp) => emp.code === employeeCode)?.site || "N/A",
      }
    : null

  const handleAddEntry = async () => {
    if (!employeeCode) {
      toast.error("Please select an employee first")
      return
    }

    if (!selectedMonth || !amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (amountNum <= 0) {
      toast.error("Amount must be greater than zero")
      return
    }

    // Validate month is future
    const [year, month] = selectedMonth.split("-")
    const selectedDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    if (selectedDate <= new Date()) {
      toast.error("Only future months are allowed")
      return
    }

    // Prevent duplicate component for same employee & month
    const exists = scheduledEntries.some(
      (e) =>
        e.empCode === employeeCode &&
        e.month === selectedMonth &&
        e.component === selectedComponent &&
        e.type === entryType
    )

    if (exists) {
      toast.error("This component is already scheduled for this employee for this month")
      return
    }

    try {
      const res = await fetch(withBasePath("/api/earning-deduction/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: employeeCode,
          branch: selectedBranch,
          client: selectedClient,
          site: selectedSite,
          month: selectedMonth,
          type: entryType,
          component: selectedComponent,
          amount: amountNum,
          reference: reference || undefined,
          createdBy: getCurrentUser(),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.errors?.[0]?.errorMessage || json?.message || `Failed (${res.status})`)
      }

      toast.success(`${entryType} added successfully`)
      await loadScheduledEntries(employeeCode)

      // Reset form
      setSelectedComponent("")
      setSelectedMonth("")
      setAmount("")
      setReference("")
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry")
    }
  }

  const handleReset = () => {
    setSelectedComponent("")
    setSelectedMonth("")
    setAmount("")
    setReference("")
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(withBasePath(`/api/earning-deduction/${encodeURIComponent(id)}`), {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || `Failed (${res.status})`)
      }
      toast.success("Entry removed")
      await loadScheduledEntries(employeeCode)
    } catch (error: any) {
      toast.error(error.message || "Failed to remove entry")
    }
  }

  const components = entryType === "Earning" ? earningComponents : deductionComponents

  // Generate future months (next 12 months)
  const futureMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return {
      value: `${year}-${month}`,
      label: `${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
    }
  })

  const displayedEntries = employeeCode
    ? scheduledEntries.filter((entry) => entry.empCode === employeeCode)
    : scheduledEntries

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Earning & Deduction</h1>
          <p className="text-muted-foreground mt-1">
            Add or schedule extra earnings or deductions for future payroll months
          </p>
        </div>

        {/* Employee Context */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Branch <span className="text-destructive">*</span>
                </label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Client</label>
                <div className="relative" ref={clientDropdownRef}>
                  <button
                    type="button"
                    className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted"
                    onClick={() => setClientDropdownOpen((value) => !value)}
                  >
                    <span className="truncate">
                      {selectedClient ? clients.find((client) => client.id === selectedClient)?.name || "Select client" : "Select client"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  {clientDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search client..."
                          className="w-full px-2 py-1 border rounded text-sm bg-background"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-56">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                              onClick={() => {
                                setSelectedClient(client.id)
                                setSelectedSite("")
                                setClientDropdownOpen(false)
                                setClientSearch("")
                              }}
                            >
                              <span>{client.name}</span>
                              {selectedClient === client.id && <span className="text-xs font-semibold text-blue-600">?</span>}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">No clients found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Site</label>
                <div className="relative" ref={siteDropdownRef}>
                  <button
                    type="button"
                    className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setSiteDropdownOpen((value) => !value)}
                    disabled={!selectedClient}
                  >
                    <span className="truncate">
                      {selectedSite ? clientSites.find((site) => site.id === selectedSite)?.name || "Select site" : "Select site"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  {siteDropdownOpen && selectedClient && (
                    <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search site..."
                          className="w-full px-2 py-1 border rounded text-sm bg-background"
                          value={siteSearch}
                          onChange={(e) => setSiteSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-56">
                        {filteredSites.length > 0 ? (
                          filteredSites.map((site) => (
                            <button
                              key={site.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                              onClick={() => {
                                setSelectedSite(site.id)
                                setSiteDropdownOpen(false)
                                setSiteSearch("")
                              }}
                            >
                              <span>{site.name}</span>
                              {selectedSite === site.id && <span className="text-xs font-semibold text-blue-600">?</span>}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">No sites found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Employee Code <span className="text-destructive">*</span>
                </label>
                <EmployeeAutocomplete
                  value={employeeCode}
                  onChange={setEmployeeCode}
                  employees={employees}
                  placeholder="Search by code or name..."
                />
              </div>
            </div>

            {/* Employee Details Display */}
            {selectedEmployee && (
              <div className="mt-4 p-4 bg-accent rounded-lg border">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Designation</p>
                    <p className="font-medium text-foreground">{selectedEmployee.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Site</p>
                    <p className="font-medium text-foreground">{selectedEmployee.site}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Entry</CardTitle>
            <CardDescription>Schedule earnings or deductions for future months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Entry Type */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Entry Type</label>
                <RadioGroup value={entryType} onValueChange={(value: any) => setEntryType(value)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Earning" id="earning" />
                      <label htmlFor="earning" className="text-sm font-medium cursor-pointer">
                        Earning
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Deduction" id="deduction" />
                      <label htmlFor="deduction" className="text-sm font-medium cursor-pointer">
                        Deduction
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Component Selection */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Component <span className="text-destructive">*</span>
                </label>
                <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((comp) => (
                      <SelectItem key={comp} value={comp}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Month <span className="text-destructive">*</span>
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {futureMonths.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Amount <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-6"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Reference</label>
                <Input
                  placeholder="e.g., Client approval, Loan recovery"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleAddEntry} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Entries Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Entries</CardTitle>
            <CardDescription>
              {employeeCode
                ? `Entries for ${selectedEmployee?.name || "selected employee"}`
                : "Global view of all scheduled earnings & deductions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayedEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {employeeCode ? "No scheduled entries for this employee" : "No scheduled entries yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!employeeCode && (
                        <>
                          <TableHead>Branch</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Emp ID</TableHead>
                          <TableHead>Emp Name</TableHead>
                        </>
                      )}
                      <TableHead>Month</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>Amount</TableHead>
                      {employeeCode && <TableHead>Reference</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        {!employeeCode && (
                          <>
                            <TableCell className="text-sm">{entry.branch || "-"}</TableCell>
                            <TableCell className="text-sm">{entry.client || "-"}</TableCell>
                            <TableCell className="text-sm">{entry.site || "-"}</TableCell>
                            <TableCell className="font-medium">{entry.empCode}</TableCell>
                            <TableCell className="text-sm">{entry.empName}</TableCell>
                          </>
                        )}
                        <TableCell className="font-medium">{entry.month}</TableCell>
                        <TableCell>
                          <Badge variant={entry.type === "Earning" ? "default" : "destructive"}>{entry.type}</Badge>
                        </TableCell>
                        <TableCell>{entry.component}</TableCell>
                        <TableCell>₹{entry.amount.toLocaleString("en-IN")}</TableCell>
                        {employeeCode && (
                          <TableCell className="text-muted-foreground text-sm">{entry.reference || "-"}</TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline">{entry.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
