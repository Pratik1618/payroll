"use client"

import { useState, useEffect } from "react"
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Upload, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

/* ================= MOCK DATA ================= */

// Upload file generated from payroll → uploaded on ESIC portal
const ESIC_UPLOAD_DATA = [
  { challanType: "Consolidated", month: "Nov-25", employees: 320, uploadAmount: 948003 },
  { challanType: "Vadodara", month: "Nov-25", employees: 45, uploadAmount: 122500 },
]

// Dummy challan parse (from ESIC portal)
const MOCK_ESIC_CHALLAN = {
  paidAmount: 948003,
  challanNo: "ESIC-CHLN-998877",
}

// Dummy ECR parse (employee-wise)
const MOCK_ESIC_ECR = [
  { ip: "IP10001", name: "Rahul Sharma", upload: 410, ecr: 410, days: 26 },
  { ip: "IP10002", name: "Amit Singh", upload: 390, ecr: 390, days: 26 },
  { ip: "IP10003", name: "Neha Verma", upload: 420, ecr: 400, days: 24 },
]

/* ================= COMPONENT ================= */

export default function ESICReconciliationModule() {
  const [activeTab, setActiveTab] = useState("establishment")

  /* ---------- ESTABLISHMENT STATES ---------- */
  const [selectedType, setSelectedType] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [esicData, setEsicData] = useState<any | null>(null)
  const [challanUploaded, setChallanUploaded] = useState(false)
  const [reconRow, setReconRow] = useState<any | null>(null)

  /* ---------- EMPLOYEE STATES ---------- */
  const [ecrUploaded, setEcrUploaded] = useState(false)
  const [employeeRecon, setEmployeeRecon] = useState<any[]>([])

  /* ================= AUTO FETCH UPLOAD DATA ================= */
  useEffect(() => {
    if (!selectedType || !selectedMonth) {
      setEsicData(null)
      setReconRow(null)
      setChallanUploaded(false)
      return
    }

    const data = ESIC_UPLOAD_DATA.find(
      (d) => d.challanType === selectedType && d.month === selectedMonth
    )

    setEsicData(data || null)
    setReconRow(null)
    setChallanUploaded(false)
  }, [selectedType, selectedMonth])

  /* ================= RECONCILE ================= */
  const handleReconcile = () => {
    if (!esicData || !challanUploaded) return

    setReconRow({
      challanType: esicData.challanType,
      month: esicData.month,
      employees: esicData.employees,
      uploadAmount: esicData.uploadAmount,
      paidAmount: MOCK_ESIC_CHALLAN.paidAmount,
      challanNo: MOCK_ESIC_CHALLAN.challanNo,
    })
  }

  /* ================= ECR LOAD ================= */
  useEffect(() => {
    if (ecrUploaded) {
      setEmployeeRecon(
        MOCK_ESIC_ECR.map((e) => ({
          ...e,
          diff: e.upload - e.ecr,
          status: e.upload === e.ecr ? "MATCHED" : "MISMATCH",
        }))
      )
    } else {
      setEmployeeRecon([])
    }
  }, [ecrUploaded])

  /* ================= STATUS ENGINE ================= */
  const getEstStatus = (upload: number, paid: number) => {
    if (paid === upload) return "PAID"
    if (paid > 0 && paid < upload) return "PARTIAL"
    if (paid === 0) return "NOT PAID"
    if (paid > upload) return "OVERPAID"
    return "UNKNOWN"
  }

  const getColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800"
      case "PARTIAL": return "bg-amber-100 text-amber-800"
      case "NOT PAID": return "bg-red-100 text-red-800"
      case "OVERPAID": return "bg-purple-100 text-purple-800"
      case "MATCHED": return "bg-green-100 text-green-800"
      case "MISMATCH": return "bg-red-100 text-red-800"
      default: return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="establishment">Establishment-wise</TabsTrigger>
          <TabsTrigger value="employee">Employee-wise</TabsTrigger>
        </TabsList>

        {/* ================= ESTABLISHMENT-WISE ================= */}
        <TabsContent value="establishment" className="space-y-6">

          <Card>
            <CardContent className="p-4 grid grid-cols-4 gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Challan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consolidated">Consolidated</SelectItem>
                  <SelectItem value="Vadodara">Vadodara</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nov-25">Nov-25</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                disabled={!esicData}
                onClick={() => setChallanUploaded(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload Challan
              </Button>

              <Button
                disabled={!esicData || !challanUploaded}
                onClick={handleReconcile}
              >
                Reconcile
              </Button>
            </CardContent>
          </Card>

          {esicData && (
            <Card className="bg-slate-50">
              <CardContent className="p-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Upload Amount</p>
                  <p className="font-semibold">₹{esicData.uploadAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employees</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {esicData.employees}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Challan</p>
                  <p className="font-semibold">{challanUploaded ? "Uploaded" : "Not Uploaded"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>ESIC Establishment Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challan Type</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">Upload Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Challan No</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {!reconRow && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                        Select type, month, upload challan and click Reconcile
                      </TableCell>
                    </TableRow>
                  )}

                  {reconRow && (() => {
                    const diff = reconRow.uploadAmount - reconRow.paidAmount
                    const status = getEstStatus(reconRow.uploadAmount, reconRow.paidAmount)

                    return (
                      <TableRow>
                        <TableCell>{reconRow.challanType}</TableCell>
                        <TableCell>{reconRow.month}</TableCell>
                        <TableCell className="text-right">{reconRow.employees}</TableCell>
                        <TableCell className="text-right">₹{reconRow.uploadAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{reconRow.paidAmount.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${diff === 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{diff.toLocaleString()}
                        </TableCell>
                        <TableCell>{reconRow.challanNo}</TableCell>
                        <TableCell>
                          <Badge className={getColor(status)}>{status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ================= EMPLOYEE-WISE ================= */}
        <TabsContent value="employee" className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle>Employee-wise ESIC Compliance</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-5 gap-3">
                <Input placeholder="Search IP / Name" />
                <Input placeholder="Month" />
                <Select>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="mismatch">Mismatch</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => setEcrUploaded(true)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload ECR
                </Button>

                <div className="flex items-center">
                  {ecrUploaded && (
                    <Badge className="bg-green-100 text-green-800">
                      ECR Uploaded
                    </Badge>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Upload</TableHead>
                    <TableHead className="text-right">ECR</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {!ecrUploaded && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        Upload ECR to view employee-wise ESIC compliance
                      </TableCell>
                    </TableRow>
                  )}

                  {ecrUploaded && employeeRecon.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.ip}</TableCell>
                      <TableCell>{e.name}</TableCell>
                      <TableCell className="text-right">{e.upload}</TableCell>
                      <TableCell className="text-right">{e.ecr}</TableCell>
                      <TableCell className="text-right">{e.days}</TableCell>
                      <TableCell className={`text-right ${e.diff === 0 ? "text-green-600" : "text-red-600"}`}>
                        {e.diff}
                      </TableCell>
                      <TableCell>
                        <Badge className={getColor(e.status)}>{e.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>
    </div>
  )
}
