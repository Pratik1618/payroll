"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Lock, Copy, AlertTriangle, CheckCircle } from "lucide-react"
import { VariableUpload } from "@/components/ui/payroll/variable-upload"
import { SalaryHoldModal } from "@/components/ui/payroll/salary-hold-modal"
import { CloneSiteModal } from "@/components/ui/payroll/clone-site-modal"
import { toast } from "sonner"
import { SitesDropdown } from "@/components/ui/sites-dropdown"

const initialPayrollSteps = [
  {
    id: 1,
    title: "Import Attendance",
    description: "Select client & sites, sync attendance",
    completed: false,
    current: false,
  },
  {
    id: 2,
    title: "Calculate Payroll",
    description: "Process salary based on attendance",
    completed: false,
    current: false,
  },
  { id: 3, title: "Review & Approve", description: "Validate payroll calculations", completed: false, current: false },
  { id: 4, title: "Lock Payroll", description: "Finalize and lock", completed: false, current: false },
]

const mockClients = [
  { id: "client-1", name: "ABC Corporation", sites: ["site-a", "site-b"] },
  { id: "client-2", name: "XYZ Industries", sites: ["site-c", "site-d"] },
  { id: "client-3", name: "Global Tech", sites: ["site-e"] },
]

const mockSites = [
  { id: "site-a", name: "Corporate Office", employees: 450, clientId: "client-1" },
  { id: "site-b", name: "Manufacturing Unit", employees: 520, clientId: "client-1" },
  { id: "site-c", name: "Warehouse", employees: 277, clientId: "client-2" },
  { id: "site-d", name: "Distribution Center", employees: 180, clientId: "client-2" },
  { id: "site-e", name: "Tech Hub", employees: 320, clientId: "client-3" },
]

// 1. Add basicSalary to each employee in mockAttendanceData
//  Add two overtime types: clientOvertime and ismartOvertime
const mockAttendanceData = [
   { empId: "EMP001", name: "John Doe", daysPresent: 22, totalDays: 26, leaves: 2, lop: 2, clientOvertime: 5, ismartOvertime: 3, basicSalary: 28000 ,advanceRemaining:1000},
  { empId: "EMP002", name: "Jane Smith", daysPresent: 24, totalDays: 26, leaves: 1, lop: 1, clientOvertime: 8, ismartOvertime: 4, basicSalary: 32000 ,advanceRemaining:500},
  { empId: "EMP003", name: "Mike Johnson", daysPresent: 26, totalDays: 26, leaves: 0, lop: 0, clientOvertime: 10, ismartOvertime: 5, basicSalary: 25000,advanceRemaining:0},
  { empId: "EMP004", name: "Sarah Wilson", daysPresent: 20, totalDays: 26, leaves: 3, lop: 3, clientOvertime: 2, ismartOvertime: 1, basicSalary: 22000 ,advanceRemaining:700},
  { empId: "EMP005", name: "David Brown", daysPresent: 25, totalDays: 26, leaves: 1, lop: 0, clientOvertime: 6, ismartOvertime: 4, basicSalary: 35000 ,advanceRemaining:0},
]

// add an initial payroll-data constant for easy reset
const initialPayrollData = {
  totalEmployees: 0,
  grossPayroll: 0,
  overtimeHours: 0,
  onHold: 0,
  attendanceImported: false,
  payrollCalculated: false,
  reviewCompleted: false,
  payrollLocked: false,
}

