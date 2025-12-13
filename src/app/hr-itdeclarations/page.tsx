"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, FileCheck } from "lucide-react"

type DeclarationStatus = "submitted" | "approved" | "rejected" | "locked"

const MOCK_DECLARATIONS = [
  {
    id: "1",
    empCode: "EMP001",
    empName: "Ravi Kumar",
    pan: "ABCDE1234F",
    financialYear: "2025-26",
    regime: "old",
    status: "submitted" as DeclarationStatus,

    hra: {
      rentPaid: 180000,
      landlordName: "Suresh Patil",
      landlordPan: "AAAAA9999A",
      city: "Metro",
    },

    deductions: {
      sec80c: 150000,
      sec80d: 25000,
      sec80ccd1b: 50000,
    },

    otherIncome: 12000,
    prevEmployerIncome: 300000,
    prevEmployerTds: 25000,
  },
]

export default function HrItDeclarationPage() {
  const [selected, setSelected] = useState<any | null>(null)
  const [remarks, setRemarks] = useState("")

  const isActionAllowed = selected?.status === "submitted"

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">IT Declarations</h1>
            <p className="text-muted-foreground text-sm">
              Review and approve employee tax declarations
            </p>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Declarations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Emp Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DECLARATIONS.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.empCode}</TableCell>
                    <TableCell>{d.empName}</TableCell>
                    <TableCell>{d.financialYear}</TableCell>
                    <TableCell className="uppercase">{d.regime}</TableCell>
                    <TableCell>
                      <Badge className="capitalize">{d.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelected(d)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* MODAL */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl p-0">
  {/* Header */}
  <div className="border-b px-6 py-4">
    <DialogHeader>
      <DialogTitle className="text-xl">
        IT Declaration Review
      </DialogTitle>
      <p className="text-sm text-muted-foreground">
        Verify employee declaration before approval
      </p>
    </DialogHeader>
  </div>

  {selected && (
    <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-6">
      {/* Employee Context */}
      <div className="grid md:grid-cols-5 gap-4 text-sm bg-muted/40 p-4 rounded-lg">
        <Info label="Emp Code" value={selected.empCode} />
        <Info label="Name" value={selected.empName} />
        <Info label="PAN" value={selected.pan} />
        <Info label="FY" value={selected.financialYear} />
        <Info label="Regime" value={selected.regime.toUpperCase()} />
      </div>

      {/* OLD REGIME DETAILS */}
      {selected.regime === "old" && (
        <>
          {/* HRA */}
          <Section title="HRA Details">
            <Info label="Annual Rent Paid" value={`₹ ${selected.hra.rentPaid.toLocaleString("en-IN")}`} />
            <Info label="Landlord Name" value={selected.hra.landlordName} />
            <Info label="Landlord PAN" value={selected.hra.landlordPan} />
            <Info label="City Type" value={selected.hra.city} />
          </Section>

          {/* Deductions */}
          <Section title="Chapter VI-A Deductions">
            <Info label="80C" value={`₹ ${selected.deductions.sec80c.toLocaleString("en-IN")}`} />
            <Info label="80D" value={`₹ ${selected.deductions.sec80d.toLocaleString("en-IN")}`} />
            <Info label="80CCD(1B)" value={`₹ ${selected.deductions.sec80ccd1b.toLocaleString("en-IN")}`} />
          </Section>
        </>
      )}

      {/* Other Income */}
      <Section title="Other Income / Previous Employer">
        <Info label="Other Income" value={`₹ ${selected.otherIncome.toLocaleString("en-IN")}`} />
        <Info label="Prev Employer Income" value={`₹ ${selected.prevEmployerIncome.toLocaleString("en-IN")}`} />
        <Info label="Prev Employer TDS" value={`₹ ${selected.prevEmployerTds.toLocaleString("en-IN")}`} />
      </Section>

      {/* HR Action */}
      <div className="border-t pt-4 space-y-3">
        <div>
          <Label className="text-sm">
            Remarks <span className="text-muted-foreground">(mandatory for rejection)</span>
          </Label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={!isActionAllowed}
          />
        </div>
      </div>
    </div>
  )}

  {/* Footer Actions */}
  <div className="border-t px-6 py-4 flex justify-end gap-3 bg-background">
    <Button
      disabled={!isActionAllowed}
      onClick={() => {
        selected.status = "approved"
        setSelected(null)
      }}
    >
      Approve
    </Button>

    <Button
      variant="destructive"
      disabled={!isActionAllowed || !remarks}
      onClick={() => {
        selected.status = "rejected"
        setSelected(null)
      }}
    >
      Reject
    </Button>
  </div>
</DialogContent>

        </Dialog>
      </div>
    </MainLayout>
  )
}

/* Helpers */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      <div className="grid md:grid-cols-4 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
        {children}
      </div>
    </div>
  )
}

