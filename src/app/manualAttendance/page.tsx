"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { AlertCircle, Send, Upload } from "lucide-react"
import { withBasePath } from "@/lib/base-path"

interface AttendanceRecord {
  employee_id: string
  employee_name: string
  present_days: number
  weekly_off: number
  national_holidays: number
  holiday: number
  comp_off: number
  leave: number
  absent: number
  half_day: number
  ot_hrs: number
  total_payable_days: number
  [key: string]: string | number
}

interface TemporaryAttendanceRecord {
  sr_no: string
  branch_code: string
  new_branch_code: string
  site_code: string
  new_site_code: string
  site_name: string
  salary_type_id: string
  designation_id: string
  designation_name: string
  duty_id: string
  duty_name: string
  employee_code: string
  new_emp_code: string
  employee_name: string
  salary: number
  month_name: string
  year_name: string
  normal_days: number
  weekly_off: number
  paid_holiday: number
  ismart_ot_days: number
  ismart_ot_hrs: number
  spl_ot_days: number
  spl_ot_hrs: number
  pl: number
  cl: number
  sl: number
}

interface SubmissionRecord {
  id: string
  client: string
  site: string
  month: string
  records: AttendanceRecord[]
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  type?: "standard" | "temporary"
  tempRecords?: TemporaryAttendanceRecord[]
}

interface SiteOption {
  id: string
  name: string
  clientId: string
}

interface SalaryStructureOption {
  DESIGNATIONID?: number | string
  DESIGNATION?: string
  DUTYID?: number | string
  DUTY?: string
  GROSS?: number | string
  SALARYBILLINGTOTAL?: number | string
}

const clients = [
  { id: "client-1", name: "Acme Corp" },
  { id: "client-2", name: "Tech Solutions" },
  { id: "client-3", name: "Global Services" },
]

