"use client"

import { useMemo, useState } from "react"
import { calculateTax } from "@/utils/tax-engine/calculator"
import type { Regime, AgeCategory } from "@/utils/tax-engine/types"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, Calculator } from "lucide-react"
import { MainLayout } from "@/components/ui/layout/main-layout"

export default function TaxCalculatorPage() {
  /* ---------------- State ---------------- */
  const [regime, setRegime] = useState<Regime>("new")
  const [age, setAge] = useState<AgeCategory>("normal")

  const [basic, setBasic] = useState(0)
  const [hra, setHra] = useState(0)
  const [special, setSpecial] = useState(0)
  const [conveyance, setConveyance] = useState(0)
  const [other, setOther] = useState(0)

  const [pf, setPf] = useState(0)
  const [other80c, setOther80c] = useState(0)
  const [sec80d, setSec80d] = useState(0)

  const [rent, setRent] = useState(0)
  const [isMetro, setIsMetro] = useState(false)

  const [otherIncome, setOtherIncome] = useState(0)
  const [prevIncome, setPrevIncome] = useState(0)
  const [prevTds, setPrevTds] = useState(0)

  const [calculated, setCalculated] = useState(false)

  /* ---------------- Calculation ---------------- */
  const result = useMemo(() => {
    if (!calculated) return null

    return calculateTax({
      salary: { basic, hra, special, conveyance, other },
      deductions: { pf, other80c, sec80d },
      hra: regime === "old" ? { rentPaid: rent, isMetro } : undefined,
      otherIncome: { interest: otherIncome },
      professionalTax: 2400,
      previousEmployment: { income: prevIncome, tds: prevTds },
      ageCategory: age,
      regime,
    })
  }, [
    calculated,
    basic,
    hra,
    special,
    conveyance,
    other,
    pf,
    other80c,
    sec80d,
    rent,
    isMetro,
    otherIncome,
    prevIncome,
    prevTds,
    age,
    regime,
  ])

  /* ---------------- UI ---------------- */
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Income Tax Calculator</h1>
              <p className="text-muted-foreground text-sm">
                Live payroll tax & monthly TDS calculation
              </p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">India Payroll</Badge>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN – INPUTS */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Tax Regime</Label>
                  <Tabs value={regime} onValueChange={(v) => setRegime(v as Regime)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="old" className="flex-1">Old</TabsTrigger>
                      <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label>Age Category</Label>
                  <Tabs value={age} onValueChange={(v) => setAge(v as AgeCategory)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="normal" className="flex-1">&lt; 60</TabsTrigger>
                      <TabsTrigger value="senior" className="flex-1">60–79</TabsTrigger>
                      <TabsTrigger value="super_senior" className="flex-1">80+</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle>Annual Salary Structure</CardTitle>
                <CardDescription>As per payroll</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <InputWithLabel label="Basic" value={basic} setValue={setBasic} />
                <InputWithLabel label="HRA" value={hra} setValue={setHra} />
                <InputWithLabel label="Special Allowance" value={special} setValue={setSpecial} />
                <InputWithLabel label="Conveyance" value={conveyance} setValue={setConveyance} />
                <InputWithLabel label="Other Allowances" value={other} setValue={setOther} />
              </CardContent>
            </Card>

            {/* Declarations */}
            {regime === "old" && (
              <Card>
                <CardHeader>
                  <CardTitle>Declarations (Old Regime)</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <InputWithLabel label="Employee PF (80C)" value={pf} setValue={setPf} />
                  <InputWithLabel label="Other 80C Investments" value={other80c} setValue={setOther80c} />
                  <InputWithLabel label="80D – Medical Insurance" value={sec80d} setValue={setSec80d} />
                  <InputWithLabel label="Annual Rent Paid" value={rent} setValue={setRent} />
                </CardContent>
              </Card>
            )}

            {/* Other Income */}
            <Card>
              <CardHeader>
                <CardTitle>Other Income / Previous Employer</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <InputWithLabel label="Other Income (Interest)" value={otherIncome} setValue={setOtherIncome} />
                <InputWithLabel label="Previous Employer Income" value={prevIncome} setValue={setPrevIncome} />
                <InputWithLabel label="Previous Employer TDS" value={prevTds} setValue={setPrevTds} />
              </CardContent>
            </Card>

            <Button className="w-full h-11" onClick={() => setCalculated(true)}>
              Calculate Tax
            </Button>
          </div>

          {/* RIGHT COLUMN – RESULT */}
          <div className="lg:col-span-1">
            {result ? (
              <Card className="border-l-4 border-l-green-600 sticky top-20">
                <CardHeader>
                  <CardTitle>Tax Summary</CardTitle>
                  <CardDescription>Annual & monthly impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ResultRow label="Taxable Income" value={result.taxableIncome} />
                  <ResultRow label="Income Tax" value={result.incomeTax} />
                  <ResultRow label="Surcharge" value={result.surcharge} />
                  <ResultRow label="Cess (4%)" value={result.cess} />
                  <ResultRow label="Total Annual Tax" value={result.totalTax} bold />
                  <ResultRow label="Monthly TDS" value={result.monthlyTds} bold highlight />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-sm text-muted-foreground text-center py-10">
                  Fill details and click <b>Calculate Tax</b> to view summary
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

/* ---------------- Helpers ---------------- */

function InputWithLabel({
  label,
  value,
  setValue,
}: {
  label: string
  value: number
  setValue: (v: number) => void
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  )
}

function ResultRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: number
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>

      <span
        className={`flex items-center gap-1 ${
          bold ? "font-semibold" : ""
        } ${highlight ? "text-green-600 text-lg" : ""}`}
      >
        <IndianRupee className="h-4 w-4" />
        <span>{value.toLocaleString("en-IN")}</span>
      </span>
    </div>
  )
}

