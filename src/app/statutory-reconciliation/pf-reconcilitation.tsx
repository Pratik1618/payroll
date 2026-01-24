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
import { ClientsDropdown } from "@/components/ui/clients-dropdown"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Upload, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MainLayout } from "@/components/ui/layout/main-layout"

/* ================= MOCK DATA ================= */

const PF_UPLOAD_DATA = [
  { clientId: "C1", clientName: "ABC Ltd", month: "Jan-26", employees: 120, pfAmount: 425000 },
  { clientId: "C2", clientName: "XYZ Pvt Ltd", month: "Jan-26", employees: 86, pfAmount: 210000 },
]

// Dummy TRRN parse result
const MOCK_TRRN_CASES = {
  PAID: { totalPaid: 635000 },      // exact match
  PARTIAL: { totalPaid: 425000 },   // less than PF
  OVERPAID: { totalPaid: 700000 },  // more than PF
}


/* ================= COMPONENT ================= */

export default function PFReconciliationModule() {
  const [activeTab, setActiveTab] = useState("client")
  const [mockCase, setMockCase] = useState<"PAID" | "PARTIAL" | "OVERPAID">("PARTIAL")

  /* ---------- CLIENT STATES ---------- */
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [pfData, setPfData] = useState<any[]>([])
  const [trrnUploaded, setTrrnUploaded] = useState(false)
  const [reconRows, setReconRows] = useState<any[]>([])

  /* ---------- EMPLOYEE STATES ---------- */
  const [ecrUploaded, setEcrUploaded] = useState(false)
  const [employeeRecon, setEmployeeRecon] = useState<any[]>([])

  /* ================= CLIENT AUTO FETCH ================= */
  useEffect(() => {
    if (selectedClients.length === 0 || !selectedMonth) {
      setPfData([])
      setReconRows([])
      setTrrnUploaded(false)
      return
    }

    const data = PF_UPLOAD_DATA.filter(
      (d) => selectedClients.includes(d.clientId) && d.month === selectedMonth
    )

    setPfData(data)
    setReconRows([])
    setTrrnUploaded(false)
  }, [selectedClients, selectedMonth])

  /* ================= CLIENT RECONCILE ================= */
  const handleReconcile = () => {
    if (pfData.length === 0 || !trrnUploaded) return

    const paidAmount = MOCK_TRRN_CASES[mockCase].totalPaid

    const totalPF = pfData.reduce((sum, c) => sum + c.pfAmount, 0)
    const totalEmployees = pfData.reduce((sum, c) => sum + c.employees, 0)
    const clientNames = pfData.map(c => c.clientName).join(", ")

    const newReconRows = [
      {
        clientName: clientNames,
        month: selectedMonth,
        employees: totalEmployees,
        pfAmount: totalPF,
        paidAmount: paidAmount,
      }
    ]

    setReconRows(newReconRows)
  }



  /* ================= EMPLOYEE AUTO LOAD (DUMMY) ================= */
  useEffect(() => {
    if (ecrUploaded) {
      setEmployeeRecon([
        {
          uan: "100200300400",
          name: "John Doe",
          ecrEPF: 1800,
          ecrEPS: 1250,
          ncp: 0,
          status: "MATCHED",
        },
        {
          uan: "200300400500",
          name: "Asha Devi",
          ecrEPF: 2160,
          ecrEPS: 1250,
          ncp: 1,
          status: "MATCHED",
        },
        {
          uan: "300400500600",
          name: "Ravi Kumar",
          ecrEPF: 1500,
          ecrEPS: 1000,
          ncp: 2,
          status: "MISMATCH",
        },
      ])
    } else {
      setEmployeeRecon([])
    }
  }, [ecrUploaded])

  /* ================= STATUS ENGINE ================= */
  const getStatus = (pf: number, paid: number) => {
    if (paid === pf) return "PAID"
    if (paid > 0 && paid < pf) return "PARTIAL"
    if (paid === 0) return "NOT PAID"
    if (paid > pf) return "OVERPAID"
    return "UNKNOWN"
  }

  const getStatusColor = (status: string) => {
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

  const clientOptions = PF_UPLOAD_DATA.map(client => ({
    id: client.clientId,
    name: client.clientName,
    employees: client.employees
  }))

  return (



    <div className=" space-y-6">


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="client">Client-wise</TabsTrigger>
          <TabsTrigger value="employee">Employee-wise</TabsTrigger>
        </TabsList>

        {/* ================= CLIENT-WISE TAB ================= */}
        <TabsContent value="client" className="space-y-6">

          <Card>
            <CardContent className="p-4 grid grid-cols-4 gap-4">
              <ClientsDropdown
                clients={clientOptions}
                selectedClients={selectedClients}
                setSelectedClients={setSelectedClients}
                placeholder="Select Clients"
                className="w-48"
              />

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jan-26">Jan-26</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                disabled={pfData.length === 0}
                onClick={() => setTrrnUploaded(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload TRRN
              </Button>

              <Button
                disabled={pfData.length === 0 || !trrnUploaded}
                onClick={handleReconcile}
              >
                Reconcile
              </Button>
            </CardContent>
          </Card>

          {pfData.length > 0 && (
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {pfData.map((client, index) => (
                    <div key={client.clientId} className="space-y-2">
                      <h4 className="font-medium">{client.clientName}</h4>
                      <div className="space-y-1">
                        <div>
                          <p className="text-muted-foreground">PF Amount</p>
                          <p className="font-semibold">₹{client.pfAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Employees</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {client.employees}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                  {/* ===== Unified TRRN Card (COMMON) ===== */}
                  {pfData.length > 0 && (
                    <Card className="border-dashed bg-white">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Unified TRRN (Single Challan for all clients)</p>
                          <p className="font-semibold">
                            {trrnUploaded ? "TRRN Uploaded" : "TRRN Not Uploaded"}
                          </p>
                        </div>

                        <Badge className={trrnUploaded ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}>
                          {trrnUploaded ? "UPLOADED" : "PENDING"}
                        </Badge>
                      </CardContent>
                    </Card>
                  )}

                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Client-wise Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">PF Amount</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {reconRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        Select clients, month, upload TRRN and click Reconcile
                      </TableCell>
                    </TableRow>
                  )}

                  {reconRows.map((row, index) => {
                    const diff = row.pfAmount - row.paidAmount
                    const status = getStatus(row.pfAmount, row.paidAmount)

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <span title={row.clientName}>
                            {row.clientName.length > 30
                              ? row.clientName.slice(0, 30) + "..."
                              : row.clientName}
                          </span>
                        </TableCell>

                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right">{row.employees}</TableCell>
                        <TableCell className="text-right">₹{row.pfAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{row.paidAmount.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${diff === 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{diff.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ================= EMPLOYEE-WISE TAB ================= */}
        <TabsContent value="employee" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee-wise PF Compliance</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Filters + Upload */}
              <div className="grid grid-cols-5 gap-3">
                <Input placeholder="Search UAN / Name" />
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

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UAN</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">ECR EPF</TableHead>
                    <TableHead className="text-right">ECR EPS</TableHead>
                    <TableHead className="text-right">NCP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {!ecrUploaded && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        Upload ECR file to view employee-wise compliance
                      </TableCell>
                    </TableRow>
                  )}

                  {ecrUploaded && employeeRecon.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.uan}</TableCell>
                      <TableCell>{e.name}</TableCell>
                      <TableCell className="text-right">{e.ecrEPF}</TableCell>
                      <TableCell className="text-right">{e.ecrEPS}</TableCell>
                      <TableCell className="text-right">{e.ncp}</TableCell>
                      <TableCell>
                        {e.status === "MATCHED" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            MATCHED
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            MISMATCH
                          </Badge>
                        )}
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
