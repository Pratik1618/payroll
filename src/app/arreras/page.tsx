"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {  toast } from "sonner"
import { AlertTriangle, Download, Lock } from "lucide-react"
import { generateMonthOptions, calculateArrearsMonths, getPeriodDisplay, formatMonthLabel } from "@/utils/month-utility"

const initialSteps = [
  {
    id: 1,
    title: "Context Selection",
    description: "Select client, site, wage revision details",
    completed: false,
    current: true,
  },
  {
    id: 2,
    title: "Load Employees",
    description: "Review and select eligible employees",
    completed: false,
    current: false,
  },
  {
    id: 3,
    title: "Calculate Arrears",
    description: "Month-wise arrears computation",
    completed: false,
    current: false,
  },
  { id: 4, title: "Review & Confirm", description: "Review final calculations", completed: false, current: false },
  { id: 5, title: "Generate Outputs", description: "Export reports and finalize", completed: false, current: false },
]

const mockClients = [
  { id: "client-1", name: "ABC Corporation" },
  { id: "client-2", name: "XYZ Industries" },
  { id: "client-3", name: "Global Tech" },
]

const mockSites = [
  { id: "site-a", name: "Corporate Office", clientId: "client-1" },
  { id: "site-b", name: "Manufacturing Unit", clientId: "client-1" },
  { id: "site-c", name: "Warehouse", clientId: "client-2" },
]

const mockWageRevisions = [
  { id: "wr-1", name: "Minimum Wages – June 2024" },
  { id: "wr-2", name: "Minimum Wages – December 2024" },
  { id: "wr-3", name: "Dearness Allowance – January 2025" },
]

const mockEmployees = [
  { id: "emp-1", name: "John Doe", joinDate: "2023-01-15", department: "Operations" },
  { id: "emp-2", name: "Jane Smith", joinDate: "2022-06-20", department: "HR" },
  { id: "emp-3", name: "Mike Johnson", joinDate: "2023-03-10", department: "Finance" },
  { id: "emp-4", name: "Sarah Wilson", joinDate: "2024-01-05", department: "Operations" },
  { id: "emp-5", name: "David Brown", joinDate: "2021-09-12", department: "IT" },
]

const monthOptions = generateMonthOptions(2023, 2025)

