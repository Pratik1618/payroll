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
import { AlertCircle, Send, Upload, ChevronDown, Eye, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { withBasePath } from "@/lib/base-path"
import { useClients, useClientSites } from "@/hooks/use-shared-master-data"

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
  new_designation_name?: string
  grade?: string
  gender?: string
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
  batchSubmissionId?: string
  client: string
  site: string
  month: string
  records: AttendanceRecord[]
  recordsCount?: number
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

type TemporarySiteGroup = {
  siteId: string
  siteName: string
  records: TemporaryAttendanceRecord[]
}

const fallbackClients = [
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

// The month dropdown only offers a bare name (no year), but the backend
// requires strict YYYY-MM for Manual Attendance Upload 2. Handles both full
// names (dropdown) and 3-letter abbreviations (seen in real uploaded files,
// e.g. "APR"), case-insensitively.
const MONTH_NAME_TO_NUMBER: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
}

function toYyyyMm(monthName: string | undefined, yearName: string | undefined): string | null {
  if (!monthName || !yearName) return null
  const num = MONTH_NAME_TO_NUMBER[monthName.trim().toLowerCase()]
  const year = yearName.trim()
  if (!num || !/^\d{4}$/.test(year)) return null
  return `${year}-${num}`
}

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

const REQUIRED_TEMP_FIELDS: { key: string; name: string }[] = [
  { key: "sr_no", name: "srno" },
  { key: "branch_code", name: "branchcode" },
  { key: "site_code", name: "sitecode" },
  { key: "site_name", name: "sitename" },
  { key: "salary_type_id", name: "salarytypeid" },
  { key: "designation_id", name: "designationid" },
  { key: "designation_name", name: "designationname" },
  { key: "duty_id", name: "dutyid" },
  { key: "duty_name", name: "dutyname" },
  { key: "month_name", name: "monthname" },
  { key: "year_name", name: "yearname" },
  { key: "employee_code", name: "empcode" },
  { key: "employee_name", name: "empname" },
  { key: "normal_days", name: "normaldays" },
  { key: "weekly_off", name: "weeklyoff" },
  { key: "paid_holiday", name: "paidholiday" },
  { key: "ismart_ot_days", name: "otdays" },
  { key: "ismart_ot_hrs", name: "othours" },
  { key: "spl_ot_days", name: "splotdays" },
  { key: "spl_ot_hrs", name: "splothours" },
  { key: "pl", name: "pl" },
  { key: "cl", name: "cl" },
  { key: "sl", name: "sl" },
]

const TEMP_COLUMN_ALIASES: Record<string, string[]> = {
  sr_no: ["srno", "sr no", "serialno", "serial no", "sr_no", "sr_no.", "sr.no", "sr.no."],
  branch_code: ["branchcode", "branch code", "branch_code"],
  new_branch_code: ["newbranchcode", "new branch code", "new_branch_code"],
  site_code: ["sitecode", "site code", "site_code"],
  new_site_code: ["newsitecode", "new site code", "new_site_code"],
  site_name: ["sitename", "site name", "site_name"],
  salary_type_id: ["salarytypeid", "salary type id", "salary_type_id", "salarytype"],
  salary: ["salary", "gross", "salarybillingtotal", "salary billing total"],
  designation_id: ["designationid", "designation id", "designation_id"],
  designation_name: ["designationname", "designation name", "designation_name"],
  new_designation_name: ["newdesignationname", "new designation name", "new_designation_name", "newdesignation", "new designation"],
  grade: ["grade", "grade no", "grade_no", "gradeno", "emp grade", "emp_grade", "empgrade"],
  gender: ["gender", "sex", "emp gender", "emp_gender", "empgender", "gender_name", "gendername", "gen"],
  duty_id: ["dutyid", "duty id", "duty_id"],
  duty_name: ["dutyname", "duty name", "duty_name"],
  employee_code: ["empcode", "emp code", "employeecode", "employee code", "emp_code"],
  new_emp_code: ["newempcode", "new emp code", "new_emp_code", "newemployeecode", "new employee code"],
  employee_name: ["empname", "emp name", "employeename", "employee name", "emp_name"],
  month_name: ["monthname", "month name", "month_name", "month"],
  year_name: ["yearname", "year name", "year_name", "year"],
  normal_days: ["normaldays", "normal days", "normal_days", "nd"],
  weekly_off: ["weeklyoff", "weekly off", "weekly_off", "wo"],
  paid_holiday: ["paidholiday", "paid holiday", "paid_holiday", "ph"],
  ismart_ot_days: ["ismartotdays", "ismart ot days", "otdays", "ot days", "ot_days"],
  ismart_ot_hrs: ["ismartothrs", "ismart ot hrs", "othours", "ot hours", "ot_hours", "othrs", "ot hrs", "ot_hrs"],
  spl_ot_days: ["splotdays", "spl ot days", "spl_ot_days", "splot_days", "splotday", "splot day"],
  spl_ot_hrs: ["splothours", "splothrs", "spl ot hours", "spl ot hrs", "spl_ot_hrs", "spl_ot_hours", "splot_hrs", "splot_hours"],
  pl: ["pl"],
  cl: ["cl"],
  sl: ["sl"],
}

function findHeaderRowIndex(rows: string[][]): number {
  let bestIndex = 0
  let maxScore = -1

  const requiredKeys = REQUIRED_TEMP_FIELDS.map((f) => f.key)
  const scanLimit = Math.min(rows.length, 15)

  for (let i = 0; i < scanLimit; i++) {
    const rowHeaders = rows[i].map((h) => normalizeHeader(h))
    let score = 0
    for (const key of requiredKeys) {
      const aliases = (TEMP_COLUMN_ALIASES[key] || []).map((a) => normalizeHeader(a))
      if (rowHeaders.some((h) => aliases.includes(h))) {
        score++
      }
    }
    if (score > maxScore) {
      maxScore = score
      bestIndex = i
    }
  }

  return bestIndex
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

function autoBranchCode() {
  return ""
}

function autoSiteCode(selectedSiteId: string) {
  return String(selectedSiteId ?? "").trim()
}

function autoEmpCode() {
  return ""
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function normalizeSiteToken(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function resolveTemporarySiteGroup(record: TemporaryAttendanceRecord, availableSites: SiteOption[]) {
  const siteCodeToken = normalizeSiteToken(record.site_code)
  const siteNameToken = normalizeSiteToken(record.site_name)

  const matchedSite = availableSites.find((site) => {
    const siteIdToken = normalizeSiteToken(site.id)
    const siteNameValueToken = normalizeSiteToken(site.name)

    return (
      (siteCodeToken && (siteIdToken === siteCodeToken || siteNameValueToken === siteCodeToken)) ||
      (siteNameToken && (siteNameValueToken === siteNameToken || siteIdToken === siteNameToken))
    )
  })

  return {
    siteId: matchedSite?.id || "",
    siteName: matchedSite?.name || "",
  }
}

function buildTemporarySiteGroups(records: TemporaryAttendanceRecord[], availableSites: SiteOption[]): TemporarySiteGroup[] {
  const groups = new Map<string, TemporarySiteGroup>()

  records.forEach((record) => {
    const hasExplicitNewSiteCode = !!record.new_site_code
    const resolved = hasExplicitNewSiteCode 
      ? { siteId: record.new_site_code, siteName: record.site_name } 
      : resolveTemporarySiteGroup(record, availableSites)
      
    const siteId = resolved.siteId || record.site_code || "UNKNOWN-SITE"
    const existing = groups.get(siteId)
    const normalizedRecord = {
      ...record,
      new_site_code: resolved.siteId || "",
    }

    if (existing) {
      existing.records.push(normalizedRecord)
      return
    }

    groups.set(siteId, {
      siteId,
      siteName: resolved.siteName || siteId,
      records: [normalizedRecord],
    })
  })

  return Array.from(groups.values())
}

export default function ManualAttendanceUploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("standard")
  const [client, setClient] = useState("")
  const [site, setSite] = useState("")
  const [month, setMonth] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadedData, setUploadedData] = useState<AttendanceRecord[]>([])
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [tempClient, setTempClient] = useState("")
  const [tempSite, setTempSite] = useState("")
  const [tempAutoSplitSites, setTempAutoSplitSites] = useState(false)
  const [tempMonth, setTempMonth] = useState("")
  const [tempFile, setTempFile] = useState<File | null>(null)
  const tempFileInputRef = useRef<HTMLInputElement>(null)
  const [tempUploadErrors, setTempUploadErrors] = useState<string[]>([])
  const [tempUploadedData, setTempUploadedData] = useState<TemporaryAttendanceRecord[]>([])
  const [clientSites, setClientSites] = useState<SiteOption[]>([])
  const [tempClientSites, setTempClientSites] = useState<SiteOption[]>([])
  const [standardSubmissions, setStandardSubmissions] = useState<SubmissionRecord[]>([])
  const [temporarySubmissions, setTemporarySubmissions] = useState<SubmissionRecord[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tempLoading, setTempLoading] = useState(false)
  
  // Preview states
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewSearch, setPreviewSearch] = useState("")
  const [previewViewMode, setPreviewViewMode] = useState<"flat" | "grouped">("flat")
  
  // Client dropdown search states
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  
  // Temp client dropdown search states
  const [tempClientDropdownOpen, setTempClientDropdownOpen] = useState(false)
  const [tempClientSearch, setTempClientSearch] = useState("")
  const tempClientDropdownRef = useRef<HTMLDivElement>(null)
  
  // Site dropdown search states
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false)
  const [siteSearch, setSiteSearch] = useState("")
  const siteDropdownRef = useRef<HTMLDivElement>(null)
  
  // Temp site dropdown search states
  const [tempSiteDropdownOpen, setTempSiteDropdownOpen] = useState(false)
  const [tempSiteSearch, setTempSiteSearch] = useState("")
  const tempSiteDropdownRef = useRef<HTMLDivElement>(null)
  
  // Use shared master client data
  const { clients: masterClients, isLoading: isClientsLoading } = useClients(fallbackClients as any)
  const clients = masterClients.length ? masterClients : fallbackClients

  const sites = client ? clientSites : []
  const tempSites = tempClient ? tempClientSites : []
  
  // Filtered lists for search
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(clientSearch.toLowerCase())
  )
  const filteredTempClients = clients.filter((c) =>
    c.name.toLowerCase().includes(tempClientSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(tempClientSearch.toLowerCase())
  )
  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(siteSearch.toLowerCase())
  )
  const filteredTempSites = tempSites.filter((s) =>
    s.name.toLowerCase().includes(tempSiteSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(tempSiteSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setClientDropdownOpen(false)
      }
      if (tempClientDropdownRef.current && !tempClientDropdownRef.current.contains(event.target as Node)) {
        setTempClientDropdownOpen(false)
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setSiteDropdownOpen(false)
      }
      if (tempSiteDropdownRef.current && !tempSiteDropdownRef.current.contains(event.target as Node)) {
        setTempSiteDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleClientSelect = (clientId: string) => {
    setClient(clientId)
    setTempClient(clientId)
    setSite("")
    setTempSite("")
  }

  const handleTempFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTempFile(e.target.files[0])
      setTempUploadErrors([])
    }
  }

  const handlePreviewSubmission = async (submissionId: string) => {
    setPreviewLoading(true)
    setPreviewModalOpen(true)
    setPreviewData(null)
    setPreviewSearch("")
    
    try {
      const response = await fetch(withBasePath(`/api/attendance/temporary-upload/submissions/${encodeURIComponent(submissionId)}`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (response.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        setPreviewModalOpen(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.status}`)
      }

      const payload = await response.json()
      console.log("DEBUG Preview payload keys:", Object.keys(payload), "results keys:", payload?.results ? Object.keys(payload.results) : "no results", "siteGroups?:", !!payload?.results?.siteGroups)
      setPreviewData(payload.results || payload.data || payload)
    } catch (error) {
      console.error("Preview error:", error)
      toast.error("Failed to load submission preview")
      setPreviewModalOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const getClientName = (clientId: string) =>
    clients.find((item) => item.id === clientId)?.name ?? clientId

  const getSiteName = (siteId: string, availableSites: SiteOption[]) =>
    availableSites.find((item) => item.id === siteId)?.name ?? siteId

  useEffect(() => {
    if (!client) {
      setClientSites([])
      return
    }

    void loadSitesForClient(client, setClientSites)
  }, [client])


  const loadTemporarySubmissions = async (clientId?: string, siteId?: string) => {
    try {
      setSubmissionsLoading(true)
      const params = new URLSearchParams()
      if (clientId) {
        params.set("clientId", clientId)
      }
      if (siteId) {
        params.set("siteId", siteId)
      }

      const queryString = params.toString()
      const url = queryString 
        ? `/api/attendance/temporary-upload/submissions?${queryString}` 
        : `/api/attendance/temporary-upload/submissions`

      const response = await fetch(withBasePath(url), {
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
        const errorBody = await response.text()
        console.error("DEBUG: Non-OK response body:", errorBody)
        throw new Error(`Failed to fetch temporary submissions: ${response.status}`)
      }

      let payload = await response.json()
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload) } catch (e) {}
      }
      console.log("DEBUG: Raw payload from backend:", payload)
      let items: any[] = []
      if (Array.isArray(payload)) items = payload
      else if (Array.isArray(payload?.data)) items = payload.data
      else if (Array.isArray(payload?.results)) items = payload.results
      else if (Array.isArray(payload?.results?.data)) items = payload.results.data
      console.log("DEBUG: Extracted items length:", items.length)
      // Group by batchSubmissionId
      const batchMap = new Map<string, { client: string; month: string; status: string; submittedAt: string; batchSubmissionId: string; totalRecords: number; siteCount: number }>()
      for (const item of items) {
        const batchId = String(item?.batchSubmissionId ?? item?.submissionId ?? "")
        const existing = batchMap.get(batchId)
        
        const itemSiteCount = Array.isArray(item?.siteGroups) && item.siteGroups.length > 0 
          ? item.siteGroups.length 
          : 1
        const itemRecordsCount = Number(
          item?.processedRecords ?? 
          item?.recordsCount ?? 
          (Array.isArray(item?.siteGroups) ? item.siteGroups.reduce((acc: number, g: any) => acc + Number(g?.recordsCount || 0), 0) : 0)
        )

        if (existing) {
          existing.totalRecords += itemRecordsCount
          existing.siteCount += itemSiteCount
          // If any child is not pending, reflect that
          if (item?.status === "rejected") existing.status = "rejected"
          else if (item?.status === "approved" && existing.status !== "rejected") existing.status = "approved"
        } else {
          batchMap.set(batchId, {
            batchSubmissionId: batchId,
            client: String(item?.clientName ?? item?.clientId ?? ""),
            month: String(item?.month ?? ""),
            status: item?.status === "approved" || item?.status === "rejected" ? item.status : "pending",
            submittedAt: String(item?.submittedAt ?? ""),
            totalRecords: itemRecordsCount,
            siteCount: itemSiteCount,
          })
        }
      }
      setTemporarySubmissions(
        Array.from(batchMap.values()).map((batch) => ({
          id: batch.batchSubmissionId,
          batchSubmissionId: batch.batchSubmissionId,
          client: batch.client,
          site: `${batch.siteCount} sites`,
          month: batch.month,
          records: [],
          recordsCount: batch.totalRecords,
          status: batch.status as "pending" | "approved" | "rejected",
          submittedAt: batch.submittedAt,
          type: "temporary",
        }))
      )
    } catch (error) {
      console.error("Failed to load temporary submissions:", error)
      setTemporarySubmissions([])
      toast.error("Failed to load Attendance Upload 2 submissions")
    } finally {
      setSubmissionsLoading(false)
    }
  }

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

  useEffect(() => {
    void loadTemporarySubmissions(tempClient || undefined, (tempAutoSplitSites ? undefined : tempSite) || undefined)
  }, [tempClient, tempSite, tempAutoSplitSites])

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

      const newUploadId: string | undefined = data?.results?.uploadId
      if (!newUploadId) {
        throw new Error("Upload succeeded but no uploadId was returned")
      }

      const previewRes = await fetch(
        withBasePath(`/api/attendance/manual/upload/${encodeURIComponent(newUploadId)}/preview`),
        { credentials: "include", cache: "no-store" }
      )
      const previewData = await previewRes.json()

      if (previewRes.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }

      if (!previewRes.ok) {
        throw new Error(previewData?.message || "Failed to load parsed attendance preview")
      }

      const records = Array.isArray(previewData?.results?.records) ? previewData.results.records : []

      setUploadId(newUploadId)
      setUploadedData(records)
      toast.success(`Attendance file loaded for ${getClientName(client)} - ${getSiteName(site, sites)} - ${month}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload attendance file")
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTempUpload = async () => {
    if (!tempClient || !tempMonth || !tempFile || (!tempAutoSplitSites && !tempSite)) {
      toast.error(tempAutoSplitSites ? "Please select client, month and upload a file" : "Please select client, site, month and upload a file")
      return
    }

    if (!/\.(csv|xlsx|xls)$/i.test(tempFile.name)) {
      setTempUploadErrors(["Please upload a CSV or Excel file"])
      toast.error("Only CSV or Excel files are supported")
      return
    }

    setTempLoading(true)
    setTempUploadErrors([])

    // Yield to the browser so the loading state renders before blocking parsing
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      const rows = await readWorksheetRows(tempFile)

      if (rows.length < 2) {
        throw new Error("File must contain header and at least one data row")
      }

      const headerRowIndex = findHeaderRowIndex(rows)
      const headers = rows[headerRowIndex].map((header) => normalizeHeader(header))

      const missingColumns = REQUIRED_TEMP_FIELDS.filter((field) => {
        const normalizedAliases = (TEMP_COLUMN_ALIASES[field.key] || []).map((a) => normalizeHeader(a))
        return !headers.some((h) => normalizedAliases.includes(h))
      }).map((field) => field.name)

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
      }

      const parsedRecords = rows
        .slice(headerRowIndex + 1)
        .filter((row) => row.some((value) => String(value ?? "").trim()))
        .map((row, index) => mapTemporaryAttendanceRow(headers, row, headerRowIndex + 2 + index, tempAutoSplitSites ? "" : tempSite))
        .filter((record): record is TemporaryAttendanceRecord => record !== null)

      if (!parsedRecords.length) {
        throw new Error("No attendance rows found in the uploaded file")
      }

      const normalizedRecords = tempAutoSplitSites
        ? buildTemporarySiteGroups(parsedRecords, tempSites).flatMap((group) => group.records)
        : parsedRecords

      setTempUploadedData(normalizedRecords)
      if (tempAutoSplitSites) {
        const siteCount = new Set(normalizedRecords.map((record) => record.new_site_code || record.site_code)).size
        toast.success(`Temporary attendance file loaded for ${getClientName(tempClient)} - ${tempMonth} across ${siteCount} sites`)
      } else {
        toast.success(
          `Temporary attendance file loaded for ${getClientName(tempClient)} - ${getSiteName(tempSite, tempSites)} - ${tempMonth}`,
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse temporary attendance file"
      setTempUploadErrors([message])
      setTempUploadedData([])
      toast.error("Failed to upload temporary attendance file")
    } finally {
      setTempLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedData.length || !uploadId) {
      toast.error("Please upload attendance data first")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(withBasePath("/api/attendance/manual/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uploadId, clientId: client, siteId: site, month }),
      })
      const data = await res.json()

      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit attendance for verification")
      }

      const results = data?.results ?? {}
      const newSubmission: SubmissionRecord = {
        id: results.submissionId ?? uploadId,
        client: getClientName(client),
        site: getSiteName(site, sites),
        month,
        records: uploadedData,
        status: "pending",
        submittedAt: results.submittedAt
          ? new Date(results.submittedAt).toLocaleString("en-IN")
          : new Date().toLocaleString("en-IN"),
        type: "standard",
      }

      setStandardSubmissions((prev) => [newSubmission, ...prev])
      setUploadedData([])
      setUploadId(null)
      setClient("")
      setSite("")
      setMonth("")
      setFile(null)
      toast.success("Attendance submitted for verification")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit attendance for verification")
      console.error("Submit error:", error)
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDownloadJSON = () => {
    if (!tempUploadedData.length) return
    const normalizedRecords = tempAutoSplitSites
      ? buildTemporarySiteGroups(tempUploadedData, tempSites).flatMap((group) => group.records)
      : tempUploadedData.map((record) => ({ ...record, new_site_code: tempSite }))
    const payloadRecords = normalizedRecords.map((r) => ({
      ...r,
      new_branch_code: r.new_branch_code || null,
      new_site_code: r.new_site_code || null,
      new_emp_code: r.new_emp_code || null,
      new_designation_name: r.new_designation_name || null,
      grade: r.grade || null,
      gender: r.gender || "",
    }))
    const payload = { clientId: tempClient, month: tempMonth, records: payloadRecords }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_payload_${tempClient}_${tempMonth.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleTempSubmit = async () => {
    if (!tempUploadedData.length) {
      toast.error("Please upload attendance data first")
      return
    }

    if (!tempClient || !tempMonth || (!tempAutoSplitSites && !tempSite)) {
      toast.error(tempAutoSplitSites ? "Please select client and month" : "Please select client, site, and month")
      return
    }

    const firstRecord = tempUploadedData[0]
    const derivedMonth = firstRecord ? `${firstRecord.month_name} ${firstRecord.year_name}` : "Temporary Upload"
    // Backend requires strict YYYY-MM; the month dropdown only has a bare name.
    // Prefer deriving it from the uploaded file's own month_name/year_name
    // columns (present on every row), falling back to the dropdown value only
    // if that derivation isn't possible (e.g. malformed file).
    const payloadMonth = toYyyyMm(firstRecord?.month_name, firstRecord?.year_name) ?? tempMonth
    const normalizedRecords = tempAutoSplitSites
      ? buildTemporarySiteGroups(tempUploadedData, tempSites).flatMap((group) => group.records)
      : tempUploadedData.map((record) => ({
          ...record,
          new_site_code: tempSite,
        }))

    const payloadRecords = normalizedRecords.map((r) => ({
      ...r,
      new_branch_code: r.new_branch_code || null,
      new_site_code: r.new_site_code || null,
      new_emp_code: r.new_emp_code || null,
      new_designation_name: r.new_designation_name || null,
      grade: r.grade || null,
      gender: r.gender || "",
    }))

    setTempLoading(true)
    try {
      const res = await fetch(withBasePath("/api/attendance/temporary-upload"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          clientId: tempClient,
          month: payloadMonth,
          records: payloadRecords,
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.replace(withBasePath("/login"))
        return
      }

      if (!res.ok) {
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const mappedErrors = data.errors.map((err: string) => {
            const match = err.match(/^Row (\d+):/)
            if (match) {
              const rowIndex = parseInt(match[1]) - 1
              const record = payloadRecords[rowIndex]
              if (record) {
                return err.replace(`Row ${match[1]}`, `Row ${match[1]} (Excel Sr No: ${record.sr_no}, Site: ${record.site_name})`)
              }
            }
            return err
          })
          
          const preview = mappedErrors.slice(0, 50).join("\n")
          const more = mappedErrors.length > 50 ? `\n...and ${mappedErrors.length - 50} more` : ""
          throw new Error(`${data.message || "Validation failed"}:\n${preview}${more}`)
        }
        throw new Error(data?.message || "Failed to submit temporary attendance")
      }

      const submissionId = String(
        data?.batchSubmissionId ??
          data?.id ??
          data?.data?.batchSubmissionId ??
          data?.data?.id ??
          data?.results?.batchSubmissionId ??
          `BATCH${Math.floor(Math.random() * 10000)}`
      )

      setTemporarySubmissions((prev) => [
        {
          id: submissionId,
          batchSubmissionId: submissionId,
          client: getClientName(tempClient),
          site: tempAutoSplitSites ? "Multiple Sites" : getSiteName(tempSite, tempSites),
          month: payloadMonth || derivedMonth,
          records: [],
          recordsCount: normalizedRecords.length,
          status: "pending",
          submittedAt: new Date().toLocaleString("en-IN"),
          type: "temporary",
          tempRecords: normalizedRecords,
        },
        ...prev,
      ])
      setTempUploadedData([])
      setTempClient("")
      setTempSite("")
      setTempMonth("")
      setTempFile(null)
      setTempUploadErrors([])
      setTempClientSites([])
      setTempAutoSplitSites(false)
      if (tempFileInputRef.current) {
        tempFileInputRef.current.value = ""
      }
      toast.success("Temporary attendance submitted successfully")
      void loadTemporarySubmissions(tempClient, tempAutoSplitSites ? undefined : tempSite)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit temporary attendance"
      toast.error(message)
      console.error("Temporary submit error:", error)
    } finally {
      setTempLoading(false)
    }
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
                    <div className="relative" ref={clientDropdownRef}>
                      <button
                        type="button"
                        className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted"
                        onClick={() => setClientDropdownOpen((v) => !v)}
                      >
                        <span className="truncate">
                          {client ? clients.find((c) => c.id === client)?.name || "Select client" : "Select client"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {clientDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search client..."
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {filteredClients.length > 0 ? (
                              filteredClients.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                                  onClick={() => {
                                    handleClientSelect(c.id)
                                    setClientDropdownOpen(false)
                                    setClientSearch("")
                                  }}
                                >
                                  <span>{c.name}</span>
                                  {client === c.id && <span className="text-xs font-semibold text-blue-600">✓</span>}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No clients found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site</label>
                    <div className="relative" ref={siteDropdownRef}>
                      <button
                        type="button"
                        className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setSiteDropdownOpen((v) => !v)}
                        disabled={!client}
                      >
                        <span className="truncate">
                          {site ? sites.find((s) => s.id === site)?.name || "Select site" : "Select site"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {siteDropdownOpen && client && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search site..."
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={siteSearch}
                              onChange={(e) => setSiteSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {filteredSites.length > 0 ? (
                              filteredSites.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                                  onClick={() => {
                                    setSite(s.id)
                                    setSiteDropdownOpen(false)
                                    setSiteSearch("")
                                  }}
                                >
                                  <span>{s.name}</span>
                                  {site === s.id && <span className="text-xs font-semibold text-blue-600">?</span>}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No sites found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                    <Button variant="outline" onClick={() => { setUploadedData([]); setUploadId(null) }} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Standard Submission History</CardTitle>
                <CardDescription>Track your attendance submissions and their verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading && <p className="mb-3 text-sm text-muted-foreground">Loading submissions...</p>}
                {standardSubmissions.length === 0 && !submissionsLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/20">No submission history found.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Submission ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Records</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standardSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.id}</TableCell>
                            <TableCell>{submission.client}</TableCell>
                            <TableCell>{submission.site}</TableCell>
                            <TableCell>{submission.month}</TableCell>
                            <TableCell>{submission.records.length} employees</TableCell>
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
                )}
              </CardContent>
            </Card>
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
                    <div className="relative" ref={tempClientDropdownRef}>
                      <button
                        type="button"
                        className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted"
                        onClick={() => setTempClientDropdownOpen((v) => !v)}
                      >
                        <span className="truncate">
                          {tempClient ? clients.find((c) => c.id === tempClient)?.name || "Select client" : "Select client"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {tempClientDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search client..."
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={tempClientSearch}
                              onChange={(e) => setTempClientSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {filteredTempClients.length > 0 ? (
                              filteredTempClients.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                                  onClick={() => {
                                    setTempClient(c.id)
                                    setTempSite("")
                                    setTempClientDropdownOpen(false)
                                    setTempClientSearch("")
                                  }}
                                >
                                  <span>{c.name}</span>
                                  {tempClient === c.id && <span className="text-xs font-semibold text-blue-600">✓</span>}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No clients found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                    <div className="relative" ref={tempSiteDropdownRef}>
                      <button
                        type="button"
                        className="w-full border rounded-md px-3 py-2 text-left bg-background h-10 text-sm flex items-center justify-between hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setTempSiteDropdownOpen((v) => !v)}
                        disabled={!tempClient || tempAutoSplitSites}
                      >
                        <span className="truncate">
                          {tempAutoSplitSites
                            ? "Auto-detect from file"
                            : tempSite
                              ? tempSites.find((s) => s.id === tempSite)?.name || "Select site"
                              : "Select site"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {tempSiteDropdownOpen && tempClient && !tempAutoSplitSites && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search site..."
                              className="w-full px-2 py-1 border rounded text-sm bg-background"
                              value={tempSiteSearch}
                              onChange={(e) => setTempSiteSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56">
                            {filteredTempSites.length > 0 ? (
                              filteredTempSites.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                                  onClick={() => {
                                    setTempSite(s.id)
                                    setTempSiteDropdownOpen(false)
                                    setTempSiteSearch("")
                                  }}
                                >
                                  <span>{s.name}</span>
                                  {tempSite === s.id && <span className="text-xs font-semibold text-blue-600">?</span>}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No sites found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <input
                    id="temp-auto-split-sites"
                    type="checkbox"
                    className="mt-0.5"
                    checked={tempAutoSplitSites}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setTempAutoSplitSites(checked)
                      if (checked) {
                        setTempSite("")
                        setTempSiteDropdownOpen(false)
                        setTempSiteSearch("")
                      }
                    }}
                  />
                  <label htmlFor="temp-auto-split-sites" className="cursor-pointer leading-5">
                    Auto split by site from file. Use this when one client file contains records for multiple sites.
                  </label>
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

                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Expected Excel columns: `Sr no.`, `BRANCHCODE`, `SITECODE`, `SITENAME`, `SalaryTypeID`,
                  `DESIGNATIONID`, `DESIGNATIONNAME`, `NEW DESIGNATION NAME` (optional), `GRADE` (optional), `GENDER` (optional), `DUTYID`, `DUTYNAME`, `MONTHNAME`, `YEARNAME`, `EMPCODE`,
                  `EMPNAME`, `NORMALDAYS`, `WEEKLYOFF`, `PAIDHOLIDAY`, `OTDAYS`, `OTHOURS`, `SPLOTDAYS`,
                  `SPLOTHOURS`, `PL`, `CL`, and `SL`. In single-site mode, `new site code` comes from the selected site dropdown. In auto-split mode, records are grouped and submitted site-wise from the file.
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
                    {tempAutoSplitSites
                      ? `${getClientName(tempClient)} - ${new Set(tempUploadedData.map((record) => record.new_site_code || record.site_code)).size} sites - ${tempMonth} - ${tempUploadedData.length} records`
                      : `${getClientName(tempClient)} - ${getSiteName(tempSite, tempSites)} - ${tempMonth} - ${tempUploadedData.length} records`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="max-h-[500px] overflow-y-auto rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                        <TableRow className="bg-transparent hover:bg-transparent text-xs whitespace-nowrap">
                          <TableHead>Sr No.</TableHead>
                          <TableHead>Branch Code</TableHead>
                          <TableHead>New Branch Code</TableHead>
                          <TableHead>Site Code</TableHead>
                          <TableHead>New Site Code</TableHead>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Salary Type ID</TableHead>
                          <TableHead>Designation ID</TableHead>
                          <TableHead>Designation Name</TableHead>
                          <TableHead className="font-semibold text-primary">New Designation Name</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Duty ID</TableHead>
                          <TableHead>Duty Name</TableHead>
                          <TableHead>Emp Code</TableHead>
                          <TableHead>New Emp Code</TableHead>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Salary</TableHead>
                          <TableHead className="text-center">Normal</TableHead>
                          <TableHead className="text-center">WO</TableHead>
                          <TableHead className="text-center">PH</TableHead>
                          <TableHead className="text-center">OT Days</TableHead>
                          <TableHead className="text-center">OT Hrs</TableHead>
                          <TableHead className="text-center">Spl OT Days</TableHead>
                          <TableHead className="text-center">Spl OT Hrs</TableHead>
                          <TableHead className="text-center">PL</TableHead>
                          <TableHead className="text-center">CL</TableHead>
                          <TableHead className="text-center">SL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tempUploadedData.map((record, idx) => (
                          <TableRow key={`${record.new_emp_code}-${idx}`} className="text-xs whitespace-nowrap">
                            <TableCell>{record.sr_no}</TableCell>
                            <TableCell>{record.branch_code}</TableCell>
                            <TableCell className="font-medium">{record.new_branch_code}</TableCell>
                            <TableCell>{record.site_code}</TableCell>
                            <TableCell className="font-medium">{record.new_site_code === record.site_code ? "" : record.new_site_code}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={record.site_name}>{record.site_name}</TableCell>
                            <TableCell>{record.salary_type_id}</TableCell>
                            <TableCell>{record.designation_id}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={record.designation_name}>{record.designation_name}</TableCell>
                            <TableCell className="font-medium text-primary max-w-[150px] truncate" title={record.new_designation_name || ""}>{record.new_designation_name || "-"}</TableCell>
                            <TableCell>{record.grade || "-"}</TableCell>
                            <TableCell>{record.gender || "-"}</TableCell>
                            <TableCell>{record.duty_id}</TableCell>
                            <TableCell>{record.duty_name}</TableCell>
                            <TableCell>{record.employee_code}</TableCell>
                            <TableCell className="font-medium">{record.new_emp_code}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={record.employee_name}>{record.employee_name}</TableCell>
                            <TableCell>{record.month_name ? `${record.month_name} ${record.year_name}` : tempMonth}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(record.salary)}</TableCell>
                            <TableCell className="text-center">{record.normal_days}</TableCell>
                            <TableCell className="text-center">{record.weekly_off}</TableCell>
                            <TableCell className="text-center">{record.paid_holiday}</TableCell>
                            <TableCell className="text-center">{record.ismart_ot_days}</TableCell>
                            <TableCell className="text-center">{record.ismart_ot_hrs}</TableCell>
                            <TableCell className="text-center">{record.spl_ot_days}</TableCell>
                            <TableCell className="text-center">{record.spl_ot_hrs}</TableCell>
                            <TableCell className="text-center">{record.pl}</TableCell>
                            <TableCell className="text-center">{record.cl}</TableCell>
                            <TableCell className="text-center">{record.sl}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={handleDownloadJSON}>
                      Download JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempUploadedData([])
                        setTempUploadErrors([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleTempSubmit} disabled={tempLoading}>
                      <Send className="mr-2 h-4 w-4" />
                      {tempLoading ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Attendance Upload 2 Submission History</CardTitle>
                  <CardDescription>Track your temporary attendance submissions and their verification status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadTemporarySubmissions(tempClient || undefined, (tempAutoSplitSites ? undefined : tempSite) || undefined)}>
                  Refresh List
                </Button>
              </CardHeader>
              <CardContent>
                {submissionsLoading && <p className="mb-3 text-sm text-muted-foreground">Loading submissions...</p>}
                {temporarySubmissions.length === 0 && !submissionsLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/20">No temporary submission history found.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Batch ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Sites</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead>Total Records</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {temporarySubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.id}</TableCell>
                            <TableCell>{submission.client}</TableCell>
                            <TableCell>{submission.site}</TableCell>
                            <TableCell>{submission.month}</TableCell>
                            <TableCell>
                              {submission.recordsCount ?? submission.tempRecords?.length ?? 0} employees
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
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handlePreviewSubmission(submission.batchSubmissionId || submission.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-xl">Submission Preview</DialogTitle>
                <DialogDescription>
                  {previewData ? `Client: ${previewData.clientName} | Month: ${previewData.month}` : "Loading..."}
                </DialogDescription>
              </div>
              {previewData && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    {previewData.siteGroups?.length ?? 0} Sites
                  </Badge>
                  <Badge variant="default" className="px-3 py-1 text-xs font-semibold">
                    {previewData.processedRecords ?? previewData.siteGroups?.reduce((acc: number, g: any) => acc + (g.recordsCount || g.records?.length || 0), 0) ?? 0} Records
                  </Badge>
                </div>
              )}
            </div>

            {previewData?.siteGroups && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employee, emp code, site, site code, designation..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {previewSearch && (
                    <button
                      onClick={() => setPreviewSearch("")}
                      className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30 text-xs">
                  <Button
                    variant={previewViewMode === "flat" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setPreviewViewMode("flat")}
                  >
                    Flat Table (All Records)
                  </Button>
                  <Button
                    variant={previewViewMode === "grouped" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setPreviewViewMode("grouped")}
                  >
                    Grouped by Site
                  </Button>
                </div>
              </div>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-auto py-3">
            {previewLoading ? (
              <p className="text-sm text-muted-foreground p-4 text-center">Loading preview data...</p>
            ) : previewData?.siteGroups ? (() => {
                const searchLower = previewSearch.toLowerCase().trim()
                
                // Collect all records flat
                const allFlatRecords: Array<{ record: any; siteName: string; siteId: string }> = []
                previewData.siteGroups.forEach((group: any) => {
                  group.records?.forEach((rec: any) => {
                    allFlatRecords.push({ record: rec, siteName: group.siteName, siteId: group.siteId })
                  })
                })

                const filteredFlatRecords = searchLower
                  ? allFlatRecords.filter(
                      ({ record, siteName, siteId }) =>
                        (record.employee_name || "").toLowerCase().includes(searchLower) ||
                        (record.employee_code || "").toLowerCase().includes(searchLower) ||
                        (record.designation_name || "").toLowerCase().includes(searchLower) ||
                        (record.site_name || "").toLowerCase().includes(searchLower) ||
                        (record.site_code || "").toLowerCase().includes(searchLower) ||
                        (siteName || "").toLowerCase().includes(searchLower) ||
                        (siteId || "").toLowerCase().includes(searchLower)
                    )
                  : allFlatRecords

                if (previewViewMode === "flat") {
                  return (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground px-1 flex justify-between items-center">
                        <span>Showing {filteredFlatRecords.length} of {allFlatRecords.length} records</span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                            <TableRow className="bg-transparent hover:bg-transparent text-xs whitespace-nowrap">
                              <TableHead>Branch Code</TableHead>
                              <TableHead>New Branch Code</TableHead>
                              <TableHead>Site Code</TableHead>
                              <TableHead>New Site Code</TableHead>
                              <TableHead>Site Name</TableHead>
                              <TableHead>Emp Code</TableHead>
                              <TableHead>New Emp Code</TableHead>
                              <TableHead>Employee Name</TableHead>
                              <TableHead>Designation</TableHead>
                              <TableHead>New Designation Name</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Duty</TableHead>
                              <TableHead>Month</TableHead>
                              <TableHead className="text-right">Salary</TableHead>
                              <TableHead className="text-center">Normal</TableHead>
                              <TableHead className="text-center">WO</TableHead>
                              <TableHead className="text-center">PH</TableHead>
                              <TableHead className="text-center">OT Days</TableHead>
                              <TableHead className="text-center">OT Hrs</TableHead>
                              <TableHead className="text-center">SPL OT Days</TableHead>
                              <TableHead className="text-center">SPL OT Hrs</TableHead>
                              <TableHead className="text-center">PL</TableHead>
                              <TableHead className="text-center">CL</TableHead>
                              <TableHead className="text-center">SL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredFlatRecords.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={20} className="text-center py-8 text-muted-foreground text-xs">
                                  No records matching "{previewSearch}"
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredFlatRecords.map(({ record, siteName }, idx) => (
                                <TableRow key={idx} className="text-xs hover:bg-muted/40 whitespace-nowrap">
                                  <TableCell>{record.branch_code || "-"}</TableCell>
                                  <TableCell className="font-medium">{record.new_branch_code || "-"}</TableCell>
                                  <TableCell>{record.site_code || "-"}</TableCell>
                                  <TableCell className="font-medium">{record.new_site_code || record.site_code || "-"}</TableCell>
                                  <TableCell className="font-medium">{record.site_name || siteName || "-"}</TableCell>
                                  <TableCell>{record.employee_code || "-"}</TableCell>
                                  <TableCell className="font-medium">{record.new_emp_code || "-"}</TableCell>
                                  <TableCell className="font-semibold text-foreground">{record.employee_name || "-"}</TableCell>
                                  <TableCell>{record.designation_name || "-"}</TableCell>
                                  <TableCell className="font-medium">{record.new_designation_name || "-"}</TableCell>
                                  <TableCell>{record.grade || "-"}</TableCell>
                                  <TableCell>{record.gender || "-"}</TableCell>
                                  <TableCell>{record.duty_name || "-"}</TableCell>
                                  <TableCell>{record.month_name} {record.year_name}</TableCell>
                                  <TableCell className="text-right font-medium">{formatCurrency(record.salary)}</TableCell>
                                  <TableCell className="text-center">{record.normal_days}</TableCell>
                                  <TableCell className="text-center">{record.weekly_off}</TableCell>
                                  <TableCell className="text-center">{record.paid_holiday}</TableCell>
                                  <TableCell className="text-center">{record.ismart_ot_days ?? 0}</TableCell>
                                  <TableCell className="text-center">{record.ismart_ot_hrs ?? 0}</TableCell>
                                  <TableCell className="text-center">{record.spl_ot_days ?? 0}</TableCell>
                                  <TableCell className="text-center">{record.spl_ot_hrs ?? 0}</TableCell>
                                  <TableCell className="text-center">{record.pl ?? 0}</TableCell>
                                  <TableCell className="text-center">{record.cl}</TableCell>
                                  <TableCell className="text-center">{record.sl}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )
                }

                // Grouped view
                const filteredGroups = previewData.siteGroups
                  .map((group: any) => {
                    const records = searchLower
                      ? group.records?.filter(
                          (rec: any) =>
                            (rec.employee_name || "").toLowerCase().includes(searchLower) ||
                            (rec.employee_code || "").toLowerCase().includes(searchLower) ||
                            (rec.designation_name || "").toLowerCase().includes(searchLower) ||
                            (group.siteName || "").toLowerCase().includes(searchLower) ||
                            (group.siteId || "").toLowerCase().includes(searchLower)
                        )
                      : group.records
                    return { ...group, records }
                  })
                  .filter((group: any) => group.records?.length > 0)

                return (
                  <div className="space-y-6">
                    {filteredGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No site groups matching "{previewSearch}"</p>
                    ) : (
                      filteredGroups.map((group: any) => (
                        <div key={group.siteId} className="space-y-2">
                          <h3 className="font-semibold text-sm flex items-center justify-between border-b pb-1">
                            <span>{group.siteName} <span className="text-xs text-muted-foreground font-normal">(ID: {group.siteId})</span></span>
                            <Badge variant="outline" className="text-xs">{group.records?.length || 0} records</Badge>
                          </h3>
                          <div className="overflow-x-auto rounded-lg border">
                            <Table>
                              <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                                <TableRow className="bg-transparent hover:bg-transparent text-xs whitespace-nowrap">
                                  <TableHead>Branch Code</TableHead>
                                  <TableHead>New Branch Code</TableHead>
                                  <TableHead>Site Code</TableHead>
                                  <TableHead>New Site Code</TableHead>
                                  <TableHead>Site Name</TableHead>
                                  <TableHead>Emp Code</TableHead>
                                  <TableHead>New Emp Code</TableHead>
                                  <TableHead>Employee Name</TableHead>
                                  <TableHead>Designation</TableHead>
                                  <TableHead>New Designation Name</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead>Gender</TableHead>
                                  <TableHead>Duty</TableHead>
                                  <TableHead>Month</TableHead>
                                  <TableHead className="text-right">Salary</TableHead>
                                  <TableHead className="text-center">Normal</TableHead>
                                  <TableHead className="text-center">WO</TableHead>
                                  <TableHead className="text-center">PH</TableHead>
                                  <TableHead className="text-center">OT Days</TableHead>
                                  <TableHead className="text-center">OT Hrs</TableHead>
                                  <TableHead className="text-center">SPL OT Days</TableHead>
                                  <TableHead className="text-center">SPL OT Hrs</TableHead>
                                  <TableHead className="text-center">PL</TableHead>
                                  <TableHead className="text-center">CL</TableHead>
                                  <TableHead className="text-center">SL</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.records.map((record: any, idx: number) => (
                                  <TableRow key={idx} className="text-xs hover:bg-muted/40 whitespace-nowrap">
                                    <TableCell>{record.branch_code || "-"}</TableCell>
                                    <TableCell className="font-medium">{record.new_branch_code || "-"}</TableCell>
                                    <TableCell>{record.site_code || "-"}</TableCell>
                                    <TableCell className="font-medium">{record.new_site_code || record.site_code || "-"}</TableCell>
                                    <TableCell className="font-medium">{record.site_name || group.siteName || "-"}</TableCell>
                                    <TableCell>{record.employee_code || "-"}</TableCell>
                                    <TableCell className="font-medium">{record.new_emp_code || "-"}</TableCell>
                                    <TableCell className="font-semibold text-foreground">{record.employee_name || "-"}</TableCell>
                                    <TableCell>{record.designation_name || "-"}</TableCell>
                                    <TableCell className="font-medium">{record.new_designation_name || "-"}</TableCell>
                                    <TableCell>{record.grade || "-"}</TableCell>
                                    <TableCell>{record.gender || "-"}</TableCell>
                                    <TableCell>{record.duty_name || "-"}</TableCell>
                                    <TableCell>{record.month_name} {record.year_name}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(record.salary)}</TableCell>
                                    <TableCell className="text-center">{record.normal_days}</TableCell>
                                    <TableCell className="text-center">{record.weekly_off}</TableCell>
                                    <TableCell className="text-center">{record.paid_holiday}</TableCell>
                                    <TableCell className="text-center">{record.ismart_ot_days ?? 0}</TableCell>
                                    <TableCell className="text-center">{record.ismart_ot_hrs ?? 0}</TableCell>
                                    <TableCell className="text-center">{record.spl_ot_days ?? 0}</TableCell>
                                    <TableCell className="text-center">{record.spl_ot_hrs ?? 0}</TableCell>
                                    <TableCell className="text-center">{record.pl ?? 0}</TableCell>
                                    <TableCell className="text-center">{record.cl}</TableCell>
                                    <TableCell className="text-center">{record.sl}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              })() : (
              <p className="text-sm text-muted-foreground p-4 text-center">No data available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
  const normalizedAliases = aliases.map((a) => normalizeHeader(a))
  const index = headers.findIndex((header) => normalizedAliases.includes(header))
  return index >= 0 ? row[index] ?? "" : ""
}

function mapTemporaryAttendanceRow(
  headers: string[],
  row: string[],
  rowNumber: number,
  selectedSiteId: string,
): TemporaryAttendanceRecord | null {
  const employeeName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.employee_name)
  const branchCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.branch_code)
  const siteCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.site_code)
  const employeeCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.employee_code)
  const designationId = getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_id)
  const designationName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.designation_name)
  const newDesignationName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.new_designation_name)
  const dutyId = getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_id)
  const dutyName = getCellValue(headers, row, TEMP_COLUMN_ALIASES.duty_name)
  
  const explicitNewBranchCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.new_branch_code)
  const newBranchCode = explicitNewBranchCode || autoBranchCode()
  
  let explicitNewSiteCode = String(getCellValue(headers, row, TEMP_COLUMN_ALIASES.new_site_code))
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[^\x20-\x7E]/g, '') // Remove all non-ASCII printable characters
    .trim()
  const upperSiteCode = explicitNewSiteCode.toUpperCase()
  if (
    upperSiteCode === "NOT FOUND" ||
    upperSiteCode === "#N/A" ||
    upperSiteCode.startsWith("#REF") ||
    upperSiteCode.startsWith("#VALUE") ||
    upperSiteCode.startsWith("#NAME")
  ) {
    return null
  }
  const newSiteCode = explicitNewSiteCode || autoSiteCode(selectedSiteId)
  
  const explicitNewEmpCode = getCellValue(headers, row, TEMP_COLUMN_ALIASES.new_emp_code)
  const newEmpCode = explicitNewEmpCode || autoEmpCode()
  
  const rawGender = String(getCellValue(headers, row, TEMP_COLUMN_ALIASES.gender) || "").trim()
  let gender = ""
  if (rawGender) {
    const lower = rawGender.toLowerCase()
    if (lower === "f" || lower === "female" || lower === "w" || lower === "woman") {
      gender = "Female"
    } else if (lower === "m" || lower === "male" || lower === "man") {
      gender = "Male"
    } else if (lower === "t" || lower === "transgender" || lower === "other" || lower === "o") {
      gender = "Other"
    } else {
      gender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1)
    }
  }
  
  const salary = toNumber(getCellValue(headers, row, TEMP_COLUMN_ALIASES.salary))

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
    designation_id: designationId,
    designation_name: designationName,
    new_designation_name: newDesignationName,
    grade: getCellValue(headers, row, TEMP_COLUMN_ALIASES.grade),
    gender,
    duty_id: dutyId,
    duty_name: dutyName,
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

