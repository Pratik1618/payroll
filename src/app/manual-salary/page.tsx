"use client"

import { useState } from "react"
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

// Mock employee master data with salary structure
const employeeMasterData: Record<
  string,
  {
    name: string
    designation: string
    branch: string
    client: string
    site: string
    doj: string
    lwd?: string
    status: "Active" | "Left"
    salaryStructure: {
      basic: number
      da: number
      hra: number
      conveyance: number
      otherAllowances: number
      pf: number
      esic: number
      pt: number
      otherDeductions: number
    }
  }
> = {
  EMP001: {
    name: "John Doe",
    designation: "Software Engineer",
    branch: "Mumbai",
    client: "Acme Corp",
    site: "Mumbai - Site A",
    doj: "2020-01-15",
    status: "Active",
    salaryStructure: {
      basic: 30000,
      da: 6000,
      hra: 9000,
      conveyance: 2000,
      otherAllowances: 3000,
      pf: 3600,
      esic: 450,
      pt: 200,
      otherDeductions: 500,
    },
  },
  EMP002: {
    name: "Jane Smith",
    designation: "Product Manager",
    branch: "Bangalore",
    client: "Tech Solutions",
    site: "Bangalore - Site B",
    doj: "2019-06-01",
    status: "Active",
    salaryStructure: {
      basic: 50000,
      da: 10000,
      hra: 15000,
      conveyance: 2000,
      otherAllowances: 5000,
      pf: 6000,
      esic: 0, // Exempt
      pt: 300,
      otherDeductions: 1000,
    },
  },
  EMP003: {
    name: "Raj Kumar",
    designation: "Data Analyst",
    branch: "Delhi",
    client: "Analytics Pro",
    site: "Delhi - Site C",
    doj: "2021-03-20",
    status: "Active",
    salaryStructure: {
      basic: 35000,
      da: 7000,
      hra: 10500,
      conveyance: 2000,
      otherAllowances: 3500,
      pf: 4200,
      esic: 525,
      pt: 250,
      otherDeductions: 750,
    },
  },
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
  const [salaryMonth, setSalaryMonth] = useState<string>("")

  const [remarks, setRemarks] = useState<string>("")
  const [confirmed, setConfirmed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [manualSalaryLog, setManualSalaryLog] = useState<ManualSalaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<ManualSalaryEntry | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [weeklyOff, setWeeklyOff] = useState<string>("")
  const [plAvailed, setPlAvailed] = useState<string>("")
  const [absentDays, setAbsentDays] = useState<string>("")

  const employee = employeeMasterData[selectedEmployee]
  const monthDays = getMonthDays(salaryMonth)
  const woNum = Number.parseInt(weeklyOff) || 0   // Paid
  const plNum = Number.parseInt(plAvailed) || 0   // Paid
  const absentNum = Number.parseInt(absentDays) || 0 // LOP

  const payableDaysNum =
    monthDays > 0
      ? Math.max(monthDays - absentNum, 0)
      : 0


  const calculateEarned = (amount: number) => {
    if (payableDaysNum <= 0 || payableDaysNum > monthDays) return 0
    return (amount / monthDays) * payableDaysNum
  }


  const earningComponents: Record<string, number> = employee
    ? {
      Basic: calculateEarned(employee.salaryStructure.basic),
      DA: calculateEarned(employee.salaryStructure.da),
      HRA: calculateEarned(employee.salaryStructure.hra),
      Conveyance: calculateEarned(employee.salaryStructure.conveyance),
      "Other Allowances": calculateEarned(employee.salaryStructure.otherAllowances),
    }
    : {}

  const deductionComponents: Record<string, number> = employee
    ? {
      PF: calculateEarned(employee.salaryStructure.pf),
      ESIC: calculateEarned(employee.salaryStructure.esic),
      PT: calculateEarned(employee.salaryStructure.pt),
      "Other Deductions": calculateEarned(employee.salaryStructure.otherDeductions),
    }
    : {}

  const grossEarnings = Object.values(earningComponents).reduce((a, b) => a + b, 0)
  const totalDeductions = Object.values(deductionComponents).reduce((a, b) => a + b, 0)
  const netPayable = grossEarnings - totalDeductions

  const isValid =
    selectedEmployee &&
    salaryMonth &&
    payableDaysNum > 0 &&
    payableDaysNum <= monthDays &&
    employee?.status === "Active" &&
    !manualSalaryLog.some((e) => e.employeeCode === selectedEmployee && e.salaryMonth === salaryMonth)

  const handleProcess = () => {
    if (!isValid) {
      toast.error("Please fill all required fields correctly")
      return
    }

    if (!confirmed) {
      toast.error("Please confirm the manual salary processing")
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      const entryId = `MAN-${selectedEmployee}-${salaryMonth.replace("-", "")}-${Date.now()}`

      const newEntry: ManualSalaryEntry = {
        entryId,
        employeeCode: selectedEmployee,
        employeeName: employee!.name,
        branch: employee!.branch,
        client: employee!.client,
        site: employee!.site,
        designation: employee!.designation,
        salaryMonth,
        payableDays: payableDaysNum,
        earningsBreakup: earningComponents,
        deductionsBreakup: deductionComponents,
        grossEarnings,
        totalDeductions,
        netPay: netPayable,
        remarks,
        salaryStatus: "Processed",
        paymentStatus: "Pending",
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
      }

      setManualSalaryLog([...manualSalaryLog, newEntry])

      toast.success(`Manual salary processed successfully`, {
        description: `Entry ID: ${entryId}\nEmployee: ${employee?.name}\nMonth: ${salaryMonth}\nNet Pay: ₹${netPayable.toFixed(2)}`,
      })

      setSelectedEmployee("")
      setSalaryMonth("")

      setRemarks("")
      setConfirmed(false)
      setIsProcessing(false)
      setWeeklyOff("")
      setPlAvailed("")
      setAbsentDays("")

    }, 1000)
  }

  const handleGeneratePayment = (entry: ManualSalaryEntry) => {
    const updatedLog = manualSalaryLog.map((e) =>
      e.entryId === entry.entryId ? { ...e, paymentStatus: "Sent to Accounts" as const } : e,
    )
    setManualSalaryLog(updatedLog)
    toast.success(`Payment instruction sent to Accounts`, {
      description: `Entry: ${entry.entryId}\nAmount: ₹${entry.netPay.toFixed(2)}`,
    })
  }

  const handleBulkPayment = () => {
    const updatedLog = manualSalaryLog.map((e) =>
      selectedEntries.includes(e.entryId) ? { ...e, paymentStatus: "Sent to Accounts" as const } : e,
    )
    setManualSalaryLog(updatedLog)
    toast.success(`Payment instructions sent to Accounts for ${selectedEntries.length} entries`)
    setSelectedEntries([])
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

                {/* Auto-loaded Employee Details */}
                {employee && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Employee Name</Label>
                      <p className="font-medium">{employee.name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Designation</Label>
                      <p className="font-medium">{employee.designation}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Branch</Label>
                      <p className="font-medium">{employee.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Client</Label>
                      <p className="font-medium">{employee.client}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Site</Label>
                      <p className="font-medium">{employee.site}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">DOJ</Label>
                      <p className="font-medium">{employee.doj}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Salary Status</Label>
                      <p className={`font-medium ${employee.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                        {employee.status}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Month & Days */}
            {employee && (
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

                  {salaryMonth &&
                    manualSalaryLog.some(
                      (e) => e.employeeCode === selectedEmployee && e.salaryMonth === salaryMonth,
                    ) && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700">
                          This employee already has a manual salary entry for this month
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Salary Calculation Preview */}
            {employee && payableDaysNum > 0 && payableDaysNum <= monthDays && (
              <Card>
                <CardHeader>
                  <CardTitle>Salary Calculation (Read-only)</CardTitle>
                  <CardDescription>Auto-calculated based on salary structure and payable days</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead>Component</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Fixed Amount</TableHead>
                        <TableHead className="text-right">Earned Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(earningComponents).map(([component, amount]) => (
                        <TableRow key={component}>
                          <TableCell className="font-medium">{component}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Earning</span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹
                            {employee.salaryStructure[
                              component.toLowerCase().replace(" ", "") as keyof typeof employee.salaryStructure
                            ]?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {Object.entries(deductionComponents).map(([component, amount]) => (
                        <TableRow key={component}>
                          <TableCell className="font-medium">{component}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Deduction</span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹
                            {employee.salaryStructure[
                              component.toLowerCase().replace(" ", "") as keyof typeof employee.salaryStructure
                            ]?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter className="bg-muted hover:bg-muted">
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">
                          Gross Earnings
                        </TableCell>
                        <TableCell className="text-right font-bold">₹{grossEarnings.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">
                          Total Deductions
                        </TableCell>
                        <TableCell className="text-right font-bold">₹{totalDeductions.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-primary hover:bg-primary">
                        <TableCell colSpan={3} className="font-bold text-primary-foreground">
                          Net Payable
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary-foreground">
                          ₹{netPayable.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Confirmation & Remarks */}
            {employee && payableDaysNum > 0 && payableDaysNum <= monthDays && (
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
                {manualSalaryLog.length === 0 ? (
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
