"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { AlertTriangle, ChevronDown, Lock } from "lucide-react"
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
        salaryStatus: "inactive",
    },
]

const monthOptions = generateMonthOptions(2024, 2026)
type EmployeeStatusFilter = "active" | "inactive" | "both"
type LeaveTrackerItem = {
    id: string
    periodFrom: string
    periodTo: string
    client: string
    site: string
    employees: number
    totalLeaveToPay: number
    locked: boolean
    paymentsGenerated: boolean
}

export default function LeaveProvisionPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [steps, setSteps] = useState(initialSteps)

    // Step 1: Context Selection
    const [selectedBranch, setSelectedBranch] = useState("branch-1")
    const [selectedClient, setSelectedClient] = useState("client-1")
    const [selectedSite, setSelectedSite] = useState("site-a")
    const [fromMonth, setFromMonth] = useState("2025-01")
    const [toMonth, setToMonth] = useState("2025-03")
    const [employeeStatusFilter, setEmployeeStatusFilter] = useState<EmployeeStatusFilter>("active")

    const getFilteredEmployees = (site = selectedSite, status = employeeStatusFilter) => {
        return mockEmployees
            .filter((emp) => {
                const statusMatch = status === "both" || emp.salaryStatus === status
                return !emp.lwwPolicy && emp.paidLeaveEligible && statusMatch && emp.site === site
            })
            .map((emp) => ({ ...emp, selected: true }))
    }

    // Step 2: Employee Selection
    const [employeeList, setEmployeeList] = useState(getFilteredEmployees)

    // Step 3: Leave Provision Calculation
    const [provisions, setProvisions] = useState<any[]>([])
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
    const [leaveTracker, setLeaveTracker] = useState<LeaveTrackerItem[]>([])

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

        setEmployeeList(getFilteredEmployees())
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

        updateStep(3, true)
        setCurrentStep(4)
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
    const handleToggleLeaveLock = (id: string) => {
        setLeaveTracker((prev) =>
            prev.map((item) => (item.id === id ? { ...item, locked: !item.locked } : item)),
        )
    }

    const handleGenerateLeavePayment = (id: string) => {
        setLeaveTracker((prev) =>
            prev.map((item) => (item.id === id ? { ...item, paymentsGenerated: true } : item)),
        )
        toast.success("Payment Generated", { description: "Tracker updated successfully" })
    }

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

                <Tabs defaultValue="process" className="space-y-6">
                    <TabsList className="grid w-full max-w-sm grid-cols-2">
                        <TabsTrigger value="process">Process</TabsTrigger>
                        <TabsTrigger value="tracker">Tracker</TabsTrigger>
                    </TabsList>

                    <TabsContent value="process" className="space-y-6">
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

                            <div className="space-y-3">
                                <label className="text-sm font-medium">Employee Status</label>
                                <RadioGroup
                                    value={employeeStatusFilter}
                                    onValueChange={(value) => setEmployeeStatusFilter(value as EmployeeStatusFilter)}
                                    className="flex flex-wrap gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="active" id="leave-status-active" />
                                        <label htmlFor="leave-status-active" className="text-sm">
                                            Active
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inactive" id="leave-status-inactive" />
                                        <label htmlFor="leave-status-inactive" className="text-sm">
                                            Inactive
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="both" id="leave-status-both" />
                                        <label htmlFor="leave-status-both" className="text-sm">
                                            Both
                                        </label>
                                    </div>
                                </RadioGroup>
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={employeeList.length > 0 && employeeList.every((emp) => emp.selected)}
                                                onCheckedChange={(checked) => {
                                                    const isChecked = checked === true
                                                    setEmployeeList(employeeList.map((emp) => ({ ...emp, selected: isChecked })))
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Emp Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Site</TableHead>
                                        <TableHead className="text-right">Fixed Gross</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employeeList.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={emp.selected}
                                                    onCheckedChange={(checked) => {
                                                        const isChecked = checked === true
                                                        setEmployeeList(
                                                            employeeList.map((e) => (e.id === emp.id ? { ...e, selected: isChecked } : e)),
                                                        )
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{emp.code}</TableCell>
                                            <TableCell>{emp.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{emp.site}</TableCell>
                                            <TableCell className="text-right">₹{emp.fixedGross.toLocaleString("en-IN")}</TableCell>
                                            <TableCell>
                                                <Badge variant={emp.salaryStatus === "active" ? "secondary" : "destructive"}>
                                                    {emp.salaryStatus}
                                                </Badge>
                                            </TableCell>
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
                                <Button
                                    onClick={() => {
                                        const trackerId = `${selectedSite}-${fromMonth}-${toMonth}`
                                        const currentClientName = mockClients.find((c) => c.id === selectedClient)?.name ?? selectedClient
                                        const currentSiteName = mockSites.find((s) => s.id === selectedSite)?.name ?? selectedSite
                                        const employeeCount = Object.keys(employeeAggregates).length
                                        setLeaveTracker((prev) => {
                                            const existing = prev.find((item) => item.id === trackerId)
                                            if (existing) {
                                                return prev.map((item) =>
                                                    item.id === trackerId
                                                        ? {
                                                              ...item,
                                                              client: currentClientName,
                                                              site: currentSiteName,
                                                              employees: employeeCount,
                                                              totalLeaveToPay: totalLeaveToPayGrand,
                                                              locked: true,
                                                              paymentsGenerated: false,
                                                          }
                                                        : item,
                                                )
                                            }
                                            return [
                                                ...prev,
                                                {
                                                    id: trackerId,
                                                    periodFrom: fromMonth,
                                                    periodTo: toMonth,
                                                    client: currentClientName,
                                                    site: currentSiteName,
                                                    employees: employeeCount,
                                                    totalLeaveToPay: totalLeaveToPayGrand,
                                                    locked: true,
                                                    paymentsGenerated: false,
                                                },
                                            ]
                                        })
                                        toast.success("Provision Locked", {
                                            description: "Period locked. Generate payments from Tracker tab.",
                                        })
                                        updateStep(4, true)
                                        setSteps(initialSteps)
                                        setCurrentStep(1)
                                    }}
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Lock & Confirm
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                    </TabsContent>

                    <TabsContent value="tracker" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Provision Tracker</CardTitle>
                                <CardDescription>Track period lock/unlock status and generate payments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Site</TableHead>
                                            <TableHead className="text-right">Employees</TableHead>
                                            <TableHead className="text-right">Leave To Pay</TableHead>
                                            <TableHead>Lock Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveTracker.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                    No tracker records yet. Complete the process tab to create entries.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leaveTracker.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        {formatMonthLabel(item.periodFrom)} to {formatMonthLabel(item.periodTo)}
                                                    </TableCell>
                                                    <TableCell>{item.client}</TableCell>
                                                    <TableCell>{item.site}</TableCell>
                                                    <TableCell className="text-right">{item.employees}</TableCell>
                                                    <TableCell className="text-right">
                                                        ₹{item.totalLeaveToPay.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.locked ? "destructive" : "secondary"}>
                                                            {item.locked ? "Locked" : "Unlocked"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.paymentsGenerated ? "default" : "outline"}>
                                                            {item.paymentsGenerated ? "Generated" : "Pending"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleToggleLeaveLock(item.id)}
                                                            >
                                                                {item.locked ? "Unlock" : "Lock"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleGenerateLeavePayment(item.id)}
                                                                disabled={!item.locked || item.paymentsGenerated}
                                                            >
                                                                Generate Payment
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}
