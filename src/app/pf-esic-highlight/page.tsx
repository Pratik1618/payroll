"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { withBasePath } from "@/lib/base-path"
import { useClients, useClientSites } from "@/hooks/use-shared-master-data"
import { generateMonthOptions } from "@/utils/month-utility"
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

const monthOptions = generateMonthOptions(2024, 2026)

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PfEsicReconciliationPage() {
  const { clients } = useClients([])
  const [client, setClient] = useState("")
  const { sites } = useClientSites(client, [])
  const [month, setMonth] = useState("")
  const [site, setSite] = useState("")
  const [employeesForFilter, setEmployeesForFilter] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [rows, setRows] = useState<EcrRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [highlightFileId, setHighlightFileId] = useState<string | null>(null)
  const [statutoryType, setStatutoryType] = useState<"PF" | "ESIC" | "">("")

  const canUpload = Boolean(client && month && statutoryType)

  /* ---------------- LOAD CLIENT EMPLOYEES FOR FILTER ---------------- */

  useEffect(() => {
    if (!client) {
      setEmployeesForFilter([])
      return
    }
    let cancelled = false
    const params = new URLSearchParams({ clientId: client })
    if (site) params.set("siteId", site)
    fetch(withBasePath(`/api/statutory-highlight/client-employees?${params.toString()}`), {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const items = data?.results?.data ?? data?.data ?? []
        setEmployeesForFilter(
          items.map((e: any) => ({ id: e.empId, name: e.name, uan: e.uan, siteId: e.siteId }))
        )
      })
      .catch(() => {
        if (!cancelled) setEmployeesForFilter([])
      })
    return () => {
      cancelled = true
    }
  }, [client, site])

  /* ---------------- REAL UPLOAD & MATCH ---------------- */

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("clientId", client)
      formData.append("month", month)
      formData.append("statutoryType", statutoryType)
      if (site) formData.append("siteId", site)
      if (selectedEmployees.length) formData.append("employeeIds", selectedEmployees.join(","))

      const res = await fetch(withBasePath("/api/statutory-highlight/ecr/upload"), {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to process ECR upload")
      const result = data?.results ?? data
      setRows(result.preview || [])
      setHighlightFileId(result.highlightFileId || null)
      toast.success(
        `Matched ${result.summary?.matchedEmployees ?? 0} of ${result.summary?.totalEcrRows ?? 0} ECR rows`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process ECR upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!highlightFileId) return
    try {
      const res = await fetch(
        withBasePath(`/api/statutory-highlight/ecr/download/${encodeURIComponent(highlightFileId)}`),
        { credentials: "include" }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Failed to download highlighted ECR")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "highlighted-ecr.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download highlighted ECR")
    }
  }

  /* -------------------------------------------------------------------------- */

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ---------------- HEADER ---------------- */}
        <div>
          <h1 className="text-3xl font-bold">PF / ESIC Highlight</h1>
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
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
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
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Site (Optional)</label>
              <Select value={site} onValueChange={(value) => {
    setSite(value)
    setSelectedEmployees([]) // reset employees when the site filter changes
  }} >
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(s => (
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
