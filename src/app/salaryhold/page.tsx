"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

interface HoldRecord {
  month: string
  isHeld: boolean
}

interface EmployeeHoldData {
  employeeId: string
  employeeName: string
  department: string
  holdRecords: { [key: string]: HoldRecord }
}

// ------------------------------------------------------------
// MOCK EMPLOYEES
// ------------------------------------------------------------

const mockEmployees = [
  { employeeId: "EMP001", employeeName: "Rahul Kumar", department: "Operations" },
  { employeeId: "EMP002", employeeName: "Priya Singh", department: "HR" },
  { employeeId: "EMP003", employeeName: "Amit Patel", department: "Finance" },
  { employeeId: "EMP004", employeeName: "Neha Sharma", department: "IT" },
  { employeeId: "EMP005", employeeName: "Vikram Desai", department: "Operations" },
]

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const getMonthIndex = (monthString: string): number => {
  const [monthName] = monthString.split(" ")
  const map: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  }
  return map[monthName]
}

const isMonthEditable = (monthString: string): boolean => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const [_, yearStr] = monthString.split(" ")
  const monthYear = Number(yearStr)
  const monthIndex = getMonthIndex(monthString)

  if (monthYear < currentYear) return false
  if (monthYear > currentYear) return true
  return monthIndex >= currentMonth
}

const getMonthsForYear = (year: number) => {
  const base = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ]
  return base.map((m) => `${m} ${year}`)
}

// Generate template data
const generateTemplate = () => {
  const currentYear = new Date().getFullYear()
  const months = getMonthsForYear(currentYear)

  const data = mockEmployees.flatMap((emp) =>
    months.map((month) => ({
      "Employee ID": emp.employeeId,
      "Employee Name": emp.employeeName,
      Department: emp.department,
      Month: month,
      Status: "Release", // or "Hold"
    }))
  )

  return data
}

// Download template
const downloadTemplate = () => {
  const data = generateTemplate()
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Salary Hold Template")

  // Set column widths
  ws["!cols"] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
  ]

  XLSX.writeFile(wb, "salary_hold_template.xlsx")
  toast.success("Template downloaded successfully!")
}

// Parse and apply Excel data
const parseExcelData = async (
  file: File,
  employeeHoldData: Record<string, EmployeeHoldData>
): Promise<Record<string, EmployeeHoldData> | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(ws) as Array<{
          "Employee ID": string
          Month: string
          Status: string
        }>

        if (!jsonData || jsonData.length === 0) {
          toast.error("Excel file is empty or invalid format.")
          resolve(null)
          return
        }

        const updated = JSON.parse(JSON.stringify(employeeHoldData))
        let successCount = 0

        jsonData.forEach((row) => {
          const empId = row["Employee ID"]?.trim()
          const month = row["Month"]?.trim()
          const status = row["Status"]?.trim().toLowerCase()

          if (!empId || !month || !status) return

          if (!updated[empId]) {
            toast.warning(`Employee ID ${empId} not found. Skipping.`)
            return
          }

          if (!isMonthEditable(month)) {
            toast.warning(`${month} is locked and cannot be modified.`)
            return
          }

          const isHeld = status === "hold"
          updated[empId].holdRecords[month] = { month, isHeld }
          successCount++
        })

        toast.success(`Successfully updated ${successCount} records from Excel!`)
        resolve(updated)
      } catch (error) {
        toast.error("Error parsing Excel file. Please check the format.")
        console.error(error)
        resolve(null)
      }
    }

    reader.readAsArrayBuffer(file)
  })
}

// ------------------------------------------------------------
// MAIN PAGE
// ------------------------------------------------------------

