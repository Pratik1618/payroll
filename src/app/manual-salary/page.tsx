"use client"

import { useEffect, useState } from "react"
import { withBasePath } from "@/lib/base-path"
import { getMonthDays } from "@/utils/date-utility"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmployeeAutocomplete } from "@/components/ui/payroll/employee-autocomplete"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Eye, Download } from "lucide-react"

// Best-effort read of the logged-in user's identity from the JWT stored in
// the `token` cookie (matches the backend's `sub` claim).
function getCurrentUserIdentity(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  if (!match) return ""
  try {
    const payload = JSON.parse(atob(match[1].split(".")[1]))
    return payload.sub || ""
  } catch {
    return ""
  }
}

interface ManualSalaryEntry {
  entryId: string
  employeeCode: string
  employeeName: string
  branch: string
  client: string
  site: string
  designation: string
  salaryMonth: string
  payableDays: number
  earningsBreakup: Record<string, number>
  deductionsBreakup: Record<string, number>
  grossEarnings: number
  totalDeductions: number
  netPay: number
  remarks: string
  salaryStatus: "Processed" | "Cancelled"
  paymentStatus: "Pending" | "Sent to Accounts" | "Paid"
  createdBy: string
  createdAt: string
}

export default function ManualSalaryProcessing() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [employeeName, setEmployeeName] = useState<string>("")
  const [salaryMonth, setSalaryMonth] = useState<string>("")

  const [remarks, setRemarks] = useState<string>("")
  const [confirmed, setConfirmed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [manualSalaryLog, setManualSalaryLog] = useState<ManualSalaryEntry[]>([])
  const [logLoading, setLogLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<ManualSalaryEntry | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [weeklyOff, setWeeklyOff] = useState<string>("")
  const [plAvailed, setPlAvailed] = useState<string>("")
  const [absentDays, setAbsentDays] = useState<string>("")
  const [duplicateExists, setDuplicateExists] = useState(false)

  const [calcResult, setCalcResult] = useState<{
    monthDays: number
    payableDays: number
    earnings: Record<string, number>
    deductions: Record<string, number>
    gross: number
    totalDeductions: number
    netPay: number
  } | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const monthDays = getMonthDays(salaryMonth)
  const absentNum = Number.parseInt(absentDays) || 0
  const payableDaysNum = monthDays > 0 ? Math.max(monthDays - absentNum, 0) : 0

  const loadLog = async () => {
    setLogLoading(true)
    try {
      const res = await fetch(withBasePath("/api/manual-salary/log"), {
        credentials: "include",
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to load manual salary log")
      setManualSalaryLog(data?.results?.data ?? data?.data ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load manual salary log")
    } finally {
      setLogLoading(false)
    }
  }

  useEffect(() => {
    void loadLog()
  }, [])

  // Check for a duplicate entry whenever employee+month change.
  useEffect(() => {
    if (!selectedEmployee || !salaryMonth) {
      setDuplicateExists(false)
      return
    }
    let cancelled = false
    fetch(
      withBasePath(
        `/api/manual-salary/validate?empCode=${encodeURIComponent(selectedEmployee)}&month=${encodeURIComponent(salaryMonth)}`
      ),
      { credentials: "include", cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDuplicateExists(!!(data?.results?.exists ?? data?.exists))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [selectedEmployee, salaryMonth])

  // Fetch a real calculation preview whenever the relevant inputs change.
  useEffect(() => {
    if (!selectedEmployee || !salaryMonth || payableDaysNum <= 0 || payableDaysNum > monthDays) {
      setCalcResult(null)
      return
    }
    let cancelled = false
    setCalcLoading(true)
    fetch(withBasePath("/api/manual-salary/calculate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        empCode: selectedEmployee,
        salaryMonth,
        weeklyOff: Number.parseInt(weeklyOff) || 0,
        plAvailed: Number.parseInt(plAvailed) || 0,
        absentDays: absentNum,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          if (data?.results?.data || data?.data) {
            setCalcResult(data?.results?.data ?? data?.data)
          } else {
            setCalcResult(null)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setCalcResult(null)
      })
      .finally(() => {
        if (!cancelled) setCalcLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, salaryMonth, weeklyOff, plAvailed, absentDays])

  const isValid =
    !!selectedEmployee &&
    !!employeeName.trim() &&
    !!salaryMonth &&
    payableDaysNum > 0 &&
    payableDaysNum <= monthDays &&
    !duplicateExists &&
    !!calcResult

  const handleProcess = async () => {
    if (!isValid) {
      toast.error("Please fill all required fields correctly")
      return
    }

    if (!confirmed) {
      toast.error("Please confirm the manual salary processing")
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch(withBasePath("/api/manual-salary/process"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          empCode: selectedEmployee,
          empName: employeeName.trim(),
          salaryMonth,
          attendance: {
            weeklyOff: Number.parseInt(weeklyOff) || 0,
            plAvailed: Number.parseInt(plAvailed) || 0,
            absentDays: absentNum,
          },
          remarks: remarks || undefined,
          confirmed: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to process manual salary")
      const result = data?.results ?? data

      toast.success("Manual salary processed successfully", {
        description: `Entry ID: ${result.entryId}\nEmployee: ${employeeName}\nMonth: ${salaryMonth}${calcResult ? `\nNet Pay: ₹${calcResult.netPay.toFixed(2)}` : ""}`,
      })

      setSelectedEmployee("")
      setEmployeeName("")
      setSalaryMonth("")
      setRemarks("")
      setConfirmed(false)
      setWeeklyOff("")
      setPlAvailed("")
      setAbsentDays("")
      setCalcResult(null)
      await loadLog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process manual salary")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGeneratePayment = async (entry: ManualSalaryEntry) => {
    try {
      const res = await fetch(withBasePath("/api/manual-salary/payment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entryId: entry.entryId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to generate payment instruction")
      toast.success("Payment instruction sent to Accounts", {
        description: `Entry: ${entry.entryId}\nAmount: ₹${entry.netPay.toFixed(2)}`,
      })
      await loadLog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate payment instruction")
    }
  }

  const handleBulkPayment = async () => {
    try {
      const res = await fetch(withBasePath("/api/manual-salary/payment/bulk"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entryIds: selectedEntries }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to generate bulk payment instructions")
      toast.success(`Payment instructions sent to Accounts for ${selectedEntries.length} entries`)
      setSelectedEntries([])
      await loadLog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate bulk payment instructions")
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manual Salary Processing</h1>
          <p className="mt-2 text-muted-foreground">
            Process salary by days for exceptional cases with full audit trail
          </p>
        </div>

        <Tabs defaultValue="process" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="process">Process Manual Salary</TabsTrigger>
            <TabsTrigger value="log">Manual Salary Log</TabsTrigger>
          </TabsList>

          {/* TAB 1: PROCESS MANUAL SALARY */}
          <TabsContent value="process" className="space-y-6">
            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Selection</CardTitle>
                <CardDescription>Search and select employee</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="employee" className="text-base font-medium">
                    Employee Code <span className="text-red-500">*</span>
                  </Label>
                  <EmployeeAutocomplete value={selectedEmployee} onChange={setSelectedEmployee} />
                </div>

                {selectedEmployee && (
                  <div className="space-y-2">
                    <Label htmlFor="employeeName" className="text-base font-medium">
                      Employee Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="employeeName"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Enter employee name"
                    />
                  </div>
                )}
                {duplicateExists && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700">
                      This employee already has a manual salary entry for this month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Month & Days */}
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle>Salary Month & Days</CardTitle>
                  <CardDescription>Select month and enter payable days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month" className="text-base font-medium">
                        Salary Month <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="month"
                        type="month"
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Month Days</Label>
                      <Input value={monthDays} disabled className="bg-muted border-border" />
                    </div>
                  </div>

                  {/* Attendance Inputs */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Weekly Off (Paid)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={weeklyOff}
                        onChange={(e) => setWeeklyOff(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>PL Availed (Paid)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={plAvailed}
                        onChange={(e) => setPlAvailed(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-red-600">Absent (LOP)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={absentDays}
                        onChange={(e) => setAbsentDays(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-green-700">Payable Days</Label>
                      <Input
                        value={payableDaysNum}
                        disabled
                        className="bg-muted font-bold text-center"
                      />
                    </div>
                  </div>


                  {payableDaysNum > monthDays && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">Payable days cannot exceed month days ({monthDays})</p>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Salary Calculation Preview */}
            {selectedEmployee && payableDaysNum > 0 && payableDaysNum <= monthDays && (
              <Card>
                <CardHeader>
                  <CardTitle>Salary Calculation (Read-only)</CardTitle>
                  <CardDescription>Calculated by the payroll engine based on payable days</CardDescription>
                </CardHeader>
                <CardContent>
                  {calcLoading && !calcResult ? (
                    <p className="text-sm text-muted-foreground">Calculating...</p>
                  ) : calcResult ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                          <TableHead>Component</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(calcResult.earnings).map(([component, amount]) => (
                          <TableRow key={component}>
                            <TableCell className="font-medium capitalize">{component}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Earning</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{Number(amount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        {Object.entries(calcResult.deductions).map(([component, amount]) => (
                          <TableRow key={component}>
                            <TableCell className="font-medium capitalize">{component}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Deduction</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{Number(amount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter className="bg-muted hover:bg-muted">
                        <TableRow>
                          <TableCell colSpan={2} className="font-bold">
                            Gross Earnings
                          </TableCell>
                          <TableCell className="text-right font-bold">₹{calcResult.gross.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2} className="font-bold">
                            Total Deductions
                          </TableCell>
                          <TableCell className="text-right font-bold">₹{calcResult.totalDeductions.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow className="bg-primary hover:bg-primary">
                          <TableCell colSpan={2} className="font-bold text-primary-foreground">
                            Net Payable
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary-foreground">
                            ₹{calcResult.netPay.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unable to calculate — check the wage rules for this employee.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Confirmation & Remarks */}
            {selectedEmployee && payableDaysNum > 0 && payableDaysNum <= monthDays && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmation & Remarks</CardTitle>
                  <CardDescription>Confirm processing and add optional remarks for audit trail</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <Checkbox
                      id="confirm"
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="confirm" className="text-sm font-medium leading-relaxed cursor-pointer">
                      I confirm this salary is processed manually and will not be part of regular payroll.
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-base font-medium">
                      Remarks (Optional)
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="Add any remarks for audit trail..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="min-h-24 bg-background border-border"
                    />
                  </div>

                  <Button
                    onClick={handleProcess}
                    disabled={!isValid || !confirmed || isProcessing}
                    size="lg"
                    className="w-full"
                  >
                    {isProcessing ? "Processing..." : "Process Manual Salary"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: MANUAL SALARY LOG */}
          <TabsContent value="log" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Salary Log</CardTitle>
                <CardDescription>Audit trail of all processed manual salaries with payment status</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEntries.length > 0 && (
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleBulkPayment} variant="outline">
                      Send {selectedEntries.length} Selected to Payment
                    </Button>
                  </div>
                )}
                {logLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading manual salary log...</p>
                  </div>
                ) : manualSalaryLog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No manual salary entries yet. Process a salary in the first tab to view it here.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>
                          <Checkbox
                            checked={
                              selectedEntries.length > 0 &&
                              selectedEntries.length === manualSalaryLog.filter((e) => e.paymentStatus === "Pending").length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEntries(
                                  manualSalaryLog.filter((e) => e.paymentStatus === "Pending").map((e) => e.entryId),
                                )
                              } else {
                                setSelectedEntries([])
                              }
                            }}
                          />
                          Select All
                        </TableHead>
                        <TableHead>Entry ID</TableHead>
                        <TableHead>Emp Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead>Salary Status</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualSalaryLog.map((entry) => (
                        <TableRow key={entry.entryId}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEntries.includes(entry.entryId)}
                              disabled={entry.paymentStatus !== "Pending"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEntries([...selectedEntries, entry.entryId])
                                } else {
                                  setSelectedEntries(selectedEntries.filter(id => id !== entry.entryId))
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{entry.entryId.slice(0, 16)}...</TableCell>
                          <TableCell className="font-medium">{entry.employeeCode}</TableCell>
                          <TableCell>{entry.employeeName}</TableCell>
                          <TableCell>{entry.salaryMonth}</TableCell>
                          <TableCell>{entry.payableDays}</TableCell>
                          <TableCell className="text-right font-bold">₹{entry.netPay.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="default">{entry.salaryStatus}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.paymentStatus === "Pending"
                                  ? "outline"
                                  : entry.paymentStatus === "Sent to Accounts"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {entry.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(entry)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              {selectedEntry?.entryId === entry.entryId && (
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Salary Breakup - {selectedEntry.entryId}</DialogTitle>
                                    <DialogDescription>
                                      Complete audit details for this manual salary entry
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Employee</p>
                                        <p className="font-medium">{selectedEntry.employeeName}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Month</p>
                                        <p className="font-medium">{selectedEntry.salaryMonth}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Days</p>
                                        <p className="font-medium">{selectedEntry.payableDays}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Created At</p>
                                        <p className="font-medium text-xs">
                                          {new Date(selectedEntry.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <Table>
                                      <TableBody>
                                        {Object.entries(selectedEntry.earningsBreakup).map(([k, v]) => (
                                          <TableRow key={k}>
                                            <TableCell>{k}</TableCell>
                                            <TableCell className="text-right">₹{v.toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                        {Object.entries(selectedEntry.deductionsBreakup).map(([k, v]) => (
                                          <TableRow key={k}>
                                            <TableCell className="text-red-600">{k}</TableCell>
                                            <TableCell className="text-right">₹{v.toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                      <TableFooter>
                                        <TableRow>
                                          <TableCell className="font-bold">Net Pay</TableCell>
                                          <TableCell className="text-right font-bold">
                                            ₹{selectedEntry.netPay.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      </TableFooter>
                                    </Table>
                                    {selectedEntry.remarks && (
                                      <div>
                                        <p className="text-sm text-muted-foreground">Remarks</p>
                                        <p className="text-sm">{selectedEntry.remarks}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                            {entry.paymentStatus === "Pending" && (
                              <Button size="sm" variant="outline" onClick={() => handleGeneratePayment(entry)}>
                                <Download className="w-4 h-4 mr-1" />
                                Generate Payment
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
