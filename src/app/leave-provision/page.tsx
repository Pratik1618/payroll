"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { AlertTriangle, ChevronDown, Lock, Download } from "lucide-react"
import { generateMonthOptions, formatMonthLabel } from "@/utils/month-utility"

const initialSteps = [
  {
    id: 1,
    title: "Context Selection",
    description: "Select branch, client, site, and month range",
    completed: false,
    current: true,
  },
  {
    id: 2,
    title: "Load Employees",
    description: "Select eligible employees for leave provision calculation",
    completed: false,
    current: false,
  },
  {
    id: 3,
    title: "Calculate Provision",
    description: "Month-wise leave liability calculation",
    completed: false,
    current: false,
  },
  {
    id: 4,
    title: "Review & Lock",
    description: "Final approval before saving to ledger",
    completed: false,
    current: false,
  },
  {
    id: 5,
    title: "Generate & Export Outputs",
    description: "Create leave provision register and lock the calculation period",
    completed: false,
    current: false,
  },
]

const mockBranches = [
  { id: "branch-1", name: "Maharashtra" },
  { id: "branch-2", name: "Gujarat" },
]

const mockClients = [
  { id: "client-1", name: "ABC Corporation" },
  { id: "client-2", name: "XYZ Industries" },
]

const mockSites = [
  { id: "site-a", name: "Corporate Office", clientId: "client-1" },
  { id: "site-b", name: "Manufacturing Unit", clientId: "client-1" },
]

const mockEmployees = [
  {
    id: "emp-1",
    name: "John Doe",
    code: "EMP001",
    site: "site-a",
    fixedGross: 15000,
    lwwPolicy: false,
    paidLeaveEligible: true,
    salaryStatus: "active",
  },
  {
    id: "emp-2",
    name: "Jane Smith",
    code: "EMP002",
    site: "site-a",
    fixedGross: 18000,
    lwwPolicy: false,
    paidLeaveEligible: true,
    salaryStatus: "active",
  },
  {
    id: "emp-3",
    name: "Mike Johnson",
    code: "EMP003",
    site: "site-b",
    fixedGross: 20000,
    lwwPolicy: true, // LWW - will be excluded
    paidLeaveEligible: true,
    salaryStatus: "active",
  },
  {
    id: "emp-4",
    name: "Sarah Wilson",
    code: "EMP004",
    site: "site-b",
    fixedGross: 16000,
    lwwPolicy: false,
    paidLeaveEligible: true,
    salaryStatus: "active",
  },
]

const monthOptions = generateMonthOptions(2024, 2026)

