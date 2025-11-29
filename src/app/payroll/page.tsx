"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Lock, Copy, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
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
  { id: "site-a", name: "Corporate Office", employees: 450, clientId: "client-1", branchId: "branch-1" },
  { id: "site-b", name: "Manufacturing Unit", employees: 520, clientId: "client-1", branchId: "branch-2" },
  { id: "site-c", name: "Warehouse", employees: 277, clientId: "client-2", branchId: "branch-1" },
  { id: "site-d", name: "Distribution Center", employees: 180, clientId: "client-2", branchId: "branch-3" },
  { id: "site-e", name: "Tech Hub", employees: 320, clientId: "client-3", branchId: "branch-2" },
]

// added: branches (states) list
const mockBranches = [
  { id: "branch-1", name: "Gujarat" },
  { id: "branch-2", name: "Maharashtra" },
  { id: "branch-3", name: "Karnataka" },
  { id: "branch-4", name: "Tamil Nadu" },
]

// 1. Add basicSalary to each employee in mockAttendanceData
//  Add two overtime types: clientOvertime and ismartOvertime
const mockAttendanceData = [
  { empId: "EMP001", name: "John Doe", designation: "housekeeper", daysPresent: 22, totalDays: 26, leaves: 2, lop: 2, clientOvertime: 5, ismartOvertime: 3, basicSalary: 28000, advanceRemaining: 1000 },
  { empId: "EMP002", name: "Jane Smith", designation: "Receptionist", daysPresent: 24, totalDays: 26, leaves: 1, lop: 1, clientOvertime: 8, ismartOvertime: 4, basicSalary: 32000, advanceRemaining: 500 },
  { empId: "EMP003", name: "Mike Johnson", designation: "housekeeper", daysPresent: 26, totalDays: 26, leaves: 0, lop: 0, clientOvertime: 10, ismartOvertime: 5, basicSalary: 25000, advanceRemaining: 0 },
  { empId: "EMP004", name: "Sarah Wilson", designation: "chambermaid", daysPresent: 20, totalDays: 26, leaves: 3, lop: 3, clientOvertime: 2, ismartOvertime: 1, basicSalary: 22000, advanceRemaining: 700 },
  { empId: "EMP005", name: "David Brown", designation: "supervisor", daysPresent: 25, totalDays: 26, leaves: 1, lop: 0, clientOvertime: 6, ismartOvertime: 4, basicSalary: 35000, advanceRemaining: 0 },
]

