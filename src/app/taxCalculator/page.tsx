"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, IndianRupee } from "lucide-react"
import { MainLayout } from "@/components/ui/layout/main-layout" 
import { toast } from "sonner"

type Regime = "old" | "new"
type Mode = "monthly" | "annual"

type Employee = {
  id: string
  code: string
  name: string
  pan?: string
  department?: string
  site?: string
  joiningDate?: string
  monthlyBasic: number
  monthlyHra: number
  monthlySpecial: number
  monthlyConveyance: number
  monthlyOther: number
  employeePFMonthly?: number
}

const toNumber = (v: string | number) => {
  if (typeof v === "number") return v
  const n = Number.parseFloat(v || "0")
  return isNaN(n) ? 0 : n
}

function calculateOldRegimeTax(taxableIncome: number): number {
  let tax = 0
  if (taxableIncome <= 250000) {
    tax = 0
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05
  } else if (taxableIncome <= 1000000) {
    tax = 250000 * 0.05 + (taxableIncome - 500000) * 0.2
  } else {
    tax = 250000 * 0.05 + 500000 * 0.2 + (taxableIncome - 1000000) * 0.3
  }
  tax = tax + tax * 0.04
  if (taxableIncome <= 500000) {
    return 0
  }
  return Math.round(tax)
}

function calculateNewRegimeTax(taxableIncome: number): number {
  let tax = 0
  if (taxableIncome <= 300000) {
    tax = 0
  } else if (taxableIncome <= 600000) {
    tax = (taxableIncome - 300000) * 0.05
  } else if (taxableIncome <= 900000) {
    tax = 300000 * 0.05 + (taxableIncome - 600000) * 0.1
  } else if (taxableIncome <= 1200000) {
    tax = 300000 * 0.05 + 300000 * 0.1 + (taxableIncome - 900000) * 0.15
  } else if (taxableIncome <= 1500000) {
    tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + (taxableIncome - 1200000) * 0.2
  } else {
    tax = 300000 * 0.05 + 300000 * 0.1 + 300000 * 0.15 + 300000 * 0.2 + (taxableIncome - 1500000) * 0.3
  }
  tax = tax + tax * 0.04
  if (taxableIncome <= 700000) {
    return 0
  }
  return Math.round(tax)
}