const fallbackSites: SiteOption[] = [
  { id: "site-a", name: "Site A", clientId: "client-1" },
  { id: "site-b", name: "Site B", clientId: "client-1" },
  { id: "site-c", name: "Site C", clientId: "client-2" },
  { id: "site-d", name: "Site D", clientId: "client-3" },
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const TEMP_REQUIRED_COLUMNS = [
  "srno",
  "branchcode",
  "sitecode",
  "sitename",
  "salarytypeid",
  "designationid",
  "designationname",
  "dutyid",
  "dutyname",
  "monthname",
  "yearname",
  "empcode",
  "empname",
  "normaldays",
  "weeklyoff",
  "paidholiday",
  "otdays",
  "othours",
  "splotdays",
  "splothours",
  "pl",
  "cl",
  "sl",
]

const TEMP_COLUMN_ALIASES: Record<string, string[]> = {
  sr_no: ["srno", "sr no", "serialno", "serial no"],
  branch_code: ["branchcode", "branch code"],
  site_code: ["sitecode", "site code"],
  site_name: ["sitename", "site name"],
  salary_type_id: ["salarytypeid", "salary type id"],
  designation_id: ["designationid", "designation id"],
  designation_name: ["designationname", "designation name"],
  duty_id: ["dutyid", "duty id"],
  duty_name: ["dutyname", "duty name"],
  employee_code: ["empcode", "emp code", "employeecode"],
  employee_name: ["empname", "emp name", "employeename"],
  month_name: ["monthname", "month name"],
  year_name: ["yearname", "year name"],
  normal_days: ["normaldays", "normal days"],
  weekly_off: ["weeklyoff", "weekly off"],
  paid_holiday: ["paidholiday", "paid holiday"],
  ismart_ot_days: ["ismartotdays", "ismart ot days", "otdays", "ot days"],
  ismart_ot_hrs: ["ismartothrs", "ismart ot hrs", "othours", "ot hrs"],
  spl_ot_days: ["splotdays", "spl ot days"],
  spl_ot_hrs: ["splothours", "splothrs", "spl ot hours", "spl ot hrs"],
  pl: ["pl"],
  cl: ["cl"],
  sl: ["sl"],
}

function normalizeHeader(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function toNumber(value: unknown) {
  const parsed = Number(String(value ?? "").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function autoBranchCode(branchCode: string) {
  const base = String(branchCode ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  return base ? `${base}N` : "AUTO-BRANCH"
}

function autoSiteCode(siteCode: string, selectedSiteId: string) {
  const siteBase = String(siteCode ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  const selectedBase = String(selectedSiteId ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (siteBase) return `${siteBase}N`
  if (selectedBase) return `${selectedBase}N`
  return "AUTO-SITE"
}

function autoEmpCode(employeeCode: string, newSiteCode: string, rowNumber: number) {
  const empBase = String(employeeCode ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (empBase) return `${newSiteCode}-${empBase}`
  return `${newSiteCode}-${String(rowNumber).padStart(4, "0")}`
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

export default function ManualAttendanceUploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("standard")
  const [client, setClient] = useState("")
  const [site, setSite] = useState("")
  const [month, setMonth] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadedData, setUploadedData] = useState<AttendanceRecord[]>([])
  const [tempClient, setTempClient] = useState("")
  const [tempSite, setTempSite] = useState("")
  const [tempMonth, setTempMonth] = useState("")
  const [tempFile, setTempFile] = useState<File | null>(null)
  const [tempUploadedData, setTempUploadedData] = useState<TemporaryAttendanceRecord[]>([])
  const [tempUploadErrors, setTempUploadErrors] = useState<string[]>([])
  const tempFileInputRef = useRef<HTMLInputElement>(null)
  const [clientSites, setClientSites] = useState<SiteOption[]>([])
  const [tempClientSites, setTempClientSites] = useState<SiteOption[]>([])
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructureOption[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([
    {
      id: "SUB001",
      client: "Acme Corp",
      site: "Site A",
      month: "November",
      records: [],
      status: "pending",
      submittedAt: "2024-12-20 10:30 AM",
      type: "standard",
    },
    {
      id: "SUB002",
      client: "Tech Solutions",
      site: "Site B",
      month: "December",
      records: [],
      status: "approved",
      submittedAt: "2024-12-18 2:15 PM",
      type: "standard",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [tempLoading, setTempLoading] = useState(false)

  const sites = client ? clientSites : []
  const tempSites = tempClient ? tempClientSites : []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleTempFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTempFile(e.target.files[0])
      setTempUploadErrors([])
    }
  }

  const getClientName = (clientId: string) =>
    clients.find((item) => item.id === clientId)?.name ?? clientId

  const getSiteName = (siteId: string, availableSites: SiteOption[]) =>
    availableSites.find((item) => item.id === siteId)?.name ?? siteId

  useEffect(() => {
    void loadSalaryStructures()
  }, [])

  useEffect(() => {
    if (!client) {
      setClientSites([])
      return
    }

    void loadSitesForClient(client, setClientSites)
  }, [client])

  useEffect(() => {
    if (!tempClient) {
      setTempClientSites([])
      return
    }

    void loadSitesForClient(tempClient, setTempClientSites)
  }, [tempClient])

  const loadSitesForClient = async (clientId: string, setter: (sites: SiteOption[]) => void) => {
    try {
      const response = await fetch(withBasePath(`/api/clients/${encodeURIComponent(clientId)}/sites`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (response.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.status}`)
      }

      const payload = await response.json()
      const normalizedSites = normalizeSites(payload, clientId)
      setter(normalizedSites.length ? normalizedSites : fallbackSites.filter((siteOption) => siteOption.clientId === clientId))
    } catch (error) {
      console.error("Error loading sites:", error)
      setter(fallbackSites.filter((siteOption) => siteOption.clientId === clientId))
    }
  }

  const loadSalaryStructures = async () => {
    try {
      const response = await fetch(withBasePath("/salary_structure.json"), {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch salary structure: ${response.status}`)
      }

      const payload = await response.json()
      setSalaryStructures(Array.isArray(payload) ? payload : [])
    } catch (error) {
      console.error("Error loading salary structure:", error)
      setSalaryStructures([])
    }
  }

  const handleUpload = async () => {
    if (!client || !site || !month || !file) {
      toast.error("Please select client, site, month and upload a file")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("clientId", client)
      formData.append("siteId", site)
      formData.append("month", month)

      const res = await fetch(withBasePath("/api/attendance/upload"), {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()

      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to upload attendance file")
      }

      const records = Array.isArray(data?.results?.data)
        ? data.results.data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : []

      setUploadedData(records)
      toast.success(`Attendance file loaded for ${getClientName(client)} - ${getSiteName(site, sites)} - ${month}`)
    } catch (error) {
      toast.error("Failed to upload attendance file")
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTempUpload = async () => {
    if (!tempClient || !tempSite || !tempMonth || !tempFile) {
      toast.error("Please select client, site, month and upload a file")
      return
    }

    if (!/\.(csv|xlsx|xls)$/i.test(tempFile.name)) {
      setTempUploadErrors(["Please upload a CSV or Excel file"])
      toast.error("Only CSV or Excel files are supported")
      return
    }

    setTempLoading(true)
    setTempUploadErrors([])

    try {
      const rows = await readWorksheetRows(tempFile)

      if (rows.length < 2) {
        throw new Error("File must contain header and at least one data row")
      }

      const headers = rows[0].map((header) => normalizeHeader(header))
      const missingColumns = TEMP_REQUIRED_COLUMNS.filter((column) => !headers.includes(column))

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
      }

      const parsedRecords = rows
        .slice(1)
        .filter((row) => row.some((value) => String(value ?? "").trim()))
        .map((row, index) => mapTemporaryAttendanceRow(headers, row, index + 2, tempSite, salaryStructures))

      if (!parsedRecords.length) {
        throw new Error("No attendance rows found in the uploaded file")
      }

      setTempUploadedData(parsedRecords)
      toast.success(
        `Temporary attendance file loaded for ${getClientName(tempClient)} - ${getSiteName(tempSite, tempSites)} - ${tempMonth}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse temporary attendance file"
      setTempUploadErrors([message])
      setTempUploadedData([])
      toast.error("Failed to upload temporary attendance file")
    } finally {
      setTempLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!uploadedData.length) {
      toast.error("Please upload attendance data first")
      return
    }

    const newSubmission: SubmissionRecord = {
      id: `SUB${Math.floor(Math.random() * 10000)}`,
      client: getClientName(client),
      site: getSiteName(site, sites),
      month,
      records: uploadedData,
      status: "pending",
      submittedAt: new Date().toLocaleString("en-IN"),
      type: "standard",
    }

    setSubmissions([newSubmission, ...submissions])
    setUploadedData([])
    setClient("")
    setSite("")
    setMonth("")
    setFile(null)
    toast.success("Attendance submitted for verification")
  }

  const handleTempSubmit = () => {
    if (!tempUploadedData.length) {
      toast.error("Please upload attendance data first")
      return
    }

    const firstRecord = tempUploadedData[0]
    const derivedMonth = firstRecord ? `${firstRecord.month_name} ${firstRecord.year_name}` : "Temporary Upload"

    const newSubmission: SubmissionRecord = {
      id: `SUB${Math.floor(Math.random() * 10000)}`,
      client: getClientName(tempClient),
      site: getSiteName(tempSite, tempSites),
      month: tempMonth || derivedMonth,
      records: [],
      status: "pending",
      submittedAt: new Date().toLocaleString("en-IN"),
      type: "temporary",
      tempRecords: tempUploadedData,
    }

    setSubmissions([newSubmission, ...submissions])
    setTempUploadedData([])
    setTempClient("")
    setTempSite("")
    setTempMonth("")
    setTempFile(null)
    setTempUploadErrors([])
    if (tempFileInputRef.current) {
      tempFileInputRef.current.value = ""
    }
    toast.success("Temporary attendance submitted for verification")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manual Attendance Upload</h1>
          <p className="mt-2 text-muted-foreground">Upload attendance data via Excel file</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-2">
            <TabsTrigger value="standard">Attendance Upload</TabsTrigger>
            <TabsTrigger value="temporary">Attendance Upload 2</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Attendance File</CardTitle>
                <CardDescription>Select client, site, and month, then upload your Excel file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client</label>
                    <Select
                      value={client}
                      onValueChange={(value) => {
                        setClient(value)
                        setSite("")
                      }}
                    >
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site</label>
                    <Select value={site} onValueChange={setSite} disabled={!client}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload File</label>
                  <div className="flex items-center gap-3">
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="flex-1" />
                    {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                  </div>
                </div>

                <Button onClick={handleUpload} disabled={loading} className="w-full md:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  {loading ? "Uploading..." : "Upload File"}
                </Button>
              </CardContent>
            </Card>

            {uploadedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Attendance Data</CardTitle>
                  <CardDescription>
                    {getClientName(client)} • {getSiteName(site, sites)} • {month} • {uploadedData.length} records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Employee Name</TableHead>
                          <TableHead className="text-center">P</TableHead>
                          <TableHead className="text-center">W</TableHead>
                          <TableHead className="text-center">NH</TableHead>
                          <TableHead className="text-center">H</TableHead>
                          <TableHead className="text-center">CO</TableHead>
                          <TableHead className="text-center">L</TableHead>
                          <TableHead className="text-center">A</TableHead>
                          <TableHead className="text-center">HD</TableHead>
                          <TableHead className="text-center">OT Hrs</TableHead>
                          <TableHead className="text-center font-bold">Total Payable Days</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedData.map((record, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{record.employee_id}</TableCell>
                            <TableCell>{record.employee_name}</TableCell>
                            <TableCell className="text-center text-sm">{record.present_days}</TableCell>
                            <TableCell className="text-center text-sm">{record.weekly_off}</TableCell>
                            <TableCell className="text-center text-sm">{record.national_holidays}</TableCell>
                            <TableCell className="text-center text-sm">{record.holiday}</TableCell>
                            <TableCell className="text-center text-sm">{record.comp_off}</TableCell>
                            <TableCell className="text-center text-sm">{record.leave}</TableCell>
                            <TableCell className="text-center text-sm">{record.absent}</TableCell>
                            <TableCell className="text-center text-sm">{record.half_day}</TableCell>
                            <TableCell className="text-center text-sm">{record.ot_hrs}</TableCell>
                            <TableCell className="text-center font-semibold text-primary">
                              {record.total_payable_days}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setUploadedData([])}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="temporary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Attendance File 2</CardTitle>
                <CardDescription>
                  Temporary upload for the alternate format. New branch code, new site code, and new emp code are auto-generated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client</label>
                    <Select
                      value={tempClient}
                      onValueChange={(value) => {
                        setTempClient(value)
                        setTempSite("")
                      }}
                    >
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <Select value={tempMonth} onValueChange={setTempMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site</label>
                    <Select value={tempSite} onValueChange={setTempSite} disabled={!tempClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {tempSites.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload File</label>
                  <div className="flex items-center gap-3">
                    <Input
                      ref={tempFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleTempFileChange}
                      className="flex-1"
                    />
                    {tempFile && <span className="text-sm text-muted-foreground">{tempFile.name}</span>}
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  Expected Excel columns: `Sr no.`, `BRANCHCODE`, `SITECODE`, `SITENAME`, `SalaryTypeID`,
                  `DESIGNATIONID`, `DESIGNATIONNAME`, `DUTYID`, `DUTYNAME`, `MONTHNAME`, `YEARNAME`, `EMPCODE`,
                  `EMPNAME`, `NORMALDAYS`, `WEEKLYOFF`, `PAIDHOLIDAY`, `OTDAYS`, `OTHOURS`, `SPLOTDAYS`,
                  `SPLOTHOURS`, `PL`, `CL`, and `SL`. Preview adds `new branch code`, `new site code`, and `new emp code` automatically.
                </div>

                {tempUploadErrors.length > 0 && (
                  <div className="space-y-1 rounded border border-red-200 bg-red-50 p-3">
                    {tempUploadErrors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                        <p className="text-xs text-red-700">{error}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleTempUpload} disabled={tempLoading} className="w-full md:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  {tempLoading ? "Uploading..." : "Upload File"}
                </Button>
              </CardContent>
            </Card>

            {tempUploadedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Attendance Data 2</CardTitle>
                  <CardDescription>
                    {getClientName(tempClient)} • {getSiteName(tempSite, tempSites)} • {tempMonth} • {tempUploadedData.length} records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Branch Code</TableHead>
                          <TableHead>New Branch Code</TableHead>
                          <TableHead>Site Code</TableHead>
                          <TableHead>New Site Code</TableHead>
                          <TableHead>Emp Code</TableHead>
                          <TableHead>New Emp Code</TableHead>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Salary</TableHead>
                          <TableHead className="text-center">Normal Days</TableHead>
                          <TableHead className="text-center">Weekly Off</TableHead>
                          <TableHead className="text-center">Paid Holiday</TableHead>
                          <TableHead className="text-center">ISMART OT Days</TableHead>
                          <TableHead className="text-center">ISMART OT Hrs</TableHead>
                          <TableHead className="text-center">PL</TableHead>
                          <TableHead className="text-center">CL</TableHead>
                          <TableHead className="text-center">SL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tempUploadedData.map((record, idx) => (
                          <TableRow key={`${record.new_emp_code}-${idx}`}>
                            <TableCell>{record.branch_code}</TableCell>
                            <TableCell className="font-medium">{record.new_branch_code}</TableCell>
                            <TableCell>{record.site_code}</TableCell>
                            <TableCell className="font-medium">{record.new_site_code}</TableCell>
                            <TableCell>{record.employee_code}</TableCell>
                            <TableCell>{record.new_emp_code}</TableCell>
                            <TableCell>{record.employee_name}</TableCell>
                            <TableCell>{tempMonth}</TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {formatCurrency(record.salary)}
                            </TableCell>
                            <TableCell className="text-center text-sm">{record.normal_days}</TableCell>
                            <TableCell className="text-center text-sm">{record.weekly_off}</TableCell>
                            <TableCell className="text-center text-sm">{record.paid_holiday}</TableCell>
                            <TableCell className="text-center text-sm">{record.ismart_ot_days}</TableCell>
                            <TableCell className="text-center text-sm">{record.ismart_ot_hrs}</TableCell>
                            <TableCell className="text-center text-sm">{record.pl}</TableCell>
                            <TableCell className="text-center text-sm">{record.cl}</TableCell>
                            <TableCell className="text-center text-sm">{record.sl}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempUploadedData([])
                        setTempUploadErrors([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleTempSubmit}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>Track your attendance submissions and their verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Submission ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {submission.type === "temporary" ? "Attendance Upload 2" : "Attendance Upload"}
                          </Badge>
                        </TableCell>
                        <TableCell>{submission.client}</TableCell>
                        <TableCell>{submission.site}</TableCell>
                        <TableCell>{submission.month}</TableCell>
                        <TableCell>
                          {submission.type === "temporary"
                            ? `${submission.tempRecords?.length ?? 0} employees`
                            : `${submission.records.length} employees`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{submission.submittedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === "pending"
                                ? "outline"
                                : submission.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

async function readWorksheetRows(file: File) {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name)

  if (isExcel) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: "array" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as unknown[]
    return rawRows.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "").trim()) : []))
  }

  const text = await file.text()
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split(",").map((value) => value.trim()))
}

function normalizeSites(payload: unknown, clientId: string): SiteOption[] {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : Array.isArray((payload as any)?.results?.data)
        ? (payload as any).results.data
        : Array.isArray((payload as any)?.results)
          ? (payload as any).results
          : []

  return rawList
    .map((item: any, index: number) => {
      const name = String(item?.name ?? item?.siteName ?? item?.site_name ?? "").trim()
      if (!name) return null

      return {
        id: String(item?.id ?? item?.siteId ?? item?.site_id ?? `${clientId}-site-${index + 1}`),
        name,
        clientId,
      }
    })
    .filter(Boolean) as SiteOption[]
}

function getCellValue(headers: string[], row: string[], aliases: string[]) {
  const index = headers.findIndex((header) => aliases.includes(header))
  return index >= 0 ? row[index] ?? "" : ""
}

function findGeneratedSalary(
  designationId: string,
  designationName: string,
  dutyId: string,
  dutyName: string,
  salaryStructures: SalaryStructureOption[],
) {
  const normalizedDesignationId = String(designationId ?? "").trim()
  const normalizedDutyId = String(dutyId ?? "").trim()
  const normalizedDesignationName = String(designationName ?? "").trim().toLowerCase()
  const normalizedDutyName = String(dutyName ?? "").trim().toLowerCase()

  const matchedSalary = salaryStructures.find((item) => {
    const itemDesignationId = String(item?.DESIGNATIONID ?? "").trim()
    const itemDutyId = String(item?.DUTYID ?? "").trim()
    const itemDesignationName = String(item?.DESIGNATION ?? "").trim().toLowerCase()
    const itemDutyName = String(item?.DUTY ?? "").trim().toLowerCase()

    const designationMatched =
      (normalizedDesignationId && itemDesignationId === normalizedDesignationId) ||
      (normalizedDesignationName && itemDesignationName === normalizedDesignationName)

    const dutyMatched =
      !normalizedDutyId && !normalizedDutyName
        ? true
        : (normalizedDutyId && itemDutyId === normalizedDutyId) ||
          (normalizedDutyName && itemDutyName === normalizedDutyName)

    return designationMatched && dutyMatched
  })

  return toNumber(matchedSalary?.GROSS ?? matchedSalary?.SALARYBILLINGTOTAL ?? 0)
}

function mapTemporaryAttendanceRow(
  headers: string[],
  row: string[],
  rowNumber: number,
  selectedSiteId: string,
  salaryStructures: SalaryStructureOption[],
): TemporaryAttendanceRecord {
  const employeeName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.employee_name)
  const branchCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.branch_code)
  const siteCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.site_code)
  const employeeCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.employee_code)
  const designationId = getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_id)
  const designationName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_name)
  const dutyId = getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_id)
  const dutyName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_name)
  const newBranchCode = autoBranchCode(branchCode)
  const newSiteCode = autoSiteCode(siteCode, selectedSiteId)
  const newEmpCode = autoEmpCode(employeeCode, newSiteCode, rowNumber)
  const salary = findGeneratedSalary(designationId, designationName, dutyId, dutyName, salaryStructures)

  if (!employeeName || !branchCode || !siteCode || !employeeCode) {
    throw new Error(`Row ${rowNumber}: branch code, site code, emp code and employee name are required`)
  }

  return {
    sr_no: getCellValue(headers, row, TEMP_COLUMN_ALIASES.sr_no),
    branch_code: branchCode,
    new_branch_code: newBranchCode,
    site_code: siteCode,
    new_site_code: newSiteCode,
    site_name: getCellValue(headers, row, TEMP_COLUMN_ALIASES.site_name),
    salary_type_id: getCellValue(headers, row, TEMP_COLUMN_ALIASES.salary_type_id),
    designation_id: getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_id),
    designation_name: getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_name),
    duty_id: getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_id),
    duty_name: getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_name),
    employee_code: employeeCode,
    new_emp_code: newEmpCode,
    employee_name: employeeName,
    salary,
    month_name: getCellValue(headers, row, TEMP_COLUMN_ALIASES.month_name),
    year_name: getCellValue(headers, row, TEMP_COLUMN_ALIASES.year_name),
    normal_days: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.normal_days)),
    weekly_off: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.weekly_off)),
    paid_holiday: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.paid_holiday)),
    ismart_ot_days: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.ismart_ot_days)),
    ismart_ot_hrs: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.ismart_ot_hrs)),
    spl_ot_days: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.spl_ot_days)),
    spl_ot_hrs: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.spl_ot_hrs)),
    pl: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.pl)),
    cl: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.cl)),
    sl: toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.sl)),
  }
}
