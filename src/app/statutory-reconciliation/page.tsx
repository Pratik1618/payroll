"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Lock, Upload } from "lucide-react"
import { toast } from "sonner"

/* ---------------- TYPES ---------------- */

type Statutory = "PF" | "ESIC"

interface PayrollLiability {
  employees: number
  employeeContribution: number
  employerContribution: number
  adminCharges?: number
  total: number
}

interface ReconRecord {
  id: string
  statutory: Statutory
  month: string
  site: string
  employees: number

  payrollAmount: number

  challanNo: string
  trrn: string
  challanAmount: number
  challanDate: string
  dueDate: string

  paidAmount: number
  paidDate?: string
  utr?: string

  status: string
  locked: boolean
}

/* ---------------- MOCK PAYROLL DATA ---------------- */

const PAYROLL_LIABILITY: Record<Statutory, PayrollLiability> = {
  PF: {
    employees: 120,
    employeeContribution: 140000,
    employerContribution: 140000,
    adminCharges: 5000,
    total: 285000,
  },
  ESIC: {
    employees: 120,
    employeeContribution: 75000,
    employerContribution: 225000,
    total: 300000,
  },
}

/* ---------------- HELPERS ---------------- */

function deriveStatus(
  payroll: number,
  challan: number,
  paid: number,
  dueDate: string,
  paidDate?: string,
) {
  if (!paidDate) return "Unpaid"
  if (paid < challan) return "Short Paid"
  if (paid > challan) return "Excess Paid"

  const delay =
    new Date(paidDate).getTime() - new Date(dueDate).getTime()

  return delay <= 0 ? "Paid (On Time)" : "Paid (Late)"
}

/* ---------------- PAGE ---------------- */

export default function PFESICReconciliationPage() {
  const [statutory, setStatutory] = useState<Statutory>("PF")
  const [month, setMonth] = useState("")
  const [site, setSite] = useState("All Sites")

  // Challan
  const [challanNo, setChallanNo] = useState("")
  const [trrn, setTrrn] = useState("")
  const [challanAmount, setChallanAmount] = useState("")
  const [challanDate, setChallanDate] = useState("")
  const [dueDate, setDueDate] = useState("")

  // Payment
  const [paidAmount, setPaidAmount] = useState("")
  const [paidDate, setPaidDate] = useState("")
  const [utr, setUtr] = useState("")

  // Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const [records, setRecords] = useState<ReconRecord[]>([])

  const liability = PAYROLL_LIABILITY[statutory]

  /* -------- Upload Handler (Frontend Truth) -------- */
  const handleUpload = (file: File) => {
    setUploadedFile(file)

    // Simulated extraction (real parsing is backend)
    setChallanNo("AUTO-CH-" + Date.now())
    setTrrn("TRRN-" + Math.floor(Math.random() * 1000000))
    setChallanAmount(String(liability.total))
    setChallanDate(new Date().toISOString().substring(0, 10))

    toast.success("Challan file uploaded & data extracted")
  }

  /* -------- Reconcile -------- */
  const handleReconcile = () => {
    if (!month || !challanNo || !trrn || !challanAmount || !dueDate) {
      toast.error("Challan & TRRN details are mandatory")
      return
    }

    const challanAmt = Number(challanAmount)
    const paidAmt = Number(paidAmount || 0)

    const status = deriveStatus(
      liability.total,
      challanAmt,
      paidAmt,
      dueDate,
      paidDate,
    )

    const record: ReconRecord = {
      id: crypto.randomUUID(),
      statutory,
      month,
      site,
      employees: liability.employees,
      payrollAmount: liability.total,
      challanNo,
      trrn,
      challanAmount: challanAmt,
      challanDate,
      dueDate,
      paidAmount: paidAmt,
      paidDate,
      utr,
      status,
      locked: false,
    }

    setRecords([...records, record])
    toast.success("Reconciliation record created")
  }

  const lockRecord = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, locked: true } : r))
    toast.success("Record locked for audit")
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-3xl font-bold">PF & ESIC Reconciliation</h1>
          <p className="text-muted-foreground">
            Payroll → Challan/TRRN → Payment → Audit Register
          </p>
        </div>

        {/* CONTEXT */}
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <Select value={statutory} onValueChange={(v) => setStatutory(v as Statutory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">PF</SelectItem>
                <SelectItem value="ESIC">ESIC</SelectItem>
              </SelectContent>
            </Select>

            <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
            <Input value={site} onChange={e => setSite(e.target.value)} />
          </CardContent>
        </Card>

        {/* PAYROLL SNAPSHOT */}
        {month && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll Liability (Read-Only)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4">
              <div>Employees: <b>{liability.employees}</b></div>
              <div>Employee: ₹{liability.employeeContribution.toLocaleString()}</div>
              <div>Employer: ₹{liability.employerContribution.toLocaleString()}</div>
              <div className="font-bold text-primary">
                Total: ₹{liability.total.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CHALLAN */}
        <Card>
          <CardHeader>
            <CardTitle>Challan / TRRN</CardTitle>
            <CardDescription>
              Upload EPFO / ESIC challan OR enter manually
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <Input
              type="file"
              onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
            />
            {uploadedFile && (
              <Badge variant="outline">
                <Upload className="h-3 w-3 mr-1" /> {uploadedFile.name}
              </Badge>
            )}

            <Input placeholder="Challan No" value={challanNo} onChange={e => setChallanNo(e.target.value)} />
            <Input placeholder="TRRN" value={trrn} onChange={e => setTrrn(e.target.value)} />
            <Input placeholder="Challan Amount" type="number" value={challanAmount} onChange={e => setChallanAmount(e.target.value)} />
            <Input type="date" value={challanDate} onChange={e => setChallanDate(e.target.value)} />
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </CardContent>
        </Card>

        {/* PAYMENT */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <Input placeholder="Paid Amount" type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
            <Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} />
            <Input placeholder="UTR / Bank Ref" value={utr} onChange={e => setUtr(e.target.value)} />
            <Button onClick={handleReconcile} className="col-span-3">
              Reconcile
            </Button>
          </CardContent>
        </Card>

        {/* REGISTER */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Register</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Statutory</TableHead>
                  <TableHead>Challan</TableHead>
                  <TableHead>TRRN</TableHead>
                  <TableHead>Payroll</TableHead>
                  <TableHead>Challan</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id} className={r.locked ? "bg-muted" : ""}>
                    <TableCell>{r.month}</TableCell>
                    <TableCell>{r.statutory}</TableCell>
                    <TableCell>{r.challanNo}</TableCell>
                    <TableCell>{r.trrn}</TableCell>
                    <TableCell>₹{r.payrollAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{r.challanAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{r.paidAmount.toLocaleString()}</TableCell>
                    <TableCell><Badge>{r.status}</Badge></TableCell>
                    <TableCell>
                      {!r.locked && (
                        <Button size="sm" variant="outline" onClick={() => lockRecord(r.id)}>
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
