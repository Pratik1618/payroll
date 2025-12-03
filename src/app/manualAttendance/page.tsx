"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload } from "lucide-react"

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

export default function ManualAttendanceUploadPage() {
  const [client, setClient] = useState("")
  const [site, setSite] = useState("")
  const [month, setMonth] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadedData, setUploadedData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)

  const clients = ["Acme Corp", "Tech Solutions", "Global Services"]
  const sites = client ? ["Site A", "Site B", "Site C"] : []
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!client || !site || !month || !file) {
      toast.error("Please select client, site, month and upload a file")
      return
    }

    setLoading(true)
    try {
      // Simulate file parsing - in real implementation, use a library like xlsx
      const mockData: AttendanceRecord[] = [
        {
          employee_id: "EMP001",
          employee_name: "John Doe",
          present_days: 20,
          weekly_off: 4,
          national_holidays: 2,
          holiday: 1,
          comp_off: 0,
          leave: 1,
          absent: 0,
          half_day: 1,
          ot_hrs: 8,
          total_payable_days: 25,
        },
        {
          employee_id: "EMP002",
          employee_name: "Jane Smith",
          present_days: 19,
          weekly_off: 4,
          national_holidays: 2,
          holiday: 1,
          comp_off: 1,
          leave: 0,
          absent: 2,
          half_day: 0,
          ot_hrs: 4,
          total_payable_days: 24,
        },
        {
          employee_id: "EMP003",
          employee_name: "Mike Johnson",
          present_days: 21,
          weekly_off: 4,
          national_holidays: 2,
          holiday: 1,
          comp_off: 0,
          leave: 0,
          absent: 0,
          half_day: 2,
          ot_hrs: 12,
          total_payable_days: 26,
        },
      ]
      setUploadedData(mockData)
      toast.success(`Attendance file uploaded for ${client} - ${site} - ${month}`)
    } catch (error) {
      toast.error("Failed to upload attendance file")
      console.error("[v0] Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manual Attendance Upload</h1>
          <p className="text-muted-foreground mt-2">Upload attendance data via Excel file</p>
        </div>

        {/* Upload Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Attendance File</CardTitle>
            <CardDescription>Select client, site, and month, then upload your Excel file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Site</label>
                <Select value={site} onValueChange={setSite} disabled={!client}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month Select */}
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

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File</label>
              <div className="flex items-center gap-3">
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="flex-1" />
                {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
              </div>
            </div>

            {/* Upload Button */}
            <Button onClick={handleUpload} disabled={loading} className="w-full md:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Uploading..." : "Upload File"}
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Data Table */}
        {uploadedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Attendance Data</CardTitle>
              <CardDescription>
                {client} • {site} • {month} • {uploadedData.length} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
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
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