export default function PayrollPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [payrollSteps, setPayrollSteps] = useState(initialPayrollSteps)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showVariableUpload, setShowVariableUpload] = useState(false)
  const [showSalaryHold, setShowSalaryHold] = useState(false)
  const [showCloneSite, setShowCloneSite] = useState(false)

  const [selectedClient, setSelectedClient] = useState("")
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [payrollCalculations, setPayrollCalculations] = useState<any[]>([])

  // use the shared initialPayrollData
  const [payrollData, setPayrollData] = useState(initialPayrollData)

  const [pendingLeavesCount, setPendingLeavesCount] = useState(0)
  const [overridePendingLeaves, setOverridePendingLeaves] = useState(false)
  const [overrideReason, setOverrideReason] = useState("")

  useEffect(() => {
    const updatedSteps = payrollSteps.map((step, index) => ({
      ...step,
      completed: index < currentStep - 1,
      current: index === currentStep - 1,
    }))
    setPayrollSteps(updatedSteps)
  }, [currentStep])

  const getAvailableSites = () => {
    if (!selectedClient) return []
    return mockSites.filter((site) => site.clientId === selectedClient)
  }

  const processCurrentStep = async () => {
    setIsProcessing(true)

    try {
      switch (currentStep) {
        case 1:
          if (!selectedClient || selectedSites.length === 0) {
            toast("Selection Required", {
              description: "Please select a client and at least one site.",
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            setIsProcessing(false)
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Generate attendance data for selected sites
          const totalEmployees = selectedSites.reduce((sum, siteId) => {
            const site = mockSites.find((s) => s.id === siteId)
            return sum + (site?.employees || 0)
          }, 0)

          setAttendanceData(mockAttendanceData)
          // compute total overtime (client + ismart) for dashboard
          const totalOT = mockAttendanceData.reduce((sum, emp) => sum + (emp.clientOvertime || 0) + (emp.ismartOvertime || 0), 0)

          setPayrollData((prev) => ({
            ...prev,
            onHold:2,
            attendanceImported: true,
            totalEmployees,
            overtimeHours: totalOT,
          }))

          toast("Attendance Imported", {
            description: `Successfully imported attendance data for ${totalEmployees} employees from ${selectedSites.length} sites.`,
            action: {
              label: "OK",
              onClick: () => console.log("ok"),
            },
          })
          break

        case 2:
          await new Promise((resolve) => setTimeout(resolve, 3000))

          // Calculate all salary components with LOP adjustment
          // separate rates for overtime types
          const clientOtRate = 200 // per hour for client OT
          const ismartOtRate = 150 // per hour for ismart OT

          const calculations = attendanceData.map((emp) => {
            const paidDays = emp.totalDays - emp.lop
            const dayRatio = paidDays / emp.totalDays

            // Actual earned (pro-rata) components
            const earnedBasic = emp.basicSalary * dayRatio
            const da = earnedBasic * 0.15
            const hra = earnedBasic * 0.20
            const cca = 1000 * dayRatio

            // Given (full) components for reference
            const givenBasic = emp.basicSalary
            const givenDa = givenBasic * 0.15
            const givenHra = givenBasic * 0.20
            const givenCca = 1000

            const pt = 200
            const lwf = 50

            // compute OT breakdown & pay
            const clientOvertime = emp.clientOvertime || 0
            const ismartOvertime = emp.ismartOvertime || 0
            const totalOvertime = clientOvertime + ismartOvertime
            const overtimePay = Math.round(clientOvertime * clientOtRate + ismartOvertime * ismartOtRate)

            // Gross salary
            const grossSalary = earnedBasic + da + hra + cca + overtimePay
            const givenGrossSalary = givenBasic + givenDa + givenHra + givenCca + (clientOvertime + ismartOvertime) * clientOtRate

            const pf = earnedBasic > 15000 ? 1800 : earnedBasic * 0.12
            const esi = grossSalary > 21000 ? 0 : grossSalary * 0.0175

            const lopDeduction = (givenBasic + givenDa + givenHra + givenCca) - (earnedBasic + da + hra + cca)
            const totalDeductions = pf + esi + pt + lwf 
            const netSalary = grossSalary - totalDeductions
            const inHandSalary = netSalary - emp.advanceRemaining
            const advanceRemaining = emp.advanceRemaining

            return {
              ...emp,
              paidDays,
              clientOvertime,
              ismartOvertime,
              overtime: totalOvertime,
              overtimePay: Math.round(overtimePay),
              // Actual earned
              earnedBasic: Math.round(earnedBasic),
              da: Math.round(da),
              hra: Math.round(hra),
              cca: Math.round(cca),
              grossSalary: Math.round(grossSalary),
              pf: Math.round(pf),
              esi: Math.round(esi),
              pt: Math.round(pt),
              lwf: Math.round(lwf),
              lopDeduction: Math.round(lopDeduction),
              totalDeductions: Math.round(totalDeductions),
              netSalary: Math.round(netSalary),
              advanceRemaining: Math.round(advanceRemaining),
              inHandSalary : Math.round(inHandSalary),
              // Given (full) components
              givenBasic: Math.round(givenBasic),
              givenDa: Math.round(givenDa),
              givenHra: Math.round(givenHra),
              givenCca: Math.round(givenCca),
              givenGrossSalary: Math.round(givenGrossSalary),
              
            }
          })

          setPayrollCalculations(calculations)
          const totalGross = calculations.reduce((sum, emp) => sum + emp.grossSalary, 0)
          const totalOtHours = calculations.reduce((sum, emp) => sum + (emp.overtime || 0), 0)

          setPayrollData((prev) => ({
            ...prev,
            payrollCalculated: true,
            grossPayroll: totalGross,
            overtimeHours: totalOtHours,
          }))

          toast("Payroll Calculated", {
            description: `Salary calculations completed for ${calculations.length} employees. Total gross: ₹${(totalGross / 100000).toFixed(1)}L`,
            action: {
              label: "OK",
              onClick: () => console.log("ok"),
            },
          })
          break

        case 3:
          // Review & Approve
          await new Promise((resolve) => setTimeout(resolve, 1500))
          setPayrollData((prev) => ({ ...prev, reviewCompleted: true }))
          toast("Review Completed", {
            description: "Payroll data has been reviewed and approved.",
            action: {
              label: "OK",
              onClick: () => console.log("ok"),
            },
          })
          break

        case 4:
          // Lock Payroll
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setPayrollData((prev) => ({ ...prev, payrollLocked: true }))
          toast("Payroll Locked", {
            description: "Payroll has been finalized and locked for processing.",
            action: {
              label: "OK",
              onClick: () => console.log("ok"),
            },
          })
          break
      }

      if (currentStep < payrollSteps.length) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to process step. Please try again.",

        action: {
          label: "Retry",
          onClick: () => console.log("retry clicked"),
        },
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1 && !payrollData.payrollLocked) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStep <= payrollSteps.length && !isProcessing) {
      processCurrentStep()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedClient && selectedSites.length > 0
      case 2:
        return payrollData.attendanceImported
      case 3:
        return payrollData.payrollCalculated
      case 4:
        if (!payrollData.reviewCompleted) return false
        const canLock = pendingLeavesCount === 0 || (overridePendingLeaves && overrideReason.trim().length >= 5)
        return canLock
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <Upload className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import Attendance Data</h3>
              <p className="text-muted-foreground mb-4">Select client and sites to import attendance data</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client" />
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

              {/* Sites Dropdown with Search and Select All */}
              <div className="space-y-2">
                <SitesDropdown
                  sites={getAvailableSites()}
                  selectedSites={selectedSites}
                  setSelectedSites={setSelectedSites}
                  label="Select Sites"
                />
              </div>
            </div>

            {selectedClient && selectedSites.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to Import</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {selectedSites.length} sites selected with{" "}
                  {getAvailableSites()
                    .filter((site) => selectedSites.includes(site.id))
                    .reduce((sum, site) => sum + site.employees, 0)}{" "}
                  total employees
                </p>
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calculate Payroll</h3>
              <p className="text-muted-foreground mb-4">
                Process salary calculations based on attendance and leave data
              </p>
            </div>

            {payrollData.attendanceImported && attendanceData.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Attendance Summary</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {attendanceData.reduce((sum, emp) => sum + emp.daysPresent, 0)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Total Present Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {attendanceData.reduce((sum, emp) => sum + emp.lop, 0)}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">LOP Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {/* show combined OT hours and breakdown in tooltip-like text */}
                      {payrollData.overtimeHours}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Total OT (client + ismart)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">Pending Leave Exceptions</h4>
                    {pendingLeavesCount > 0 ? (
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        There are {pendingLeavesCount} pending leave request(s) for the selected client/site(s). Payroll
                        cannot approve or reject leaves. Locking is blocked until leaves are finalized, or you
                        explicitly override with reason.
                      </p>
                    ) : (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        No pending leave exceptions. You can proceed to lock payroll.
                      </p>
                    )}
                  </div>
                </div>
                {pendingLeavesCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast("Managers Notified", {
                          description: "A notification has been sent to managers to resolve pending leaves",
                          action: {
                            label: "OK",
                            onClick: () => console.log("ok"),
                          },
                        })
                      }
                    >
                      Notify Managers
                    </Button>
                  </div>
                )}
              </div>

              {pendingLeavesCount > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Override with LOP (requires reason)</label>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={overridePendingLeaves}
                        onChange={(e) => setOverridePendingLeaves(e.target.checked)}
                      />
                      Treat pending leaves as LOP for this cycle
                    </label>
                    <input
                      type="text"
                      placeholder="Enter reason (min 5 chars)"
                      className="w-full md:w-80 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      disabled={!overridePendingLeaves}
                      aria-disabled={!overridePendingLeaves}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground  ">
                    An override is auditable. Ensure the Leave module resolves these items post-cycle.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="text-center py-8">
            <Lock className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lock Payroll</h3>
            <p className="text-muted-foreground mb-4">Finalize and lock payroll for disbursement</p>
            {payrollData.reviewCompleted && !payrollData.payrollLocked && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Ready to lock payroll</span>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payroll Complete</h3>
            <p className="text-muted-foreground">Payroll processing has been completed successfully</p>
          </div>
        )
    }
  }

  const generateBankFile = () => {
    if (!payrollData.payrollLocked || payrollCalculations.length === 0) {
      toast.error("Cannot Generate Bank File", {
        description: "Payroll must be locked and calculations must be completed.",
        action: {
          label: "OK",
          onClick: () => console.log("ok"),
        },
      })
      return
    }

    // Updated header as per your latest format
    const header = "TYPE,DEBIT BANK A/C NO,DEBIT AMT,CUR,BENEFICIARY A/C NO,IFSC CODE,NARRATION/NAME (NOT MORE THAN 20)"

    // Generate a random 12-digit beneficiary account number for each row
    const randomAccountNumber = () =>
      Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")

    const bankFileData = payrollCalculations.map((emp) => [
      "NEFT", // TYPE
      "12345678901234", // DEBIT BANK A/C NO (mocked, replace as needed)
      emp.inHandSalary?.toString() ?? "", // DEBIT AMT
      "INR", // CUR
      randomAccountNumber(), // BENEFICIARY A/C NO (random 12-digit number)
      emp.ifsc || "HDFC0001234", // IFSC CODE (mock or real if available)
      (emp.name || "").substring(0, 20), // NARRATION/NAME (NOT MORE THAN 20)
    ].join(","))

    const csvContent = [header, ...bankFileData].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `bank_upload_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast("Bank File Generated", {
      description: "Bank file has been generated and downloaded.",
      className: "bg-green-600 text-white",
      action: {
        label: "OK",
        onClick: () => console.log("ok"),
      },
    })

    // --- NEW: reset state and go back to first step ---
    setPayrollCalculations([])
    setAttendanceData([])
    setSelectedClient("")
    setSelectedSites([])
    setPayrollData(initialPayrollData)
    setCurrentStep(1)
    // --- end new code ---
  }

  useEffect(() => {
    if (currentStep === 4 && payrollCalculations.length > 0) {
      const earnedData = payrollCalculations.map(emp => ({
        empId: emp.empId,
        name: emp.name,
        designation: emp.designation,
        totalDays: emp.totalDays,
        daysPresent: emp.daysPresent,
        leaves: emp.leaves,
        lop: emp.lop,
        pf: emp.pf,
        pt: emp.pt,
        esic: emp.esi,
        lwf: emp.lwf,
        earnedBasic: emp.earnedBasic,
        da: emp.da,
        hra: emp.hra,
        cca: emp.cca,
        overtimePay: emp.overtimePay,
        clientOvertime: emp.clientOvertime,
        ismartOvertime: emp.ismartOvertime,
        grossSalary: emp.grossSalary,  // earned gross
        totalDeductions: emp.totalDeductions,
        netSalary: emp.netSalary,
        inHandSalary:emp.inHandSalary,
        advanceRemaining: emp.advanceRemaining,
        lopDeduction:emp.lopDeduction,
        otHours:emp.overtime
      }));

      localStorage.setItem("reviewData", JSON.stringify(earnedData));
      console.log("✅ Earned salary structure saved to localStorage");
    }
  }, [currentStep, payrollCalculations]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll Processing</h1>
            <p className="text-muted-foreground">Process monthly payroll with step-by-step workflow</p>
          </div>
        </div>

        {/* Payroll Stepper */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Payroll Processing Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <Stepper steps={payrollSteps} currentStep={currentStep} />

            <div className="mt-8 mb-6">{renderStepContent()}</div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1 || payrollData.payrollLocked || isProcessing}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {payrollData.payrollLocked && (
                  <Button onClick={generateBankFile} variant="default" className="bg-green-600 hover:bg-green-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Generate Bank File
                  </Button>
                )}

                <Button
                  onClick={handleNextStep}
                  disabled={currentStep > payrollSteps.length || !canProceed() || payrollData.payrollLocked}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : currentStep > payrollSteps.length ? (
                    "Complete"
                  ) : (
                    `Process Step ${currentStep}`
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold text-foreground">{payrollData.totalEmployees.toLocaleString()}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {payrollData.attendanceImported ? "Imported" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Payroll</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{(payrollData.grossPayroll / 100000).toFixed(1)}L
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {payrollData.payrollCalculated ? "Calculated" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overtime Hours</p>
                  <p className="text-2xl font-bold text-foreground">{payrollData.overtimeHours.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  client + ismart
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On Hold</p>
                  <p className="text-2xl font-bold text-foreground">{payrollData.onHold}</p>
                </div>
                <Lock className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSalaryHold(true)}
                  className="text-xs"
                  disabled={payrollData.payrollLocked}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {payrollData.attendanceImported && currentStep >= 2 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                {currentStep === 2 ? "Attendance Data" : "Payroll Calculations"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Emp Code</th>
                      <th className="text-left p-2">Present Days</th>
                      <th className="text-left p-2">Leaves</th>
                      <th className="text-left p-2">LOP</th>
                      <th className = "text-left p-2">Paid Days</th>
                      <th className="text-left p-2">Client OT</th>
                      <th className="text-left p-2">iSmart OT</th>
                      <th className="text-left p-2">Total OT</th>
                      {currentStep >= 3 && (
                        <>
                          <th className="text-left p-2">Basic<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">DA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">HRA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">CCA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">OverTime Pay</th>
                          
                          <th className="text-left p-2">
                            Gross Salary<br />
                            <span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span>
                          </th>
                          <th className="text-left p-2">PF</th>
                          <th className="text-left p-2">ESIC</th>
                          <th className="text-left p-2">PT</th>
                          <th className="text-left p-2">LWF</th>

                          <th className="text-left p-2">Deductions</th>
                          <th className="text-left p-2">Net Salary</th>
                          <th className="text-left p-2">Advance Remaining</th>
                          <th className="text-left p-2">InHand Salary<br/> 
                            <span className="text-xs text-muted-foreground">(net salary - advance)</span>

                          </th>

                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(currentStep >= 3 ? payrollCalculations : attendanceData).map((emp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">{emp.empId}</div>
                          </div>
                        </td>
                        <td className="p-2">{emp.empId}</td>
                        <td className="p-2">
                          {emp.daysPresent}/{emp.totalDays}
                        </td>
                        <td className="p-2">{emp.leaves}</td>
                        <td className="p-2">
                          <Badge variant={emp.lop > 0 ? "destructive" : "secondary"}>{emp.lop}</Badge>
                        </td>
                        <td className="p-2">{emp.daysPresent+emp.leaves}</td>

                        {/* show OT breakdown */}
                        <td className="p-2">
                          <Badge variant={emp.clientOvertime > 0 ? "secondary" : undefined}>{emp.clientOvertime ?? (emp.clientOvertime === 0 ? "0" : "-")}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={emp.ismartOvertime > 0 ? "secondary" : undefined}>{emp.ismartOvertime ?? (emp.ismartOvertime === 0 ? "0" : "-")}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={(emp.clientOvertime + (emp.ismartOvertime || 0)) > 10 ? "destructive" : "secondary"}>{(emp.clientOvertime || 0) + (emp.ismartOvertime || 0)}h</Badge>
                        </td>

                        {currentStep >= 3 && (
                          <>
                            <td className="p-2">
                              ₹{emp.givenBasic?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.earnedBasic?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenDa?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.da?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenHra?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.hra?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenCca?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.cca?.toLocaleString()}
                              </span>
                            </td>
                                <td className="p-2">
                              ₹{emp.overtimePay?.toLocaleString()}
                            
                            </td>
                            <td className="p-2">
                              ₹{emp.givenGrossSalary?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.grossSalary?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">₹{emp.pf?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.esi?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.pt?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.lwf?.toLocaleString()}</td>

                            <td className="p-2">₹{emp.totalDeductions?.toLocaleString()}</td>
                            <td className="p-2 font-medium">₹{emp.netSalary?.toLocaleString()}</td>
                            <td className="p-2 font-medium">₹{emp.advanceRemaining?.toLocaleString()}</td>
                            <td className="p-2 font-medium">₹{emp.inHandSalary?.toLocaleString()}</td>
                          
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {showSalaryHold && <SalaryHoldModal onClose={() => setShowSalaryHold(false)} />}
      </div>
    </MainLayout>
  )
}