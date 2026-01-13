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

import { AlertTriangle, Download, Lock } from "lucide-react"
import { generateMonthOptions, formatMonthLabel } from "@/utils/month-utility"
import { toast } from "sonner"

const initialSteps = [
  {
    id: 1,
    title: "Bonus Context",
    description: "Select financial year, bonus %, and payout month",
    completed: false,
    current: true,
  },
  {
    id: 2,
    title: "Load Employees",
    description: "Select eligible employees for statutory bonus",
    completed: false,
    current: false,
  },
  {
    id: 3,
    title: "Calculate Bonus",
    description: "Month-wise bonus computation with proration",
    completed: false,
    current: false,
  },
  {
    id: 4,
    title: "Review & Confirm",
    description: "Final approval before payroll integration",
    completed: false,
    current: false,
  },
  {
    id: 5,
    title: "Push to Payroll",
    description: "Create earning entries in system",
    completed: false,
    current: false,
  },
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
  { id: "emp-1", name: "John Doe", site: "site-a", monthlyBonus: false, salaryStatus: "active" },
  { id: "emp-2", name: "Jane Smith", site: "site-a", monthlyBonus: false, salaryStatus: "active" },
  { id: "emp-3", name: "Mike Johnson", site: "site-b", monthlyBonus: true, salaryStatus: "active" },
  { id: "emp-4", name: "Sarah Wilson", site: "site-b", monthlyBonus: false, salaryStatus: "active" },
  { id: "emp-5", name: "David Brown", site: "site-a", monthlyBonus: false, salaryStatus: "active" },
]

const BONUS_CEILING = 21000
const monthOptions = generateMonthOptions(2023, 2026)