// add an initial payroll-data constant for easy reset
const initialPayrollData = {
  totalEmployees: 0,
  grossPayroll: 0,
  overtimeHours: 0,
  ismartOt: 0,
  clientOt: 0,
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
  const [selectedClients, setSelectedClients] = useState<string[]>([]) // when branch selected: multi-client selection
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("") // new: branch/state selection
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
    // If a branch is selected, show sites under that branch.
    // If selectedClients has values, limit to those clients; otherwise show all clients in branch.
    if (selectedBranch) {
      const sites = mockSites.filter((site) => site.branchId === selectedBranch)
      if (selectedClients.length > 0) {
        return sites.filter((s) => selectedClients.includes(s.clientId))
      }
      return sites
    }

    if (!selectedClient) return []
    return mockSites.filter((site) => site.clientId === selectedClient)
  }

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((c) => c !== clientId) : [...prev, clientId]))
  }

  const selectAllBranchClients = (clientIds: string[]) => {
    setSelectedClients(clientIds)
  }

  const processCurrentStep = async () => {
    setIsProcessing(true)

    try {
      switch (currentStep) {
        case 1:
          // If branch selected -> bulk import across all clients/sites in branch.
          if (!selectedBranch && (!selectedClient || selectedSites.length === 0)) {
            toast("Selection Required", {
              description: "Please select a client and at least one site, or select a branch for bulk import.",
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
            setIsProcessing(false)
            return
          }

          // Bulk import when branch selected
          const totalOT = mockAttendanceData.reduce((sum, emp) => sum + (emp.clientOvertime || 0) + (emp.ismartOvertime || 0), 0)
          const totalClientOT = mockAttendanceData.reduce((sum, emp) => sum + (emp.clientOvertime || 0), 0)
          const totalIsmartOT = mockAttendanceData.reduce((sum, emp) => sum + (emp.ismartOvertime || 0), 0)
          if (selectedBranch) {
            // Sites in branch, optionally filtered by selectedClients (if any)
            let sitesInBranch = mockSites.filter((s) => s.branchId === selectedBranch)
            if (selectedClients.length > 0) {
              sitesInBranch = sitesInBranch.filter((s) => selectedClients.includes(s.clientId))
            }
            const totalEmployees = sitesInBranch.reduce((sum, s) => sum + (s.employees || 0), 0)
            const sitesCount = sitesInBranch.length
            const clientsCount = Array.from(new Set(sitesInBranch.map((s) => s.clientId))).length

            setAttendanceData(mockAttendanceData)
            setPayrollData((prev) => ({
              ...prev,
              onHold: 2,
              attendanceImported: true,
              totalEmployees,
              clientOt: totalClientOT,
              ismartOt: totalIsmartOT,
              overtimeHours: totalOT,
            }))

            toast("Branch Bulk Attendance Imported", {
              description: `Imported attendance for ${totalEmployees} employees across ${sitesCount} site(s) and ${clientsCount} client(s) in the selected branch.`,
              action: {
                label: "OK",
                onClick: () => console.log("ok"),
              },
            })
          } else {
            // Generate attendance data for selected sites
            const totalEmployees = selectedSites.reduce((sum, siteId) => {
              const site = mockSites.find((s) => s.id === siteId)
              return sum + (site?.employees || 0)
            }, 0)

            setAttendanceData(mockAttendanceData)
            setPayrollData((prev) => ({
              ...prev,
              onHold: 2,
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
          }
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

            //fixed component
            const earnedBasic = emp.basicSalary * dayRatio
            const da = earnedBasic * 0.15
            const hra = earnedBasic * 0.20
            const conveyance = 0
            const washingAllowance = 0
            const otherAllowance = 0
            const leaveWithWages = 0
            const cca = 1000 * dayRatio

            const educationalAllowance = 0
            const medicalAllowance = 0
            const specialAllowance = 0
            const bonus = 0
            const meal = 0
            const siteAllowance = 0
            const performanceAllowance = 0
            const food = 0
            const metroCityAllowance = 0
            const stipend = 0




            //non fixed components
            const convy = 0
            const reimbursement = 0
            const cashRiskAllowance = 0
            const incentive = 0





            // Given (full) components for reference
            const givenBasic = emp.basicSalary
            const givenDa = givenBasic * 0.15
            const givenHra = givenBasic * 0.20
            const givenConveyance = 0
            const givenWashingAllowance = 0
            const givenOtherAllowance = 0
            const givenLeaveWithWages = 0
            const givenCca = 1000
            const givenEducationalAllowance = 0
            const givenMedicalAllowance = 0
            const givenSpecialAllowance = 0
            const givenBonus = 0
            const givenMeal = 0
            const givenSiteAllowance = 0
            const givenPerformanceAllowance = 0
            const givenFood = 0
            const givenMetroCityAllowance = 0
            const givenStipend = 0






            // compute OT breakdown & pay
            const clientOvertime = emp.clientOvertime || 0
            const ismartOvertime = emp.ismartOvertime || 0
            const totalOvertime = clientOvertime + ismartOvertime
            const overtimePay = Math.round(clientOvertime * clientOtRate + ismartOvertime * ismartOtRate)

            // Gross salary
            const grossSalary = Math.round(
              earnedBasic + da + hra + conveyance + convy + cca + washingAllowance + educationalAllowance +
              medicalAllowance + siteAllowance + performanceAllowance + cashRiskAllowance +
              incentive + food + metroCityAllowance + stipend + specialAllowance +
              reimbursement + bonus + meal + otherAllowance + leaveWithWages + overtimePay
            )
            const givenGrossSalary = Math.round(
              givenBasic + givenBonus + givenCca + givenCca + givenConveyance +
              givenDa + givenEducationalAllowance + givenFood + givenHra +
              givenLeaveWithWages + givenMeal + givenMedicalAllowance + givenMetroCityAllowance + givenOtherAllowance +
              givenPerformanceAllowance + givenSiteAllowance +
              givenSpecialAllowance + givenStipend + givenWashingAllowance
            )

            const pf = earnedBasic > 15000 ? 1800 : earnedBasic * 0.12
            const esi = grossSalary > 21000 ? 0 : grossSalary * 0.0175
            const pt = 200
            const lwf = 50
            const uniform = 0
            const otherDeduction = 0
            const messDeduction = 0
            const uniformDeduction = 0
            const hraDeduction = 0
            const staffWelfareFund = 50
            const backgroundVerification = 0
            const lopDeduction = (givenBasic + givenDa + givenHra + givenCca) - (earnedBasic + da + hra + cca)
            const totalDeductions = Math.round(
              pf + esi + pt + lwf + uniform + + otherDeduction +
              messDeduction + uniformDeduction + hraDeduction + staffWelfareFund +
              backgroundVerification
            )
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
              conveyance: Math.round(conveyance),
              washingAllowance: Math.round(washingAllowance),
              otherAllowance: Math.round(otherAllowance),
              leaveWithWages: Math.round(leaveWithWages),
              cca: Math.round(cca),
              educationalAllowance: Math.round(educationalAllowance),
              medicalAllowance: Math.round(medicalAllowance),
              specialAllowance: Math.round(specialAllowance),
              bonus: Math.round(bonus),
              meal: Math.round(meal),
              siteAllowance: Math.round(siteAllowance),
              performanceAllowance: Math.round(performanceAllowance),
              food: Math.round(food),
              metroCityAllowance: Math.round(metroCityAllowance),
              stipend: Math.round(stipend),
              convy: Math.round(convy),
              reimbursement: Math.round(reimbursement),
              cashRiskAllowance: Math.round(cashRiskAllowance),
              incentive: Math.round(incentive),
              grossSalary: Math.round(grossSalary),
              pf: Math.round(pf),
              esi: Math.round(esi),
              pt: Math.round(pt),
              lwf: Math.round(lwf),
              uniform: Math.round(uniform),
              otherDeduction: Math.round(otherDeduction),
              messDeduction: Math.round(messDeduction),
              uniformDeduction: Math.round(uniformDeduction),
              hraDeduction: Math.round(hraDeduction),
              staffWelfareFund: Math.round(staffWelfareFund),
              backgroundVerification: Math.round(backgroundVerification),
              lopDeduction: Math.round(lopDeduction),
              totalDeductions: Math.round(totalDeductions),
              netSalary: Math.round(netSalary),
              advanceRemaining: Math.round(advanceRemaining),
              inHandSalary: Math.round(inHandSalary),
              // Given (full) components
              givenBasic: Math.round(givenBasic),
              givenDa: Math.round(givenDa),
              givenHra: Math.round(givenHra),
              givenConveyance: Math.round(givenConveyance),
              givenWashingAllowance: Math.round(givenWashingAllowance),
              givenOtherAllowance: Math.round(givenOtherAllowance),
              givenLeaveWithWages: Math.round(givenLeaveWithWages),
              givenCca: Math.round(givenCca),
              givenEducationalAllowance: Math.round(givenEducationalAllowance),
              givenMedicalAllowance: Math.round(givenMedicalAllowance),
              givenSpecialAllowance: Math.round(givenSpecialAllowance),
              givenBonus: Math.round(givenBonus),
              givenMeal: Math.round(givenMeal),
              givenSiteAllowance: Math.round(givenSiteAllowance),
              givenPerformanceAllowance: Math.round(givenPerformanceAllowance),
              givenFood: Math.round(givenFood),
              givenMetroCityAllowance: Math.round(givenMetroCityAllowance),
              givenStipend: Math.round(givenStipend),
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
        // allow proceed if branch selected (bulk import) or client+sites selected
        return !!selectedBranch || (selectedClient && selectedSites.length > 0)
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

            <div className="grid gap-4 md:grid-cols-4">
              {/* Branch / State Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a branch (optional)" />
                  </SelectTrigger>
                  <SelectContent>

                    {mockBranches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client selection:
                  - when branch selected: allow selecting some/all clients (checkbox list)
                  - when no branch: single client Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Client</label>
                {selectedBranch ? (
                  <div className="border rounded p-2 bg-background">
                    {/* compute clients that have sites in this branch */}
                    {(() => {
                      const branchClientIds = Array.from(
                        new Set(mockSites.filter((s) => s.branchId === selectedBranch).map((s) => s.clientId))
                      )
                      const branchClients = mockClients.filter((c) => branchClientIds.includes(c.id))
                      const allSelected = branchClients.length > 0 && branchClients.every((c) => selectedClients.includes(c.id))
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => {
                                  if (e.target.checked) selectAllBranchClients(branchClients.map((c) => c.id))
                                  else setSelectedClients([])
                                }}
                              />
                              <span className="font-medium">Select All</span>
                            </label>
                          </div>
                          <div className="grid gap-1">
                            {branchClients.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedClients.includes(c.id)}
                                  onChange={() => toggleClientSelection(c.id)}
                                />
                                <span>{c.name}</span>
                              </label>
                            ))}
                            {branchClients.length === 0 && <div className="text-xs text-muted-foreground">No clients found for this branch.</div>}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setSelectedSites([]) }}>
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
                )}
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
              <div className="grid gap-4 md:grid-cols-2">

              </div>
            </div>

            {(selectedBranch && (selectedClients.length > 0 || getAvailableSites().length > 0)) || (selectedClient && selectedSites.length > 0) ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to Import</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {(() => {
                    if (selectedBranch) {
                      const sites = getAvailableSites()
                      const totalEmployees = sites.reduce((sum, s) => sum + (s.employees || 0), 0)
                      const sitesCount = sites.length
                      const clientsCount = Array.from(new Set(sites.map((s) => s.clientId))).length
                      return `${sitesCount} site(s) across ${clientsCount} client(s) selected with ${totalEmployees} total employees`
                    } else {
                      const totalEmployees = getAvailableSites()
                        .filter((site) => selectedSites.includes(site.id))
                        .reduce((sum, site) => sum + site.employees, 0)
                      return `${selectedSites.length} sites selected with ${totalEmployees} total employees`
                    }
                  })()}
                </p>
              </div>
            ) : null}
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

  const generateBankFile = async () => {
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

    // Import XLSX dynamically
    const XLSX = await import("xlsx");

    // Generate a random 12-digit beneficiary account number for each row
    const randomAccountNumber = () =>
      Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")

    // Sheet 1: Bank Transaction Data
    const bankFileData = payrollCalculations.map((emp) => ({
      "TYPE": "NEFT",
      "DEBIT BANK A/C NO": "12345678901234",
      "DEBIT AMT": emp.inHandSalary || 0,
      "CUR": "INR",
      "BENEFICIARY A/C NO": randomAccountNumber(),
      "IFSC CODE": emp.ifsc || "HDFC0001234",
      "NARRATION/NAME (NOT MORE THAN 20)": (emp.name || "").substring(0, 20),
    }))

    // Sheet 2: Designation-wise Count
    const designationCount = payrollCalculations.reduce((acc, emp) => {
      const designation = emp.designation || "Unknown"
      acc[designation] = (acc[designation] || 0) + 1
      return acc
    }, {})

    const designationData = Object.entries(designationCount).map(([designation, count]) => ({
      "Designation": designation,
      "Employee Count": count,
    }))

    // Add total row
    designationData.push({
      "Designation": "TOTAL",
      "Employee Count": payrollCalculations.length,
    })

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Add Sheet 1: Bank Transactions
    const ws1 = XLSX.utils.json_to_sheet(bankFileData)
    XLSX.utils.book_append_sheet(wb, ws1, "Bank Transactions")

    // Add Sheet 2: Designation Summary
    const ws2 = XLSX.utils.json_to_sheet(designationData)
    XLSX.utils.book_append_sheet(wb, ws2, "Designation Summary")

    // Generate file and download
    XLSX.writeFile(wb, `bank_upload_${new Date().toISOString().split("T")[0]}.xlsx`)

    toast("Bank File Generated", {
      description: "Excel file with bank transactions and designation summary has been generated.",
      className: "bg-green-600 text-white",
      action: {
        label: "OK",
        onClick: () => console.log("ok"),
      },
    })

    // Reset state and go back to first step
    setPayrollCalculations([])
    setAttendanceData([])
    setSelectedClient("")
    setSelectedSites([])
    setPayrollData(initialPayrollData)
    setCurrentStep(1)
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
        wf: emp.staffWelfareFund,
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
        inHandSalary: emp.inHandSalary,
        advanceRemaining: emp.advanceRemaining,
        lopDeduction: emp.lopDeduction,
        otHours: emp.overtime
      }));

      localStorage.setItem("reviewData", JSON.stringify(earnedData));
      console.log("✅ Earned salary structure saved to localStorage");
    }
  }, [currentStep, payrollCalculations]);

  // when branch selected -> clear client/site selections (branch triggers bulk import)
  useEffect(() => {
    if (selectedBranch) {
      setSelectedClient("")
      setSelectedSites([])
      setSelectedClients([])
    }
  }, [selectedBranch])

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
                  <p className="text-sm text-muted-foreground">Client Overtime</p>
                  <p className="text-center text-2xl font-bold text-foreground">{payrollData.clientOt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">iSmart Overtime</p>
                  <p className="text-center text-2xl font-bold text-foreground">{payrollData.ismartOt.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
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
                      <th className="text-left p-2">Designation</th>
                      <th className="text-left p-2">Present Days</th>
                      <th className="text-left p-2">Leaves</th>
                      <th className="text-left p-2">LOP</th>
                      <th className="text-left p-2">Paid Days</th>
                      <th className="text-left p-2">Client OT</th>
                      <th className="text-left p-2">iSmart OT</th>
                      <th className="text-left p-2">Total OT</th>
                      {currentStep >= 3 && (
                        <>
                          <th className="text-left p-2">Basic<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">DA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">HRA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">CONVEYANCE<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>

                          <th className="text-left p-2">Washing<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Other all.<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Leave w/ Wages<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">CCA<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>

                          <th className="text-left p-2">Educational<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Medical<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Spl Allow<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Bonus<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Meal<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Site Allowance<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Performance<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Food<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Metro City<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2">Stipend<br /><span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span></th>
                          <th className="text-left p-2 b">OT Amount</th>
                          <th className="text-left p-2">Reimburse</th>
                          <th className="text-left p-2">Cony</th>
                          <th className="text-left p-2">Cash Risk</th>
                          <th className="text-left p-2">Incentive</th>


                          <th className="text-left p-2">
                            Gross Salary<br />
                            <span className="text-xs text-muted-foreground">(Given/<span className="text-green-600">Earned</span>)</span>
                          </th>
                          <th className="text-left p-2">PF</th>
                          <th className="text-left p-2">ESIC</th>
                          <th className="text-left p-2">PT</th>
                          <th className="text-left p-2">LWF</th>
                          <th className="text-left p-2">Other Ded</th>
                          <th className="text-left p-2">Uniform</th>


                          <th className="text-left p-2">Mess</th>
                          <th className="text-left p-2">HRA Ded</th>
                          <th className="text-left p-2">Staff Welfare Fund</th>
                          <th className="text-left p-2">BG Verification</th>


                          <th className="text-left p-2">Uniform Ded</th>

                          <th className="text-left p-2">Deductions</th>
                          <th className="text-left p-2">Net Salary</th>
                          <th className="text-left p-2">Advance Remaining</th>
                          <th className="text-left p-2">InHand Salary<br />
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
                        <td className="p-2">{emp.designation}</td>
                        <td className="p-2">
                          {emp.daysPresent}/{emp.totalDays}
                        </td>
                        <td className="p-2">{emp.leaves}</td>
                        <td className="p-2">
                          <Badge variant={emp.lop > 0 ? "destructive" : "secondary"}>{emp.lop}</Badge>
                        </td>
                        <td className="p-2">{emp.daysPresent + emp.leaves}</td>

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
                              ₹{emp.givenConveyance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.conveyance?.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-2">
                              ₹{emp.givenWashingAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.washingAllowance?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenOtherAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.otherAllowance?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenLeaveWithWages?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.leaveWithWages?.toLocaleString()}
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
                              ₹{emp.givenEducationalAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.educationalAllowance?.toLocaleString()}
                              </span>
                            </td>

                            <td className="p-2">
                              ₹{emp.givenMedicalAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.medicalAllowance?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenSpecialAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.specialAllowance?.toLocaleString()}
                              </span>
                            </td>  <td className="p-2">
                              ₹{emp.givenBonus?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.bonus?.toLocaleString()}
                              </span>
                            </td>  <td className="p-2">
                              ₹{emp.givenMeal?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.meal?.toLocaleString()}
                              </span>
                            </td>  <td className="p-2">
                              ₹{emp.givenSiteAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.siteAllowance?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.givenPerformanceAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.performanceAllowance?.toLocaleString()}
                              </span>
                            </td> <td className="p-2">
                              ₹{emp.givenFood?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.food?.toLocaleString()}
                              </span>
                            </td> <td className="p-2">
                              ₹{emp.givenMetroCityAllowance?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.metroCityAllowance?.toLocaleString()}
                              </span>
                            </td> <td className="p-2">
                              ₹{emp.givenStipend?.toLocaleString()}
                              <br />
                              <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                                ₹{emp.stipend?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2">
                              ₹{emp.overtimePay?.toLocaleString()}


                            </td><td className="p-2">
                              ₹{emp.reimbursement?.toLocaleString()}

                            </td><td className="p-2">
                              ₹{emp.convy?.toLocaleString()}

                            </td><td className="p-2">
                              ₹{emp.cashRiskAllowance?.toLocaleString()}

                            </td>
                            <td className="p-2">
                              ₹{emp.incentive?.toLocaleString()}

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
                            <td className="p-2">₹{emp.otherDeduction?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.uniform?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.messDeduction?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.hraDeduction?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.staffWelfareFund?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.backgroundVerification?.toLocaleString()}</td>
                            <td className="p-2">₹{emp.uniformDeduction?.toLocaleString()}</td>

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