"use client"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, FileText, CalendarIcon, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const statutoryReports = [
  {
    id: "pf-ecr",
    title: "PF ECR",
    description: "Provident Fund Electronic Challan cum Return",
    format: "Excel",
    lastGenerated: "2024-01-15",
    status: "generated",
    dueDate: "2024-01-25",
  },
  {
    id: "esic-xml",
    title: "ESIC XML",
    description: "Employee State Insurance Corporation XML file",
    format: "XML",
    lastGenerated: "2024-01-15",
    status: "generated",
    dueDate: "2024-01-21",
  },
  {
    id: "form16",
    title: "Form 16",
    description: "Tax Deduction at Source Certificate",
    format: "PDF",
    lastGenerated: "2024-01-10",
    status: "generated",
    dueDate: "2024-05-31",
  },
  {
    id: "tds-return",
    title: "TDS Return",
    description: "Tax Deducted at Source Return",
    format: "Excel",
    lastGenerated: null,
    status: "pending",
    dueDate: "2024-01-31",
  },
  {
    id: "labour-return",
    title: "Labour Return",
    description: "Contract Labour Return",
    format: "PDF",
    lastGenerated: "2024-01-12",
    status: "generated",
    dueDate: "2024-01-20",
  },
]

export default function StatutoryPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedSite, setSelectedSite] = useState("all")
  const [pfClient, setPfClient] = useState<string>("")
  const [pfSite, setPfSite] = useState<string>("")
  const [pfMonth, setPfMonth] = useState<Date | undefined>(undefined)
  const [esicClient, setEsicClient] = useState<string>("")
  const [esicSite, setEsicSite] = useState<string>("")
  const [esicMonth, setEsicMonth] = useState<Date | undefined>(undefined)

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "pending"

    if (isOverdue) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Overdue
        </Badge>
      )
    }

    const statusConfig = {
      generated: { label: "Generated", className: "bg-green-100 text-green-800" },
      pending: { label: "Pending", className: "bg-orange-100 text-orange-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleGenerateReport = (reportId: string) => {
    console.log("Generating report:", reportId)
    // API call to generate report
  }

  const handleGeneratePfEcr = () => {
    if (!pfClient || !pfSite || !pfMonth) {
      console.log("[v0] Please select Client, Site, and Month to generate PF ECR.")
      return
    }
    const periodLabel = format(pfMonth, "MMM-yyyy")
    const filename = `PF-ECR_${pfClient}_${pfSite}_${periodLabel}.csv`.replace(/\s+/g, "-")

    // Stub CSV rows (replace with real data later)
    const header = [
      "UAN",
      "Member Name",
      "EPF Wages",
      "EPS Wages",
      "EDLI Wages",
      "EPF Contribution",
      "EPS Contribution",
      "NCP Days",
      "Month",
    ]
    const rows = [
      ["100200300400", "John Doe", "15000", "15000", "15000", "1800", "1250", "0", periodLabel],
      ["200300400500", "Asha Devi", "18000", "15000", "18000", "2160", "1250", "1", periodLabel],
      ["300400500600", "Ramesh Kumar", "20000", "15000", "20000", "2400", "1250", "0", periodLabel],
    ]

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleGenerateEsicXml = () => {
    if (!esicClient || !esicSite || !esicMonth) {
      console.log("[v0] Please select Client, Site, and Month to generate ESIC XML.")
      return
    }
    const periodLabel = format(esicMonth, "MMM-yyyy")
    const periodCode = format(esicMonth, "yyyyMM")
    const filename = `ESIC_${esicClient}_${esicSite}_${periodLabel}.xml`.replace(/\s+/g, "-")

    // Simple XML stub (replace with real rows later)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ESIC>
  <Period>${periodCode}</Period>
  <EmployerCode>ESI-XXXXXXX</EmployerCode>
  <Contributions>
    <IP>
      <IPNumber>1002003004</IPNumber>
      <IPName>John Doe</IPName>
      <Wages>20000</Wages>
      <Days>26</Days>
      <EmployeeContribution>260</EmployeeContribution>
      <EmployerContribution>260</EmployerContribution>
    </IP>
    <IP>
      <IPNumber>2003004005</IPNumber>
      <IPName>Asha Devi</IPName>
      <Wages>18000</Wages>
      <Days>25</Days>
      <EmployeeContribution>234</EmployeeContribution>
      <EmployerContribution>234</EmployerContribution>
    </IP>
  </Contributions>
</ESIC>`

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownloadReport = (reportId: string) => {
    console.log("Downloading report:", reportId)
    // API call to download report
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not generated"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statutory Reports</h1>
            <p className="text-muted-foreground">Generate and manage compliance reports</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Generated</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statutoryReports.filter((r) => r.status === "generated").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statutoryReports.filter((r) => r.status === "pending").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-foreground">
                    {statutoryReports.filter((r) => r.status === "pending" && new Date(r.dueDate) < new Date()).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">6</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

    

        {/* Reports Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statutoryReports.map((report) => (
            <Card key={report.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{report.title}</CardTitle>
                  {/* {getStatusBadge(report.status, report.dueDate)} */}
                </div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="text-foreground">{report.format}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span className="text-foreground">{formatDate(report.lastGenerated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span
                      className={cn(
                        "font-medium",
                        new Date(report.dueDate) < new Date() && report.status === "pending"
                          ? "text-red-600"
                          : "text-foreground",
                      )}
                    >
                      {formatDate(report.dueDate)}
                    </span>
                  </div> */}
                </div>

                {report.id === "pf-ecr" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <Select value={pfClient} onValueChange={setPfClient}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client-a">Client A</SelectItem>
                          <SelectItem value="client-b">Client B</SelectItem>
                          <SelectItem value="client-c">Client C</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={pfSite} onValueChange={setPfSite}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="site-a">Site A - Corporate</SelectItem>
                          <SelectItem value="site-b">Site B - Manufacturing</SelectItem>
                          <SelectItem value="site-c">Site C - Warehouse</SelectItem>
                        </SelectContent>
                      </Select>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !pfMonth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pfMonth ? format(pfMonth, "MMMM yyyy") : <span>Select month</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pfMonth}
                            onSelect={(date) => date && setPfMonth(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleGeneratePfEcr}
                        className="flex-1"
                        disabled={!pfClient || !pfSite || !pfMonth}
                        title={!pfClient || !pfSite || !pfMonth ? "Select Client, Site & Month" : "Generate PF ECR"}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate PF ECR
                      </Button>
                      {report.status === "generated" && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select Client, Site, and Month to generate the PF ECR file.
                    </p>
                  </div>
                ) : report.id === "esic-xml" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <Select value={esicClient} onValueChange={setEsicClient}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client-a">Client A</SelectItem>
                          <SelectItem value="client-b">Client B</SelectItem>
                          <SelectItem value="client-c">Client C</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={esicSite} onValueChange={setEsicSite}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="site-a">Site A - Corporate</SelectItem>
                          <SelectItem value="site-b">Site B - Manufacturing</SelectItem>
                          <SelectItem value="site-c">Site C - Warehouse</SelectItem>
                        </SelectContent>
                      </Select>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !esicMonth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {esicMonth ? format(esicMonth, "MMMM yyyy") : <span>Select month</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={esicMonth}
                            onSelect={(date) => date && setEsicMonth(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleGenerateEsicXml}
                        className="flex-1"
                        disabled={!esicClient || !esicSite || !esicMonth}
                        title={
                          !esicClient || !esicSite || !esicMonth ? "Select Client, Site & Month" : "Generate ESIC XML"
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate ESIC XML
                      </Button>
                      {report.status === "generated" && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select Client, Site, and Month to generate the ESIC XML file.
                    </p>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleGenerateReport(report.id)} className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                    {report.status === "generated" && (
                      <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compliance Calendar */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Compliance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { date: "15th", task: "PF ECR & ESIC Return", status: "completed" },
                { date: "20th", task: "Labour Return Filing", status: "completed" },
                { date: "25th", task: "PF Challan Payment", status: "pending" },
                { date: "31st", task: "TDS Return", status: "pending" },
                { date: "7th", task: "ESIC Challan Payment", status: "upcoming" },
                { date: "15th", task: "Salary Register Update", status: "upcoming" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border",
                    item.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : item.status === "pending"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-blue-50 border-blue-200",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                      item.status === "completed"
                        ? "bg-green-500 text-white"
                        : item.status === "pending"
                          ? "bg-orange-500 text-white"
                          : "bg-blue-500 text-white",
                    )}
                  >
                    {item.date}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.status === "completed"
                          ? "text-green-800"
                          : item.status === "pending"
                            ? "text-orange-800"
                            : "text-blue-800",
                      )}
                    >
                      {item.task}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