export default function SalaryHoldPage() {
  const currentSystemYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentSystemYear)
  const [selectedEmployee, setSelectedEmployee] = useState("EMP001")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [employeeHoldData, setEmployeeHoldData] = useState<Record<string, EmployeeHoldData>>(() => {
    const data: Record<string, EmployeeHoldData> = {}

    mockEmployees.forEach((emp) => {
      const records: Record<string, HoldRecord> = {}

      getMonthsForYear(currentSystemYear).forEach((m) => {
        records[m] = { month: m, isHeld: false }
      })

      data[emp.employeeId] = { ...emp, holdRecords: records }
    })

    return data
  })

  useEffect(() => {
    const stored = localStorage.getItem("employeeHoldData")
    if (stored) {
      setEmployeeHoldData(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("employeeHoldData", JSON.stringify(employeeHoldData))
  }, [employeeHoldData])

  useEffect(() => {
    setEmployeeHoldData((prev) => {
      const updated = { ...prev }

      mockEmployees.forEach((emp) => {
        const employee = updated[emp.employeeId]
        const months = getMonthsForYear(selectedYear)

        months.forEach((m) => {
          if (!employee.holdRecords[m]) {
            employee.holdRecords[m] = { month: m, isHeld: false }
          }
        })
      })

      return updated
    })
  }, [selectedYear])

  const months = getMonthsForYear(selectedYear)
  const currentEmployee = employeeHoldData[selectedEmployee]
  const heldCount = Object.values(currentEmployee.holdRecords).filter((r) => r.isHeld).length

  const toggleHold = (month: string) => {
    if (!isMonthEditable(month)) {
      toast.error("Past months are locked and cannot be edited.")
      return
    }

    const previous = currentEmployee.holdRecords[month].isHeld
    const newState = !previous

    setEmployeeHoldData((prev) => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        holdRecords: {
          ...prev[selectedEmployee].holdRecords,
          [month]: { month, isHeld: newState },
        },
      },
    }))

    toast.success(newState ? `Salary held for ${month}` : `Salary released for ${month}`)
  }

  const holdAllMonths = () => {
    const updated = { ...currentEmployee.holdRecords }

    months.forEach((m) => {
      if (isMonthEditable(m)) updated[m].isHeld = true
    })

    setEmployeeHoldData((prev) => ({
      ...prev,
      [selectedEmployee]: { ...prev[selectedEmployee], holdRecords: updated },
    }))

    toast.success("All editable months held.")
  }

  const releaseAllMonths = () => {
    const updated = { ...currentEmployee.holdRecords }

    months.forEach((m) => {
      if (isMonthEditable(m)) updated[m].isHeld = false
    })

    setEmployeeHoldData((prev) => ({
      ...prev,
      [selectedEmployee]: { ...prev[selectedEmployee], holdRecords: updated },
    }))

    toast.success("All editable months released.")
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const result = await parseExcelData(file, employeeHoldData)
    if (result) {
      setEmployeeHoldData(result)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Salary Hold / Unhold</h1>
            <p className="text-muted-foreground">Manage monthly salary hold settings</p>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Excel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Excel file to update multiple employees</p>
                  <p className="text-xs text-muted-foreground mt-1">Format: Employee ID, Month, Status</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Excel template with all employees</p>
                  <p className="text-xs text-muted-foreground mt-1">Fill in Status column and upload back</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* EMPLOYEE DROPDOWN */}
        <Card>
          <CardHeader>
            <CardTitle>Select Employee</CardTitle>
            <CardDescription>Search inside dropdown</CardDescription>
          </CardHeader>

          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full max-w-md justify-between">
                  {currentEmployee.employeeName} ({currentEmployee.employeeId})
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full max-w-md p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." />

                  <CommandList>
                    <CommandEmpty>No employees found.</CommandEmpty>

                    <CommandGroup heading="Employees">
                      {mockEmployees.map((emp) => (
                        <CommandItem
                          key={emp.employeeId}
                          onSelect={() => setSelectedEmployee(emp.employeeId)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{emp.employeeName} ({emp.employeeId})</span>
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedEmployee === emp.employeeId ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Held Months</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{heldCount}</div></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Released Months</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{months.length - heldCount}</div></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Employee</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{currentEmployee.employeeName}</div>
              <p className="text-muted-foreground text-sm">{currentEmployee.department}</p>
            </CardContent>
          </Card>
        </div>

        {/* MONTH CALENDAR */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Monthly Hold Calendar</CardTitle>
              <CardDescription>Current month shows ONLY Hold / Held</CardDescription>
            </div>

            <div className="flex items-center gap-4">
              {/* YEAR ARROWS */}
              <div className="flex items-center gap-2 border rounded px-3 py-1">
                <ChevronLeft
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => setSelectedYear((y) => y - 1)}
                />

                <select
                  className="border rounded px-2 py-1 bg-white text-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from({ length: 10 }).map((_, i) => {
                    const year = currentSystemYear - 3 + i
                    return (
                      <option key={year} value={year}>{year}</option>
                    )
                  })}
                </select>

                <ChevronRight
                  className="h-5 w-5 cursor-pointer"
                  onClick={() => setSelectedYear((y) => y + 1)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={releaseAllMonths}>Release All</Button>
                <Button size="sm" onClick={holdAllMonths}>Hold All</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {months.map((month) => {
                const record = currentEmployee.holdRecords[month] ?? { month, isHeld: false }
                const editable = isMonthEditable(month)

                const monthIndex = getMonthIndex(month)
                const today = new Date()
                const currentMonth = today.getMonth()
                const currentYear = today.getFullYear()
                const [, yearStr] = month.split(" ")
                const monthYear = Number(yearStr)
                const isCurrentMonth =
                  monthIndex === currentMonth && monthYear === currentYear

                return (
                  <Button
                    key={month}
                    onClick={() => toggleHold(month)}
                    variant={record.isHeld ? "default" : "outline"}
                    disabled={!editable}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-sm font-medium">{month}</span>

                    {!editable ? (
                      <Badge variant="outline">
                        <AlertCircle className="h-3 w-3 mr-1" /> Locked
                      </Badge>
                    ) : isCurrentMonth ? (
                      record.isHeld ? (
                        <Badge variant="secondary">Held</Badge>
                      ) : (
                        <Badge variant="outline">Hold</Badge>
                      )
                    ) : record.isHeld ? (
                      <Badge variant="secondary">Held</Badge>
                    ) : (
                      <Badge variant="outline">
                        <Check className="h-3 w-3 mr-1" /> Upcoming
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}