export default function LeaveProvisionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState(initialSteps)

  // Step 1: Context Selection
  const [selectedBranch, setSelectedBranch] = useState("branch-1")
  const [selectedClient, setSelectedClient] = useState("client-1")
  const [selectedSite, setSelectedSite] = useState("site-a")
  const [fromMonth, setFromMonth] = useState("2025-01")
  const [toMonth, setToMonth] = useState("2025-03")

  // Step 2: Employee Selection
  const [employeeList, setEmployeeList] = useState(
    mockEmployees
      .filter((emp) => !emp.lwwPolicy && emp.paidLeaveEligible && emp.salaryStatus === "active")
      .map((emp) => ({ ...emp, selected: true })),
  )

  // Step 3: Leave Provision Calculation
  const [provisions, setProvisions] = useState<any[]>([])
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  const updateStep = (stepId: number, completed: boolean) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, completed } : step)))
  }

  const handleContextNext = () => {
    if (!selectedBranch || !selectedClient || !selectedSite || !fromMonth || !toMonth) {
      toast.error("Missing Fields", { description: "Please fill all required fields" })
      return
    }

    if (new Date(fromMonth) >= new Date(toMonth)) {
      toast.error("Invalid Range", { description: "From Month must be before To Month" })
      return
    }

    updateStep(1, true)
    setCurrentStep(2)
  }

  const handleEmployeeNext = () => {
    const selected = employeeList.filter((emp) => emp.selected)
    if (selected.length === 0) {
      toast.error("No Employees Selected", { description: "Please select at least one employee" })
      return
    }

    calculateLeaveProvision(selected)
    updateStep(2, true)
    setCurrentStep(3)
  }

  const calculateLeaveProvision = (employees: any[]) => {
    const monthlyData: any[] = []

    // Generate all months in range
    const startDate = new Date(fromMonth)
    const endDate = new Date(toMonth)

    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      const month = d.toISOString().substring(0, 7)

      employees.forEach((emp) => {
        // Mock payroll data - in real system, fetch from payroll database
        const fixedGross = emp.fixedGross
        const earnedGross = emp.fixedGross * 0.95 // mock deduction
        const monthDays = 26 // payroll days
        const calendarDays = 30 // for this month
        const presentDays = 24 // mock attendance data
        const plAvailed = Math.random() > 0.7 ? 1 : 0 // mock: 30% chance of leave availed

        // CRITICAL CALCULATION PER SPEC
        // A) Leave Amount = (Fixed Gross / Month Days) × Monthly Leave Credit
        const monthlyLeaveCredit = 1.75 // typical (21 days / 12 months)
        const leaveAmount = (fixedGross / monthDays) * monthlyLeaveCredit

        // B) Leave Paid in Salary - Fixed formula: (Fixed Gross / Month Days) × PL_AVAILED
        let leavePaidInSalary = 0
        if (plAvailed > 0) {
          leavePaidInSalary = (fixedGross / monthDays) * plAvailed
        }

        // C) Leave To Pay (net liability)
        const leaveToPay = Math.max(0, leaveAmount - leavePaidInSalary)

        monthlyData.push({
          month,
          employeeId: emp.id,
          employeeCode: emp.code,
          employeeName: emp.name,
          fixedGross,
          earnedGross: Number.parseFloat(earnedGross.toFixed(2)),
          monthDays,
          calendarDays,
          presentDays,
          plAvailed,
          monthlyLeaveCredit,
          leaveAmount: Number.parseFloat(leaveAmount.toFixed(2)),
          leavePaidInSalary: Number.parseFloat(leavePaidInSalary.toFixed(2)),
          leaveToPay: Number.parseFloat(leaveToPay.toFixed(2)),
        })
      })
    }

    setProvisions(monthlyData)
  }

  const handleReviewNext = () => {
    if (provisions.length === 0) {
      toast.error("No Data", { description: "Please calculate provisions first" })
      return
    }

    updateStep(4, true)
    setCurrentStep(5)
  }

  const handleSaveToLedger = () => {
    const ledgerEntries = provisions.map((prov) => ({
      month: prov.month,
      branch: selectedBranch,
      client: selectedClient,
      site: selectedSite,
      employeeId: prov.employeeId,
      employeeCode: prov.employeeCode,
      employeeName: prov.employeeName,
      fixedGross: prov.fixedGross,
      earnedGross: prov.earnedGross,
      presentDays: prov.presentDays,
      plAvailed: prov.plAvailed,
      leaveAmount: prov.leaveAmount,
      leavePaidInSalary: prov.leavePaidInSalary,
      leaveToPay: prov.leaveToPay,
      createdAt: new Date().toISOString(),
    }))

    toast.success("Leave Provision Saved", {
      description: `${new Set(provisions.map((p) => p.employeeId)).size} employees, ${new Set(provisions.map((p) => p.month)).size} months saved to ledger`,
    })

    // Reset to Step 1
    setSelectedBranch("branch-1")
    setSelectedClient("client-1")
    setSelectedSite("site-a")
    setFromMonth("2025-01")
    setToMonth("2025-03")
    setEmployeeList(
      mockEmployees
        .filter((emp) => !emp.lwwPolicy && emp.paidLeaveEligible && emp.salaryStatus === "active")
        .map((emp) => ({ ...emp, selected: true })),
    )
    setProvisions([])
    setSteps(initialSteps)
    setCurrentStep(1)
  }

  const filteredSites = mockSites.filter((site) => site.clientId === selectedClient)

  const employeeAggregates = provisions.reduce(
    (acc, prov) => {
      const key = prov.employeeId
      if (!acc[key]) {
        acc[key] = {
          employeeId: prov.employeeId,
          employeeCode: prov.employeeCode,
          employeeName: prov.employeeName,
          monthCount: 0,
          totalLeaveAmount: 0,
          totalLeavePaidInSalary: 0,
          totalLeaveToPay: 0,
        }
      }
      acc[key].monthCount += 1
      acc[key].totalLeaveAmount += prov.leaveAmount
      acc[key].totalLeavePaidInSalary += prov.leavePaidInSalary
      acc[key].totalLeaveToPay += prov.leaveToPay
      return acc
    },
    {} as Record<string, any>,
  )

  const totalLeaveToPayGrand = Object.values(employeeAggregates).reduce(
    (sum: number, agg: any) => sum + agg.totalLeaveToPay,
    0,
  )

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        
          <div>
            <h1 className="text-3xl font-bold">Leave Provision Working</h1>
            <p className="text-muted-foreground">Month-wise earned leave accrual and liability tracking</p>
          </div>
        </div>

        {/* Stepper */}
        <Card>
            <CardContent className="pt-6">
 <Stepper steps={steps}  currentStep={currentStep}/>
            </CardContent>
        </Card>
       

        {/* Step 1: Context Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Context Selection</CardTitle>
              <CardDescription>
                Select branch, client, site, and month range for leave provision calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Site</label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From Month (YYYY-MM)</label>
                  <Select value={fromMonth} onValueChange={setFromMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To Month (YYYY-MM)</label>
                  <Select value={toMonth} onValueChange={setToMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={handleContextNext}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Load Employees */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Load Eligible Employees</CardTitle>
              <CardDescription>
                Non-LWW employees eligible for leave provision (LWW employees excluded automatically)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {employeeList.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition"
                  >
                    <Checkbox
                      checked={emp.selected}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true
                        setEmployeeList(employeeList.map((e) => (e.id === emp.id ? { ...e, selected: isChecked } : e)))
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {emp.code} • Fixed Gross: ₹{emp.fixedGross.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Badge variant="outline">Non-LWW</Badge>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleEmployeeNext}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Calculate Leave Provision - Month-wise Table */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Leave Provision Calculation (Month-wise)</CardTitle>
              <CardDescription>Detailed month-by-month leave accrual and liability calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emp Code</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead className="text-right">Months</TableHead>
                      <TableHead className="text-right">Total Leave Amount</TableHead>
                      <TableHead className="text-right">Total Leave Paid</TableHead>
                      <TableHead className="text-right">Total Leave To Pay</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(employeeAggregates).map((agg: any) => (
                      <TableRow key={agg.employeeId}>
                        <TableCell className="font-medium">{agg.employeeCode}</TableCell>
                        <TableCell>{agg.employeeName}</TableCell>
                        <TableCell className="text-right">{agg.monthCount}</TableCell>
                        <TableCell className="text-right">
                          ₹{agg.totalLeaveAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{agg.totalLeavePaidInSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          ₹{agg.totalLeaveToPay.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedEmployee(expandedEmployee === agg.employeeId ? null : agg.employeeId)
                            }
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {expandedEmployee && (
                <Card className="bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Month-wise Breakdown: {employeeAggregates[expandedEmployee]?.employeeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Fixed Gross</TableHead>
                            <TableHead className="text-right">Earned Gross</TableHead>
                            <TableHead className="text-right">Month Days</TableHead>
                            <TableHead className="text-right">Present Days</TableHead>
                            <TableHead className="text-right">PL Availed</TableHead>
                            <TableHead className="text-right">Leave Amount</TableHead>
                            <TableHead className="text-right">Leave Paid</TableHead>
                            <TableHead className="text-right">Leave To Pay</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {provisions
                            .filter((p) => p.employeeId === expandedEmployee)
                            .map((prov, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{prov.month}</TableCell>
                                <TableCell className="text-right">₹{prov.fixedGross.toLocaleString("en-IN")}</TableCell>
                                <TableCell className="text-right">
                                  ₹{prov.earnedGross.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-right">{prov.monthDays}</TableCell>
                                <TableCell className="text-right">{prov.presentDays}</TableCell>
                                <TableCell className="text-right">{prov.plAvailed}</TableCell>
                                <TableCell className="text-right">
                                  ₹{prov.leaveAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{prov.leavePaidInSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ₹{prov.leaveToPay.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-2xl font-bold">{Object.keys(employeeAggregates).length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Months</p>
                  <p className="text-2xl font-bold">{new Set(provisions.map((p) => p.month)).size}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Leave Amount</p>
                  <p className="text-2xl font-bold">
                    ₹
                    {provisions
                      .reduce((s, p) => s + p.leaveAmount, 0)
                      .toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Leave To Pay</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{totalLeaveToPayGrand.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleReviewNext}>Review & Proceed</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Lock */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Review & Lock</CardTitle>
              <CardDescription>Final approval before saving to leave ledger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="text-lg font-medium">
                    {formatMonthLabel(fromMonth)} to {formatMonthLabel(toMonth)}
                  </p>
                </div>
                <div className="space-y-1 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-muted-foreground">Site</p>
                  <p className="text-lg font-medium">{mockSites.find((s) => s.id === selectedSite)?.name}</p>
                </div>
                <div className="space-y-1 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-lg font-medium">{Object.keys(employeeAggregates).length}</p>
                </div>
                <div className="space-y-1 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Leave To Pay</p>
                  <p className="text-lg font-medium text-blue-600">
                    ₹{totalLeaveToPayGrand.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                <p className="text-sm text-amber-900 font-medium">Compliance Warning</p>
                <p className="text-sm text-amber-800 mt-1">
                  Once locked, leave provision cannot be recalculated for {formatMonthLabel(fromMonth)} to{" "}
                  {formatMonthLabel(toMonth)}. Ensure all data is correct.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back to Edit
                </Button>
                <Button onClick={() => setCurrentStep(5)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock & Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Generate & Export Outputs */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Generate & Export Outputs</CardTitle>
              <CardDescription>Create leave provision register and lock the calculation period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Leave Provision Register (Excel)
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Leave Ledger Entry (CSV)
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Leave Provision Period (Prevent Future Edits)
                </Button>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button onClick={handleSaveToLedger}>Complete & Save</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