export default function BonusWorkingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState(initialSteps)


  // Step 1: Context Selection
  const [selectedClient, setSelectedClient] = useState("client-1")
  const [selectedSite, setSelectedSite] = useState("site-a")
  const [financialYear, setFinancialYear] = useState("2025-26")
  const [bonusPercentage, setBonusPercentage] = useState("8.33")
  const [payoutMonth, setPayoutMonth] = useState("2026-03")

  // Step 2: Employee Selection
  const [employeeList, setEmployeeList] = useState(
    mockEmployees
      .filter((emp) => !emp.monthlyBonus && emp.salaryStatus === "active")
      .map((emp) => ({ ...emp, selected: true })),
  )

  // Step 3: Bonus Calculation
  const [bonusCalculation, setBonusCalculation] = useState<any[]>([])
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  const handleContextNext = () => {
    if (!selectedClient || !selectedSite || !financialYear || !bonusPercentage || !payoutMonth) {
      toast.error("Missing Fields",{
    
        description: "Please fill all required fields",
    
      })
      return
    }

    updateStep(1, true)
    setCurrentStep(2)
  }

  const handleEmployeeNext = () => {
    const selected = employeeList.filter((emp) => emp.selected)
    if (selected.length === 0) {
      toast.error(  "No Employees Selected",{
     
        description: "Please select at least one employee",
   
      })
      return
    }

    calculateBonus(selected)
    updateStep(2, true)
    setCurrentStep(3)
  }

  const calculateBonus = (employees: any[]) => {
    const fy = financialYear.split("-")[0] // e.g., "2025"
    const fyMonths = [
      `${fy}-04`,
      `${fy}-05`,
      `${fy}-06`,
      `${fy}-07`,
      `${fy}-08`,
      `${fy}-09`,
      `${fy}-10`,
      `${fy}-11`,
      `${fy}-12`,
      `${Number(fy) + 1}-01`,
      `${Number(fy) + 1}-02`,
      `${Number(fy) + 1}-03`,
    ]

    const calculations = employees.map((emp) => {
      const monthBreakdown = fyMonths.map((month) => {
        const basicDA = 18000
        const eligibleSalary = Math.min(basicDA, BONUS_CEILING)
        const payableDays = 26
        const totalDays = 26
        const monthlyBonus = ((eligibleSalary * Number(bonusPercentage)) / 100) * (payableDays / totalDays)

        return {
          month: formatMonthLabel(month),
          monthValue: month,
          basicDA,
          ceilingApplied: eligibleSalary,
          payableDays,
          totalDays,
          monthlyBonus: Math.round(monthlyBonus),
        }
      })

      const totalBonus = monthBreakdown.reduce((sum, m) => sum + m.monthlyBonus, 0)

      return {
        empId: emp.id,
        empName: emp.name,
        site: emp.site,
        monthBreakdown,
        totalBonus,
      }
    })
    setBonusCalculation(calculations)
  }

  const handleCalculationNext = () => {
    updateStep(3, true)
    setCurrentStep(4)
  }

  const handleReviewConfirm = () => {
    toast.success( "Bonus Confirmed",{
 
      description: "Proceeding to payroll integration",
    })
    updateStep(4, true)
    setCurrentStep(5)
  }

  const handlePushToPayroll = () => {
    toast.success(  "Success",{
      description: `${employeeList.filter((emp) => emp.selected).length} bonus entries created and pushed to Earning & Deduction`,
    })

    // Reset to Step 1 after successful completion
    setCurrentStep(1)
    setSteps(initialSteps)
    setSelectedClient("client-1")
    setSelectedSite("site-a")
    setFinancialYear("2025-26")
    setBonusPercentage("8.33")
    setPayoutMonth("2026-03")
    setEmployeeList(
      mockEmployees
        .filter((emp) => !emp.monthlyBonus && emp.salaryStatus === "active")
        .map((emp) => ({ ...emp, selected: true })),
    )
    setBonusCalculation([])
    setExpandedEmployee(null)
  }

  const updateStep = (stepIndex: number, completed: boolean) => {
    setSteps(steps.map((step, idx) => (idx === stepIndex - 1 ? { ...step, completed, current: false } : step)))
  }

  const getSitesForClient = () => {
    return mockSites.filter((site) => site.clientId === selectedClient)
  }

  const totalBonus = bonusCalculation.reduce((sum, emp) => sum + emp.totalBonus, 0)

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bonus Working</h1>
            <p className="text-muted-foreground">Statutory Bonus Calculation under Payment of Bonus Act</p>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardContent className="pt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>

        {/* Step 1: Bonus Context */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Bonus Context</CardTitle>
              <CardDescription>Configure financial year, bonus percentage, and payout details</CardDescription>
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
                  <label className="text-sm font-medium">Site *</label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSitesForClient().map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Financial Year *</label>
                  <Select value={financialYear} onValueChange={setFinancialYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select FY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bonus % *</label>
                  <Select value={bonusPercentage} onValueChange={setBonusPercentage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select %" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8.33">8.33%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="12.5">12.5%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payout Month *</label>
                  <Select value={payoutMonth} onValueChange={setPayoutMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.slice(-6).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Bonus is calculated for 12 months (Apr-Mar) of the financial year and paid in
                  the selected month.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleContextNext}>Next Step</Button>
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
                {employeeList.length} employees eligible (excludes monthly bonus recipients and inactive staff)
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
                    <TableHead>Site</TableHead>
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
                      <TableCell className="text-sm text-muted-foreground">{emp.site}</TableCell>
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

        {/* Step 3: Month-wise Bonus Calculation */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Month-wise Bonus Calculation</CardTitle>
              <CardDescription>Click View to see employee month-wise breakdown with proration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Employee ID</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="text-right font-semibold">FY Months</TableHead>
                      <TableHead className="text-right font-semibold">Total Bonus</TableHead>
                      <TableHead className="text-center font-semibold">View Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonusCalculation.map((empCalc) => (
                      <TableRow key={empCalc.empId} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{empCalc.empId}</TableCell>
                        <TableCell>{empCalc.empName}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {empCalc.monthBreakdown.length} months
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{empCalc.totalBonus.toLocaleString("en-IN")}
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
                    const selectedEmp = bonusCalculation.find((emp) => emp.empId === expandedEmployee)
                    if (!selectedEmp) return null
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-lg font-semibold">{selectedEmp.empName}</p>
                            <p className="text-sm text-muted-foreground">{selectedEmp.empId}</p>
                          </div>
                          <Badge className="text-base">₹{selectedEmp.totalBonus.toLocaleString("en-IN")}</Badge>
                        </div>

                        <div className="border rounded-lg overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader>
                              <TableRow className="bg-white">
                                <TableHead className="font-semibold">Month</TableHead>
                                <TableHead className="text-right font-semibold">Basic+DA</TableHead>
                                <TableHead className="text-right font-semibold">Ceiling Applied</TableHead>
                                <TableHead className="text-right font-semibold">Payable Days</TableHead>
                                <TableHead className="text-right font-semibold">Monthly Bonus</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedEmp.monthBreakdown.map((month: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{month.month}</TableCell>
                                  <TableCell className="text-right">₹{month.basicDA.toLocaleString("en-IN")}</TableCell>
                                  <TableCell className="text-right">
                                    ₹{month.ceilingApplied.toLocaleString("en-IN")}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">
                                    {month.payableDays}/{month.totalDays}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    ₹{month.monthlyBonus.toLocaleString("en-IN")}
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
              <CardTitle>Review & Confirm</CardTitle>
              <CardDescription>Final review before pushing to payroll system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-accent/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-3xl font-bold">{bonusCalculation.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Financial Year</p>
                    <p className="text-3xl font-bold">{financialYear}</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Bonus Payout</p>
                    <p className="text-2xl font-bold">₹{totalBonus.toLocaleString("en-IN")}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Compliance Warning</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Once confirmed, bonus entries cannot be edited. Ensure all calculations are accurate before
                    proceeding.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button onClick={handleReviewConfirm} className="gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm & Lock
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Push to Payroll */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Push to Payroll</CardTitle>
              <CardDescription>Create earning entries in Earning & Deduction module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 font-medium">Ready to Create Entries</p>
                <p className="text-sm text-green-800 mt-2">
                  {bonusCalculation.length} earning entries of "Statutory Bonus" for {formatMonthLabel(payoutMonth)}{" "}
                  will be created.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Bonus Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusCalculation.map((emp) => (
                    <TableRow key={emp.empId}>
                      <TableCell className="font-medium">{emp.empId}</TableCell>
                      <TableCell>{emp.empName}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{emp.totalBonus.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                <Button onClick={handlePushToPayroll} className="gap-2">
                  <Download className="h-4 w-4" />
                  Create Entries
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
