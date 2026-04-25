"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormulaBuilder, FormulaComponent } from "./formula-builder"

interface SalaryFormProps {
  mode: "add" | "edit"
  onSubmit: (salary: SalaryStructure) => void
}

export interface SalaryStructure {
  basic: number
  hra: number
  specialAllowance: number
  conveyanceAllowance: number
  medicalAllowance: number
  pfDeduction: number
  esicDeduction: number
  professionalTax: number
  tds: number
  pfEmployer: number
  esicEmployer: number
  gratuity: number
  hraComponents?: FormulaComponent[]
  specialAllowanceComponents?: FormulaComponent[]
  conveyanceAllowanceComponents?: FormulaComponent[]
  medicalAllowanceComponents?: FormulaComponent[]
  applyESIC: boolean
}

const INITIAL_SALARY: SalaryStructure = {
  basic: 25000,
  hra: 12500,
  specialAllowance: 5000,
  conveyanceAllowance: 1000,
  medicalAllowance: 500,
  pfDeduction: 0,
  esicDeduction: 0,
  professionalTax: 0,
  tds: 0,
  pfEmployer: 0,
  esicEmployer: 0,
  gratuity: 0,
  applyESIC: true,
}

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

export function SalaryForm({ mode, onSubmit }: SalaryFormProps) {
  const [salary, setSalary] = useState<SalaryStructure>(INITIAL_SALARY)
  const [useFormulas, setUseFormulas] = useState({
    hra: false,
    specialAllowance: false,
    conveyanceAllowance: false,
    medicalAllowance: false,
  })
  const [formulaComponents, setFormulaComponents] = useState({
    hra: [] as FormulaComponent[],
    specialAllowance: [] as FormulaComponent[],
    conveyanceAllowance: [] as FormulaComponent[],
    medicalAllowance: [] as FormulaComponent[],
  })
  const [formulaPercent, setFormulaPercent] = useState({
    hra: 0,
    specialAllowance: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
  })

  const availableComponents = ["Basic", "HRA", "Special Allowance", "Conveyance", "Medical"]

  const calculateFormulaValue = (components: FormulaComponent[], percent: number, baseValues: Record<string, number>) => {
    if (components.length === 0 || percent <= 0) return 0

    return components.reduce((total, component) => {
      const key = component.name.toLowerCase()
      const baseValue = baseValues[key] ?? 0
      return total + (baseValue * percent) / 100
    }, 0)
  }

  const calculations = useMemo(() => {
    const baseValues = {
      basic: salary.basic,
      hra: salary.hra,
      "special allowance": salary.specialAllowance,
      conveyance: salary.conveyanceAllowance,
      medical: salary.medicalAllowance,
    }

    const hraAmount =
      useFormulas.hra && formulaComponents.hra.length > 0
        ? calculateFormulaValue(formulaComponents.hra, formulaPercent.hra, baseValues)
        : salary.hra

    const specialAllowanceAmount =
      useFormulas.specialAllowance && formulaComponents.specialAllowance.length > 0
        ? calculateFormulaValue(formulaComponents.specialAllowance, formulaPercent.specialAllowance, baseValues)
        : salary.specialAllowance

    const conveyanceAllowanceAmount =
      useFormulas.conveyanceAllowance && formulaComponents.conveyanceAllowance.length > 0
        ? calculateFormulaValue(formulaComponents.conveyanceAllowance, formulaPercent.conveyanceAllowance, baseValues)
        : salary.conveyanceAllowance

    const medicalAllowanceAmount =
      useFormulas.medicalAllowance && formulaComponents.medicalAllowance.length > 0
        ? calculateFormulaValue(formulaComponents.medicalAllowance, formulaPercent.medicalAllowance, baseValues)
        : salary.medicalAllowance

    const grossSalary =
      salary.basic + hraAmount + specialAllowanceAmount + conveyanceAllowanceAmount + medicalAllowanceAmount

    const pfDed = salary.basic * 0.12
    const esicApplicable = salary.applyESIC && grossSalary <= 21000
    const esicDed = esicApplicable ? grossSalary * 0.0075 : 0
    const pfEmp = salary.basic * 0.12
    const esicEmp = esicApplicable ? grossSalary * 0.0325 : 0
    const gratuityAmount = salary.basic * 0.0481
    const totalDeductions = pfDed + esicDed + salary.professionalTax + salary.tds
    const netSalary = grossSalary - totalDeductions
    const totalEmployerCost = grossSalary + pfEmp + esicEmp + gratuityAmount

    return {
      grossSalary,
      totalDeductions,
      netSalary,
      pfDed,
      esicDed,
      pfEmp,
      esicEmp,
      gratuityAmount,
      totalEmployerCost,
      hraAmount,
      specialAllowanceAmount,
      conveyanceAllowanceAmount,
      medicalAllowanceAmount,
    }
  }, [salary, useFormulas, formulaComponents, formulaPercent])

  const handleEarningChange = (
    field: "basic" | "hra" | "specialAllowance" | "conveyanceAllowance" | "medicalAllowance",
    value: number,
  ) => {
    setSalary((prev) => ({ ...prev, [field]: value }))
  }

  const handleDeductionChange = (field: "professionalTax" | "tds", value: number) => {
    setSalary((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit({
      ...salary,
      hra: calculations.hraAmount,
      specialAllowance: calculations.specialAllowanceAmount,
      conveyanceAllowance: calculations.conveyanceAllowanceAmount,
      medicalAllowance: calculations.medicalAllowanceAmount,
      pfDeduction: calculations.pfDed,
      esicDeduction: calculations.esicDed,
      pfEmployer: calculations.pfEmp,
      esicEmployer: calculations.esicEmp,
      gratuity: calculations.gratuityAmount,
      hraComponents: formulaComponents.hra,
      specialAllowanceComponents: formulaComponents.specialAllowance,
      conveyanceAllowanceComponents: formulaComponents.conveyanceAllowance,
      medicalAllowanceComponents: formulaComponents.medicalAllowance,
    })
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="employer">Employer Cont.</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Salary Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="basic" className="text-xs">
                  Basic Salary
                </Label>
                <Input
                  id="basic"
                  type="number"
                  value={salary.basic}
                  onChange={(e) => handleEarningChange("basic", parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">HRA {useFormulas.hra ? "(Formula)" : "(Fixed)"}</Label>
                  <button
                    type="button"
                    onClick={() => setUseFormulas((prev) => ({ ...prev, hra: !prev.hra }))}
                    className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                  >
                    {useFormulas.hra ? "Switch to Fixed" : "Use Formula"}
                  </button>
                </div>
                {useFormulas.hra ? (
                  <FormulaBuilder
                    availableComponents={availableComponents}
                    selectedComponents={formulaComponents.hra}
                    commonPercent={formulaPercent.hra}
                    onComponentsChange={(components) => setFormulaComponents((prev) => ({ ...prev, hra: components }))}
                    onPercentChange={(percent) => setFormulaPercent((prev) => ({ ...prev, hra: percent }))}
                    calculatedValue={calculations.hraAmount}
                  />
                ) : (
                  <Input
                    type="number"
                    value={salary.hra}
                    onChange={(e) => handleEarningChange("hra", parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Special Allowance {useFormulas.specialAllowance ? "(Formula)" : "(Fixed)"}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setUseFormulas((prev) => ({ ...prev, specialAllowance: !prev.specialAllowance }))}
                    className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                  >
                    {useFormulas.specialAllowance ? "Switch to Fixed" : "Use Formula"}
                  </button>
                </div>
                {useFormulas.specialAllowance ? (
                  <FormulaBuilder
                    availableComponents={availableComponents}
                    selectedComponents={formulaComponents.specialAllowance}
                    commonPercent={formulaPercent.specialAllowance}
                    onComponentsChange={(components) =>
                      setFormulaComponents((prev) => ({ ...prev, specialAllowance: components }))
                    }
                    onPercentChange={(percent) =>
                      setFormulaPercent((prev) => ({ ...prev, specialAllowance: percent }))
                    }
                    calculatedValue={calculations.specialAllowanceAmount}
                  />
                ) : (
                  <Input
                    type="number"
                    value={salary.specialAllowance}
                    onChange={(e) => handleEarningChange("specialAllowance", parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Conveyance {useFormulas.conveyanceAllowance ? "(Formula)" : "(Fixed)"}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setUseFormulas((prev) => ({ ...prev, conveyanceAllowance: !prev.conveyanceAllowance }))}
                    className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                  >
                    {useFormulas.conveyanceAllowance ? "Switch to Fixed" : "Use Formula"}
                  </button>
                </div>
                {useFormulas.conveyanceAllowance ? (
                  <FormulaBuilder
                    availableComponents={availableComponents}
                    selectedComponents={formulaComponents.conveyanceAllowance}
                    commonPercent={formulaPercent.conveyanceAllowance}
                    onComponentsChange={(components) =>
                      setFormulaComponents((prev) => ({ ...prev, conveyanceAllowance: components }))
                    }
                    onPercentChange={(percent) =>
                      setFormulaPercent((prev) => ({ ...prev, conveyanceAllowance: percent }))
                    }
                    calculatedValue={calculations.conveyanceAllowanceAmount}
                  />
                ) : (
                  <Input
                    type="number"
                    value={salary.conveyanceAllowance}
                    onChange={(e) => handleEarningChange("conveyanceAllowance", parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Medical {useFormulas.medicalAllowance ? "(Formula)" : "(Fixed)"}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setUseFormulas((prev) => ({ ...prev, medicalAllowance: !prev.medicalAllowance }))}
                    className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                  >
                    {useFormulas.medicalAllowance ? "Switch to Fixed" : "Use Formula"}
                  </button>
                </div>
                {useFormulas.medicalAllowance ? (
                  <FormulaBuilder
                    availableComponents={availableComponents}
                    selectedComponents={formulaComponents.medicalAllowance}
                    commonPercent={formulaPercent.medicalAllowance}
                    onComponentsChange={(components) =>
                      setFormulaComponents((prev) => ({ ...prev, medicalAllowance: components }))
                    }
                    onPercentChange={(percent) =>
                      setFormulaPercent((prev) => ({ ...prev, medicalAllowance: percent }))
                    }
                    calculatedValue={calculations.medicalAllowanceAmount}
                  />
                ) : (
                  <Input
                    type="number"
                    value={salary.medicalAllowance}
                    onChange={(e) => handleEarningChange("medicalAllowance", parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>

              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-900">
                Gross Salary: {formatCurrency(calculations.grossSalary)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deductions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded bg-muted/50 p-2">
                  <Label className="text-xs font-medium">Apply ESIC (Gross &lt;= 21,000)</Label>
                  <Switch
                    checked={salary.applyESIC}
                    onCheckedChange={(checked) => setSalary((prev) => ({ ...prev, applyESIC: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">PF Deduction (12% of Basic)</Label>
                  <div className="mt-1 rounded bg-gray-100 p-2 text-sm font-semibold">{formatCurrency(calculations.pfDed)}</div>
                </div>
                <div>
                  <Label className="text-xs">
                    ESIC Deduction {salary.applyESIC ? "(0.75% of Gross)" : "(Not Applicable)"}
                  </Label>
                  <div className="mt-1 rounded bg-gray-100 p-2 text-sm font-semibold">
                    {formatCurrency(calculations.esicDed)}
                  </div>
                </div>
                <div>
                  <Label htmlFor="prof-tax" className="text-xs">
                    Professional Tax
                  </Label>
                  <Input
                    id="prof-tax"
                    type="number"
                    value={salary.professionalTax}
                    onChange={(e) => handleDeductionChange("professionalTax", parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tds" className="text-xs">
                    TDS (if applicable)
                  </Label>
                  <Input
                    id="tds"
                    type="number"
                    value={salary.tds}
                    onChange={(e) => handleDeductionChange("tds", parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                <p className="font-semibold">Total Deductions: {formatCurrency(calculations.totalDeductions)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employer Contributions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">PF (12% of Basic)</Label>
                  <div className="mt-1 rounded bg-gray-100 p-2 text-sm font-semibold">{formatCurrency(calculations.pfEmp)}</div>
                </div>
                <div>
                  <Label className="text-xs">ESIC {salary.applyESIC ? "(3.25% of Gross)" : "(N/A)"}</Label>
                  <div className="mt-1 rounded bg-gray-100 p-2 text-sm font-semibold">{formatCurrency(calculations.esicEmp)}</div>
                </div>
                <div>
                  <Label className="text-xs">Gratuity (4.81% of Basic)</Label>
                  <div className="mt-1 rounded bg-gray-100 p-2 text-sm font-semibold">
                    {formatCurrency(calculations.gratuityAmount)}
                  </div>
                </div>
              </div>

              <div className="rounded border border-green-200 bg-green-50 p-3 text-xs text-green-900">
                <p className="font-semibold">Total Employer Cost: {formatCurrency(calculations.totalEmployerCost)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Salary Summary (Read-only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded bg-blue-50 p-3">
                  <p className="text-xs text-muted-foreground">Gross Salary</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(calculations.grossSalary)}</p>
                </div>
                <div className="rounded bg-red-50 p-3">
                  <p className="text-xs text-muted-foreground">Total Deductions</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(calculations.totalDeductions)}</p>
                </div>
                <div className="col-span-2 rounded bg-green-50 p-3">
                  <p className="text-xs text-muted-foreground">Net Salary (Take-home)</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(calculations.netSalary)}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3 rounded border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <div className="text-xs text-amber-900">
                  <p className="mb-1 font-semibold">Employer Cost Breakdown:</p>
                  <p>
                    PF: {formatCurrency(calculations.pfEmp)} + ESIC: {formatCurrency(calculations.esicEmp)} + Gratuity:{" "}
                    {formatCurrency(calculations.gratuityAmount)}
                  </p>
                  <p className="mt-2 font-semibold">
                    Total Cost to Company: {formatCurrency(calculations.totalEmployerCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
          {mode === "add" ? "Add Salary" : "Update Salary"}
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  )
}
