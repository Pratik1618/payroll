"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export default function EmployeeITDeclarationPage() {
  const [status, setStatus] = useState<"draft" | "submitted">("draft")
  const [regime, setRegime] = useState<"old" | "new">("new")

  // Form 12BB fields
  const [rentPaid, setRentPaid] = useState(0)
  const [landlordName, setLandlordName] = useState("")
  const [landlordPan, setLandlordPan] = useState("")
  const [isMetro, setIsMetro] = useState(false)

  const [sec80c, setSec80c] = useState(0)
  const [sec80d, setSec80d] = useState(0)
  const [sec80ccd1b, setSec80ccd1b] = useState(0)

  const [otherIncome, setOtherIncome] = useState(0)
  const [prevIncome, setPrevIncome] = useState(0)
  const [prevTds, setPrevTds] = useState(0)

  const [accepted, setAccepted] = useState(false)

  const isLocked = status !== "draft"

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">IT Declaration</h1>
              <p className="text-muted-foreground text-sm">
                Form 12BB – Tax declaration by employee
              </p>
            </div>
          </div>
          <Badge>{status.toUpperCase()}</Badge>
        </div>

        {/* Regime */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Regime</CardTitle>
            <CardDescription>
              New regime is default. Old regime requires declaration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={regime} onValueChange={(v) => setRegime(v as any)}>
              <TabsList>
                <TabsTrigger value="new">New Regime</TabsTrigger>
                <TabsTrigger value="old">Old Regime</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* HRA */}
        {regime === "old" && (
          <Card>
            <CardHeader>
              <CardTitle>HRA Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <InputField label="Annual Rent Paid" value={rentPaid} setValue={setRentPaid} disabled={isLocked} />
              <InputField label="Landlord Name" value={landlordName} setValue={setLandlordName} disabled={isLocked} />
              <InputField label="Landlord PAN" value={landlordPan} setValue={setLandlordPan} disabled={isLocked} />
              <div>
                <Label className="text-sm">City Type</Label>
                <Tabs
                  value={isMetro ? "metro" : "non-metro"}
                  onValueChange={(v) => setIsMetro(v === "metro")}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="metro" className="flex-1">Metro</TabsTrigger>
                    <TabsTrigger value="non-metro" className="flex-1">Non-Metro</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter VI-A Deductions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <InputField label="80C – Total Investments" value={sec80c} setValue={setSec80c} disabled={isLocked} />
            <InputField label="80D – Medical Insurance" value={sec80d} setValue={setSec80d} disabled={isLocked} />
            <InputField label="80CCD(1B) – NPS" value={sec80ccd1b} setValue={setSec80ccd1b} disabled={isLocked} />
          </CardContent>
        </Card>

        {/* Other Income */}
        <Card>
          <CardHeader>
            <CardTitle>Other Income / Previous Employer</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <InputField label="Other Income" value={otherIncome} setValue={setOtherIncome} disabled={isLocked} />
            <InputField label="Previous Employer Income" value={prevIncome} setValue={setPrevIncome} disabled={isLocked} />
            <InputField label="Previous Employer TDS" value={prevTds} setValue={setPrevTds} disabled={isLocked} />
          </CardContent>
        </Card>

        {/* Declaration */}
        <Card>
          <CardContent className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                disabled={isLocked}
              />
              <span>
                I hereby declare that the information provided above is true and
                correct and I shall be responsible for any incorrect declaration.
              </span>
            </label>

            <Button
              disabled={!accepted || isLocked}
              onClick={() => setStatus("submitted")}
            >
              Submit Declaration
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

/* Helpers */

function InputField({
  label,
  value,
  setValue,
  disabled,
}: {
  label: string
  value: number | string
  setValue: (v: any) => void
  disabled?: boolean
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