export default function TaxCalculatorPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [mode, setMode] = useState<Mode>("monthly")
  const [regime, setRegime] = useState<Regime>("new")
  const [payrollData, setPayrollData] = useState<any[]>([])

  const [basic, setBasic] = useState<string>("")
  const [hra, setHra] = useState<string>("")
  const [special, setSpecial] = useState<string>("")
  const [conveyance, setConveyance] = useState<string>("")
  const [other, setOther] = useState<string>("")

  const [pfEmployee, setPfEmployee] = useState<string>("")
  const [sec80cOther, setSec80cOther] = useState<string>("")
  const [sec80d, setSec80d] = useState<string>("")
  const [rentPaid, setRentPaid] = useState<string>("")
  const [metroFlag, setMetroFlag] = useState<"metro" | "non-metro">("non-metro")

  const [calculated, setCalculated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("finalSalaryData")
    if (stored) {
      try {
        setPayrollData(JSON.parse(stored))
      } catch {
        setPayrollData([])
      }
    }
  }, [])

  const employees: Employee[] = useMemo(
    () =>
      payrollData.map((emp: any) => ({
        id: emp.EMPCODE || emp.EMPNAME,
        code: emp.EMPCODE || "-",
        name: emp.EMPNAME || "Employee",
        pan: emp.PAN || "-",
        department: emp.DESIGNATIONNAME || "",
        site: emp.SITENAME || "",
        joiningDate: emp.JOININGDATE || "",
        monthlyBasic: emp.calculatedSalary?.basic || 0,
        monthlyHra: emp.calculatedSalary?.hra || 0,
        monthlySpecial: emp.calculatedSalary?.splAllowance || 0,
        monthlyConveyance: emp.calculatedSalary?.conveyance || 0,
        monthlyOther:
          (emp.calculatedSalary?.otherAllowance || 0) +
          (emp.calculatedSalary?.medical || 0) +
          (emp.calculatedSalary?.bonus || 0),
        employeePFMonthly: emp.finalPF || 0,
      })),
    [payrollData],
  )

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [selectedEmployeeId, employees],
  )

  const loadEmployeeData = () => {
    if (!selectedEmployee) return
    setMode("monthly")
    setBasic(String(selectedEmployee.monthlyBasic || 0))
    setHra(String(selectedEmployee.monthlyHra || 0))
    setSpecial(String(selectedEmployee.monthlySpecial || 0))
    setConveyance(String(selectedEmployee.monthlyConveyance || 0))
    setOther(String(selectedEmployee.monthlyOther || 0))
    setPfEmployee(String(selectedEmployee.employeePFMonthly || 0))
    setSec80cOther("")
    setSec80d("")
    setRentPaid("")
    setCalculated(false)
    toast.success("Employee data loaded successfully")
  }

  const result = useMemo(() => {
    const factor = mode === "monthly" ? 12 : 1

    const annualBasic = toNumber(basic) * factor
    const annualHra = toNumber(hra) * factor
    const annualSpecial = toNumber(special) * factor
    const annualConv = toNumber(conveyance) * factor
    const annualOther = toNumber(other) * factor

    const annualGross = annualBasic + annualHra + annualSpecial + annualConv + annualOther
    const standardDeduction = 50000

    let hraExemption = 0
    if (annualHra > 0 && toNumber(rentPaid) > 0) {
      const rentAnnual = toNumber(rentPaid) * factor
      const basic10 = annualBasic * 0.1
      const excessRent = Math.max(rentAnnual - basic10, 0)
      const percOfBasic = annualBasic * (metroFlag === "metro" ? 0.5 : 0.4)
      hraExemption = Math.min(annualHra, excessRent, percOfBasic)
    }

    const pfAnnual = toNumber(pfEmployee) * factor
    const other80cAnnual = toNumber(sec80cOther) * factor
    let total80C = pfAnnual + other80cAnnual
    if (total80C > 150000) total80C = 150000

    let total80D = toNumber(sec80d) * factor
    if (total80D > 100000) total80D = 100000

    let oldTaxable = annualGross - standardDeduction - hraExemption - total80C - total80D
    if (oldTaxable < 0) oldTaxable = 0
    const oldTax = calculateOldRegimeTax(oldTaxable)

    let newTaxable = annualGross - standardDeduction
    if (newTaxable < 0) newTaxable = 0
    const newTax = calculateNewRegimeTax(newTaxable)

    const oldMonthlyTds = Math.round(oldTax / 12)
    const newMonthlyTds = Math.round(newTax / 12)

    let recommended: Regime | null = null
    if (oldTax === 0 && newTax === 0) {
      recommended = null
    } else if (oldTax <= newTax) {
      recommended = "old"
    } else {
      recommended = "new"
    }

    return {
      annualGross,
      oldTaxable,
      newTaxable,
      oldTax,
      newTax,
      oldMonthlyTds,
      newMonthlyTds,
      recommended,
    }
  }, [basic, hra, special, conveyance, other, pfEmployee, sec80cOther, sec80d, rentPaid, metroFlag, mode])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(isNaN(n) ? 0 : n)

  const handleCalculate = () => {
    setCalculated(true)
    toast.success("Tax calculated successfully")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Income Tax Calculator</h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Estimate taxable income & monthly TDS for employees – FY 2025–26
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">India Payroll</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Choose Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder={employees.length ? "Select employee..." : "No payroll data found"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  disabled={!selectedEmployee}
                  onClick={loadEmployeeData}
                  className="w-full bg-transparent"
                >
                  Load Salary Data
                </Button>

                {selectedEmployee && (
                  <div className="space-y-2 bg-accent/50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PAN:</span>
                      <span className="font-medium">{selectedEmployee.pan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Site:</span>
                      <span className="font-medium">{selectedEmployee.site}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joining:</span>
                      <span className="font-medium">
                        {selectedEmployee.joiningDate
                          ? new Date(selectedEmployee.joiningDate).toLocaleDateString("en-IN")
                          : "-"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tax Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tax Regime</Label>
                  <Tabs value={regime} onValueChange={(v) => setRegime(v as Regime)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="old" className="flex-1">
                        Old Regime
                      </TabsTrigger>
                      <TabsTrigger value="new" className="flex-1">
                        New Regime
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Calculation Mode</Label>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="monthly" className="flex-1">
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger value="annual" className="flex-1">
                        Annual
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Salary Components */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Salary Components</CardTitle>
                <CardDescription>{mode === "monthly" ? "Monthly" : "Annual"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Basic</Label>
                  <Input value={basic} onChange={(e) => setBasic(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">HRA</Label>
                  <Input value={hra} onChange={(e) => setHra(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">Special Allowance</Label>
                  <Input value={special} onChange={(e) => setSpecial(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">Conveyance</Label>
                  <Input value={conveyance} onChange={(e) => setConveyance(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">Other Allowances</Label>
                  <Input value={other} onChange={(e) => setOther(e.target.value)} placeholder="0" />
                </div>
                <div className="border-t pt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Gross</span>
                  <span className="font-semibold">{formatCurrency(result.annualGross)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deductions (Old Regime)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Employee PF (80C)</Label>
                  <Input value={pfEmployee} onChange={(e) => setPfEmployee(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">Other 80C Investments</Label>
                  <Input value={sec80cOther} onChange={(e) => setSec80cOther(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">80D – Medical Insurance</Label>
                  <Input value={sec80d} onChange={(e) => setSec80d(e.target.value)} placeholder="0" />
                </div>
              </CardContent>
            </Card>

            {/* HRA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HRA Exemption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm">Monthly Rent Paid (if any)</Label>
                  <Input value={rentPaid} onChange={(e) => setRentPaid(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">City Type</Label>
                  <Tabs value={metroFlag} onValueChange={(v) => setMetroFlag(v as "metro" | "non-metro")}>
                    <TabsList className="w-full">
                      <TabsTrigger value="metro" className="flex-1">
                        Metro
                      </TabsTrigger>
                      <TabsTrigger value="non-metro" className="flex-1">
                        Non-Metro
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleCalculate} disabled={!selectedEmployee} className="w-full h-11">
              Calculate Tax
            </Button>
          </div>

          {/* Right Column - Results */}
          {calculated && (
            <div className="lg:col-span-2 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Old Regime */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Old Regime</CardTitle>
                      {result.recommended === "old" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxable Income</span>
                        <span className="font-semibold">{formatCurrency(result.oldTaxable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Tax</span>
                        <span className="font-semibold">{formatCurrency(result.oldTax)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total Tax (with 4% cess)</span>
                        <span className="font-bold text-lg text-blue-600">{formatCurrency(result.oldTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm bg-accent/50 p-2 rounded">
                        <span className="text-muted-foreground">Monthly TDS</span>
                        <span className="font-semibold">{formatCurrency(result.oldMonthlyTds)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* New Regime */}
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">New Regime</CardTitle>
                      {result.recommended === "new" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxable Income</span>
                        <span className="font-semibold">{formatCurrency(result.newTaxable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Tax</span>
                        <span className="font-semibold">{formatCurrency(result.newTax)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total Tax (with 4% cess)</span>
                        <span className="font-bold text-lg text-amber-600">{formatCurrency(result.newTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm bg-accent/50 p-2 rounded">
                        <span className="text-muted-foreground">Monthly TDS</span>
                        <span className="font-semibold">{formatCurrency(result.newMonthlyTds)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Note:</span> This is an estimation only. Final TDS will be as per the
                  Income Tax Act and company policy. Please consult your HR or tax advisor for accurate calculations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
