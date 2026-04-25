"use client"

import { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface SalaryRow {
  employeeId: string
  employeeName: string
  department: string
  basic: number
  hra: number
  specialAllowance: number
  conveyanceAllowance: number
  medicalAllowance: number
  pfDeduction: number
  esicDeduction: number
  professionalTax: number
  tds: number
}

interface SalaryUploadProps {
  selectedEmployee?: {
    id: string
    name: string
    code: string
  }
  onUpload: (salary: SalaryRow) => void
}

export function SalaryUpload({ selectedEmployee, onUpload }: SalaryUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedData, setUploadedData] = useState<SalaryRow | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseExcelFile = async (file: File) => {
    try {
      setIsLoading(true)
      setErrors([])

      if (!selectedEmployee) {
        setErrors(["Select an employee before uploading salary."])
        return
      }

      const isExcel = /\.(xlsx|xls)$/i.test(file.name)
      let rows: string[][] = []

      if (isExcel) {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[]
        rows = rawRows.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "").trim()) : []))
      } else {
        const text = await file.text()
        rows = text
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.split(",").map((value) => value.trim()))
      }

      if (rows.length < 2) {
        setErrors(["File must contain header and at least one data row"])
        return
      }

      const headers = rows[0].map((h) => String(h).trim().toLowerCase().replace(/\s+/g, ""))
      const requiredColumns = [
        "employeeid",
        "employeename",
        "department",
        "basic",
        "hra",
        "specialallowance",
        "conveyanceallowance",
        "medicalallowance",
      ]

      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
      if (missingColumns.length > 0) {
        setErrors([
          `Missing required columns: ${missingColumns.join(", ")}`,
          `Expected columns: ${requiredColumns.join(", ")}`,
        ])
        return
      }

      const salaryRows: SalaryRow[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].map((value) => String(value ?? "").trim())
        const row: Record<string, string> = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        if (!row.employeeid || !row.employeename) {
          parseErrors.push(`Row ${i + 1}: Missing employee ID or name`)
          continue
        }

        const salary: SalaryRow = {
          employeeId: row.employeeid,
          employeeName: row.employeename,
          department: row.department || "N/A",
          basic: parseFloat(row.basic) || 0,
          hra: parseFloat(row.hra) || 0,
          specialAllowance: parseFloat(row.specialallowance) || 0,
          conveyanceAllowance: parseFloat(row.conveyanceallowance) || 0,
          medicalAllowance: parseFloat(row.medicalallowance) || 0,
          pfDeduction: parseFloat(row.pfdeduction) || 0,
          esicDeduction: parseFloat(row.esicdeduction) || 0,
          professionalTax: parseFloat(row.professionaltax) || 0,
          tds: parseFloat(row.tds) || 0,
        }

        if (salary.basic <= 0) {
          parseErrors.push(`Row ${i + 1}: Basic salary must be greater than 0`)
          continue
        }

        salaryRows.push(salary)
      }

      const matchingRows = salaryRows.filter(
        (row) =>
          row.employeeId === selectedEmployee.code ||
          row.employeeName.toLowerCase() === selectedEmployee.name.toLowerCase(),
      )

      if (matchingRows.length === 0) {
        setErrors([
          `No salary row found for ${selectedEmployee.name}. Please upload a file containing only that employee's salary details.`,
        ])
        return
      }

      if (matchingRows.length > 1) {
        setErrors([
          `Multiple salary rows found for ${selectedEmployee.name}. Please upload a single-row file for this employee.`,
        ])
        return
      }

      const salary = matchingRows[0]
      setUploadedData(salary)

      if (parseErrors.length > 0) {
        setErrors(parseErrors)
        toast.warning(`Loaded salary details for ${selectedEmployee.name} with ${parseErrors.length} warnings`)
      } else {
        toast.success(`Loaded salary details for ${selectedEmployee.name}`)
      }

      onUpload(salary)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to parse file"
      setErrors([errorMessage])
      toast.error("Failed to upload file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        setErrors(["Please upload a CSV or Excel file"])
        toast.error("Only CSV or Excel files are supported")
        return
      }
      parseExcelFile(file)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "employeeId",
      "employeeName",
      "department",
      "basic",
      "hra",
      "specialAllowance",
      "conveyanceAllowance",
      "medicalAllowance",
      "pfDeduction",
      "esicDeduction",
      "professionalTax",
      "tds",
    ]

    const sampleData = [
      [
        "EMP001",
        "John Doe",
        "Engineering",
        "50000",
        "25000",
        "10000",
        "2000",
        "1000",
        "3000",
        "1500",
        "200",
        "0",
      ],
      [
        "EMP002",
        "Jane Smith",
        "Finance",
        "60000",
        "30000",
        "12000",
        "2500",
        "1200",
        "3600",
        "1800",
        "200",
        "500",
      ],
    ]

    const csv = [headers, ...sampleData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "salary_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Salary for Employee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {selectedEmployee
              ? `Drop Excel or CSV salary file for ${selectedEmployee.name} here or click to browse`
              : "Select an employee to enable salary upload."}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, XLS, and XLSX salary files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!selectedEmployee}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Download Template
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="sm"
            className="flex-1"
          >
            {isLoading ? "Processing..." : "Select File"}
          </Button>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
            {errors.map((error, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            ))}
          </div>
        )}

        {uploadedData && (
          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-900">
                Successfully loaded salary details for {uploadedData.employeeName}
              </p>
            </div>
            <div className="text-xs text-green-800">
              <p>
                Gross: ₹{(
                  uploadedData.basic +
                  uploadedData.hra +
                  uploadedData.specialAllowance +
                  uploadedData.conveyanceAllowance +
                  uploadedData.medicalAllowance
                ).toLocaleString()}
              </p>
              <p>Department: {uploadedData.department}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