export default function ArrearsWorkingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState(initialSteps)


  // Step 1: Context Selection
  const [selectedClient, setSelectedClient] = useState("client-1")
  const [selectedSite, setSelectedSite] = useState("all-sites")
  const [selectedRevision, setSelectedRevision] = useState("wr-1")
  const [effectiveMonth, setEffectiveMonth] = useState("2024-01")
  const [approvalMonth, setApprovalMonth] = useState("2024-06")
  const [arrearsPeriod, setArrearsPeriod] = useState("")
  const [arrearsMonths, setArrearsMonths] = useState<string[]>([])

  // Step 2: Employee Selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employeeList, setEmployeeList] = useState(mockEmployees.map((emp) => ({ ...emp, selected: true })))

  // Step 3: Arrears Calculation
  const [arrearsCalculation, setArrearsCalculation] = useState<any[]>([])

  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  useEffect(() => {
    if (effectiveMonth && approvalMonth) {
      const calculated = calculateArrearsMonths(effectiveMonth, approvalMonth)
      if (calculated.length > 0) {
        const periodDisplay = getPeriodDisplay(effectiveMonth, approvalMonth)
        setArrearsPeriod(periodDisplay)
        setArrearsMonths(calculated)
      } else {
        setArrearsPeriod("")
        setArrearsMonths([])
      }
    }
  }, [effectiveMonth, approvalMonth])

  const handleContextNext = () => {
    if (!selectedClient || !selectedRevision || !effectiveMonth || !approvalMonth) {
      toast.error("Missing Fields",{
      
        description: "Please fill all required fields",
 
      })
      return
    }

    if (arrearsPeriod === "") {
      toast.error(  "Invalid Period",{
     
        description: "Approval month must be after effective month",
      
      })
      return
    }

    updateStep(1, true)
    setCurrentStep(2)
  }

  const handleEmployeeNext = () => {
    const selected = employeeList.filter((emp) => emp.selected)
    if (selected.length === 0) {
      toast.error( "No Employees Selected",{
      
        description: "Please select at least one employee",
     
      })
      return
    }

    setSelectedEmployees(selected.map((emp) => emp.id))
    calculateArrears(selected)
    updateStep(2, true)
    setCurrentStep(3)
  }

  const calculateArrears = (employees: any[]) => {
    const calculations = employees.map((emp) => {
      const monthBreakdown = arrearsMonths.map((month) => ({
        month: formatMonthLabel(month),
        monthValue: month,
        oldSalary: 20000,
        revisedSalary: 21500,
        payableDays: 26,
        totalDays: 26,
        arrears: 1500,
      }))

      const totalArrears = monthBreakdown.reduce((sum, m) => sum + m.arrears, 0)

      return {
        empId: emp.id,
        empName: emp.name,
        monthBreakdown,
        totalArrears,
      }
    })
    setArrearsCalculation(calculations)
  }

  const handleCalculationNext = () => {
    updateStep(3, true)
    setCurrentStep(4)
  }

  const handleReviewConfirm = () => {
    toast.success("Arrears Confirmed",{

      description: "Proceeding to output generation",
    })
    updateStep(4, true)
    setCurrentStep(5)
  }

  const handleGenerateOutputs = () => {
    toast.success( "Outputs Generated",{
   
      description: "Arrears working register and bank file created",
    })
    updateStep(5, true)
  }

  const updateStep = (stepIndex: number, completed: boolean) => {
    setSteps(steps.map((step, idx) => (idx === stepIndex - 1 ? { ...step, completed, current: false } : step)))
  }

  const getSitesForClient = () => {
    if (!selectedClient) return []
    return mockSites.filter((site) => site.clientId === selectedClient)
  }

  const totalArrears = arrearsCalculation.reduce((sum, emp) => sum + emp.totalArrears, 0)

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Arrears Working</h1>
            <p className="text-muted-foreground">Minimum Wages Revision & Retrospective Salary Adjustment</p>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardContent className="pt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>

        {/* Step 1: Context Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Wage Revision Context</CardTitle>
              <CardDescription>Select client, wage revision details, and arrears period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client *</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
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
                  <label className="text-sm font-medium">Site (Optional)</label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-sites">All Sites</SelectItem>
                      {getSitesForClient().map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Wage Revision Type *</label>
                <Select value={selectedRevision} onValueChange={setSelectedRevision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revision type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWageRevisions.map((rev) => (
                      <SelectItem key={rev.id} value={rev.id}>
                        {rev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Effective From Month *</label>
                  <Select value={effectiveMonth} onValueChange={setEffectiveMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Approved In Month *</label>
                  <Select value={approvalMonth} onValueChange={setApprovalMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {arrearsPeriod && (
                <div className="bg-accent/30 border border-accent rounded-lg p-4">
                  <p className="text-sm font-medium">Auto-Calculated Arrears Period</p>
                  <p className="text-lg font-semibold mt-1">{arrearsPeriod}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleContextNext} disabled={!arrearsPeriod}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Load Employees */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Eligible Employees</CardTitle>
              <CardDescription>
                Review and select employees for arrears calculation ({employeeList.length} employees active in arrears
                period)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={employeeList.every((emp) => emp.selected)}
                        onCheckedChange={(checked) => {
                          setEmployeeList(employeeList.map((emp) => ({ ...emp, selected: !!checked })))
                        }}
                      />
                    </TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeList.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Checkbox
                          checked={emp.selected}
                          onCheckedChange={(checked) => {
                            setEmployeeList(
                              employeeList.map((e) => (e.id === emp.id ? { ...e, selected: !!checked } : e)),
                            )
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{emp.id}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.joinDate}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleEmployeeNext}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Month-wise Arrears Calculation */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Month-wise Arrears Calculation</CardTitle>
              <CardDescription>Master-detail view: Click View to see employee month-wise breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Employee ID</TableHead>
                      <TableHead className="font-semibold">Employee Name</TableHead>
                      <TableHead className="text-right font-semibold">Arrears Months</TableHead>
                      <TableHead className="text-right font-semibold">Total Arrears</TableHead>
                      <TableHead className="text-center font-semibold">View Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrearsCalculation.map((empCalc) => (
                      <TableRow key={empCalc.empId} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{empCalc.empId}</TableCell>
                        <TableCell>{empCalc.empName}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {empCalc.monthBreakdown.length} months
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{empCalc.totalArrears.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedEmployee(expandedEmployee === empCalc.empId ? null : empCalc.empId)
                            }
                            className="h-8 w-8 p-0"
                          >
                            {expandedEmployee === empCalc.empId ? "▼" : "▶"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {expandedEmployee && (
                <div className="border rounded-lg p-6 bg-slate-50">
                  {(() => {
                    const selectedEmp = arrearsCalculation.find((emp) => emp.empId === expandedEmployee)
                    if (!selectedEmp) return null
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-lg font-semibold">{selectedEmp.empName}</p>
                            <p className="text-sm text-muted-foreground">{selectedEmp.empId}</p>
                          </div>
                          <Badge className="text-base">₹{selectedEmp.totalArrears.toLocaleString("en-IN")}</Badge>
                        </div>

                        <div className="border rounded-lg overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader>
                              <TableRow className="bg-white">
                                <TableHead className="font-semibold">Month</TableHead>
                                <TableHead className="text-right font-semibold">Old Salary</TableHead>
                                <TableHead className="text-right font-semibold">Revised Salary</TableHead>
                                <TableHead className="text-right font-semibold">Payable Days</TableHead>
                                <TableHead className="text-right font-semibold">Monthly Arrears</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedEmp.monthBreakdown.map((month: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{month.month}</TableCell>
                                  <TableCell className="text-right">
                                    ₹{month.oldSalary.toLocaleString("en-IN")}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ₹{month.revisedSalary.toLocaleString("en-IN")}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">
                                    {month.payableDays}/{month.totalDays}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    ₹{month.arrears.toLocaleString("en-IN")}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleCalculationNext}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Confirm */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Confirm Calculations</CardTitle>
              <CardDescription>Verify all arrears amounts before final generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-accent/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-3xl font-bold">{selectedEmployees.length}</p>
                </div>
                <div className="bg-accent/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Arrears Period</p>
                  <p className="text-lg font-semibold mt-1">{arrearsPeriod}</p>
                </div>
                <div className="bg-accent/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Grand Total Arrears</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalArrears.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Before Confirming</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Ensure all salary structures and attendance records are accurate. Once locked, arrears cannot be
                    modified.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button onClick={handleReviewConfirm}>Confirm & Proceed</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Generate Outputs */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Generate & Export Outputs</CardTitle>
              <CardDescription>Create arrears register and bank transfer files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Arrears Working Register (Excel)
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Bank File (NEFT/RTGS)
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Arrears (Prevent Future Edits)
                </Button>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button onClick={handleGenerateOutputs}>Complete</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
