"use client"

import { useState, useEffect, useRef } from "react"
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
import { toast } from "sonner"
import { withBasePath } from "@/lib/base-path"

/* ================= COMPONENT ================= */

export default function ESICReconciliationModule() {
  const [activeTab, setActiveTab] = useState("establishment")

  /* ---------- ESTABLISHMENT STATES ---------- */
  const [selectedType, setSelectedType] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [esicData, setEsicData] = useState<any | null>(null)
  const [challanUploaded, setChallanUploaded] = useState(false)
  const [challanId, setChallanId] = useState<string | null>(null)
  const [challanPaidAmount, setChallanPaidAmount] = useState<number>(0)
  const [reconRow, setReconRow] = useState<any | null>(null)
  const challanInputRef = useRef<HTMLInputElement>(null)

  /* ---------- EMPLOYEE STATES ---------- */
  const [ecrUploaded, setEcrUploaded] = useState(false)
  const [employeeRecon, setEmployeeRecon] = useState<any[]>([])
  const ecrInputRef = useRef<HTMLInputElement>(null)

  /* ================= AUTO FETCH UPLOAD DATA ================= */
  useEffect(() => {
    if (!selectedType || !selectedMonth) {
      setEsicData(null)
      setReconRow(null)
      setChallanUploaded(false)
      setChallanId(null)
      return
    }

    const load = async () => {
      try {
        const res = await fetch(
          withBasePath(
            `/api/statutory/esic/upload-data?type=${encodeURIComponent(selectedType)}&month=${encodeURIComponent(selectedMonth)}`
          ),
          { credentials: "include", cache: "no-store" }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load ESIC upload data")
        const results = data?.results ?? {}
        setEsicData({
          challanType: results.establishmentType ?? selectedType,
          month: results.month ?? selectedMonth,
          employees: results.employees ?? 0,
          uploadAmount: results.uploadAmount ?? 0,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load ESIC upload data")
        setEsicData(null)
      }
    }

    setReconRow(null)
    setChallanUploaded(false)
    setChallanId(null)
    void load()
  }, [selectedType, selectedMonth])

  /* ================= CHALLAN UPLOAD ================= */
  const handleChallanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(
        withBasePath(`/api/statutory/esic/challan?month=${encodeURIComponent(selectedMonth)}`),
        { method: "POST", body: formData, credentials: "include" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to upload challan")
      const results = data?.results ?? {}
      setChallanId(results.challanId ?? null)
      setChallanPaidAmount(results.paidAmount ?? 0)
      setChallanUploaded(true)
      toast.success("Challan uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload challan")
    }
  }

  /* ================= RECONCILE ================= */
  const handleReconcile = async () => {
    if (!esicData || !challanUploaded || !challanId) return

    try {
      const res = await fetch(withBasePath("/api/statutory/esic/reconcile"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          establishmentType: esicData.challanType,
          month: esicData.month,
          uploadAmount: esicData.uploadAmount,
          paidAmount: challanPaidAmount,
          challanId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to reconcile")

      setReconRow({
        challanType: esicData.challanType,
        month: esicData.month,
        employees: esicData.employees,
        uploadAmount: esicData.uploadAmount,
        paidAmount: challanPaidAmount,
        challanNo: challanId,
      })
      toast.success("Reconciled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reconcile")
    }
  }

  /* ================= ECR UPLOAD ================= */
  const handleEcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(
        withBasePath(`/api/statutory/esic/ecr?month=${encodeURIComponent(selectedMonth)}`),
        { method: "POST", body: formData, credentials: "include" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to upload ECR")
      const results = data?.results ?? {}
      setEmployeeRecon(results.data ?? [])
      setEcrUploaded(true)
      toast.success("ECR uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload ECR")
    }
  }

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

              <input ref={challanInputRef} type="file" className="hidden" onChange={handleChallanFile} accept=".pdf" />
              <Button
                variant="outline"
                disabled={!esicData}
                onClick={() => challanInputRef.current?.click()}
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

                <input ref={ecrInputRef} type="file" className="hidden" onChange={handleEcrFile} accept=".txt,.csv" />
                <Button variant="outline" onClick={() => ecrInputRef.current?.click()}>
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
