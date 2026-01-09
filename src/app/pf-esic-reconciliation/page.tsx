"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Download, CheckCircle, Filter } from "lucide-react"

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Employee = {
  id: string
  name: string
  uan: string
  siteId: string
}

type EcrRow = {
  uan: string
  name?: string
  isClientEmployee: boolean
}

/* -------------------------------------------------------------------------- */
/* MOCK MASTER DATA (replace with API)                                        */
/* -------------------------------------------------------------------------- */

const SITES = [
  { id: "site-1", name: "Mumbai Site" },
  { id: "site-2", name: "Pune Site" },
]

const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Rahul Patil", uan: "100200300400", siteId: "site-1" },
  { id: "e2", name: "Amit Shah", uan: "100200300402", siteId: "site-2" },
]

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PfEsicReconciliationPage() {
  const [client, setClient] = useState("")
  const [month, setMonth] = useState("")
  const [site, setSite] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [rows, setRows] = useState<EcrRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [statutoryType, setStatutoryType] = useState<"PF" | "ESIC" | "">("")


const canUpload = Boolean(client && month && statutoryType)


  /* ---------------- FILTERED EMPLOYEES ---------------- */

  const employeesForFilter = site
    ? EMPLOYEES.filter(e => e.siteId === site)
    : EMPLOYEES

  /* ---------------- MOCK PARSE & MATCH ---------------- */

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)

    // 🔴 MOCK ECR DATA
    const ecrUans = ["100200300400", "100200300401", "100200300402"]

    setTimeout(() => {
      const matched = ecrUans.map(uan => {
        const emp = EMPLOYEES.find(e => e.uan === uan)

        const siteMatch = site ? emp?.siteId === site : true
        const employeeMatch = selectedEmployees.length
          ? selectedEmployees.includes(emp?.id || "")
          : true

        const isClientEmployee = Boolean(emp && siteMatch && employeeMatch)

        return {
          uan,
          name: emp?.name,
          isClientEmployee,
        }
      })

      setRows(matched)
      setUploading(false)
    }, 1000)
  }

  const handleDownload = () => {
    console.log("DOWNLOAD HIGHLIGHTED ECR WITH FILTERS")
  }

  /* -------------------------------------------------------------------------- */

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ---------------- HEADER ---------------- */}
        <div>
          <h1 className="text-3xl font-bold">PF / ESIC Reconciliation</h1>
          <p className="text-muted-foreground">
            Upload ECR and verify PF benefits for selected employees
          </p>
        </div>

        {/* ---------------- CONTEXT & FILTERS ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-5">
            {/* PF / ESIC */}
<div className="space-y-2">
  <label className="text-sm font-medium">
    Statutory Type <span className="text-red-500">*</span>
  </label>

  <Select
    value={statutoryType}
    onValueChange={(v: "PF" | "ESIC") => setStatutoryType(v)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select PF or ESIC" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="PF">PF (ECR – UAN based)</SelectItem>
      <SelectItem value="ESIC">ESIC (IP based)</SelectItem>
    </SelectContent>
  </Select>
</div>


            {/* Client */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-a">Client A</SelectItem>
                  <SelectItem value="client-b">Client B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wage Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">Jan 2024</SelectItem>
                  <SelectItem value="2024-02">Feb 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Site (Optional)</label>
              <Select value={site} onValueChange={(value) => {
    setSite(value)
    setSelectedEmployees([]) // 🔥 RESET employees
  }} >
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  {SITES.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employees */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Employees (Optional)</label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedEmployees.length
                      ? `${selectedEmployees.length} selected`
                      : "Select employees"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-2 space-y-2">
                  {employeesForFilter.map(e => (
                    <div key={e.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedEmployees.includes(e.id)}
                        onCheckedChange={(v) =>
                          setSelectedEmployees(prev =>
                            v
                              ? [...prev, e.id]
                              : prev.filter(id => id !== e.id)
                          )
                        }
                      />
                      <span className="text-sm">{e.name}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

          </CardContent>
        </Card>

        {/* ---------------- UPLOAD ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Upload ECR (PAN India)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="file"
              accept=".pdf"
              multiple
              disabled={!canUpload}
              onChange={(e) => handleUpload(e.target.files)}
            />

            {!canUpload && (
              <p className="text-sm text-muted-foreground">
                Client and month are required
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Highlighting will apply only to selected site / employees
            </p>

            {uploading && <p className="text-sm">Processing ECR…</p>}
          </CardContent>
        </Card>

        {/* ---------------- RESULT ---------------- */}
        {rows.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reconciliation Result</CardTitle>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Highlighted ECR
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">UAN</th>
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={i}
                        className={r.isClientEmployee ? "bg-emerald-50" : ""}
                      >
                        <td className="p-2">{r.uan}</td>
                        <td className="p-2">{r.name || "-"}</td>
                        <td className="p-2">
                          {r.isClientEmployee ? (
                            <Badge className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Client Employee
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Not in filter</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </MainLayout>
  )
}
