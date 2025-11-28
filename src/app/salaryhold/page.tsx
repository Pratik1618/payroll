"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/ui/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
} from "lucide-react"

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

// Converts "March 2025" → 2
const getMonthIndex = (monthString: string): number => {
  const [monthName] = monthString.split(" ")
  const map: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  }
  return map[monthName]
}

// Returns true for current+future months
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

// Generate months for ANY year
const getMonthsForYear = (year: number) => {
  const base = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ]
  return base.map((m) => `${m} ${year}`)
}

// ------------------------------------------------------------
// MAIN PAGE
// ------------------------------------------------------------

export default function SalaryHoldPage() {
  const currentSystemYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentSystemYear)

  const [selectedEmployee, setSelectedEmployee] = useState("EMP001")

  // ------------------------------
  // INIT EMPLOYEE HOLD DATA
  // ------------------------------

  const [employeeHoldData, setEmployeeHoldData] = useState<Record<string, EmployeeHoldData>>(() => {
    const data: Record<string, EmployeeHoldData> = {}

    mockEmployees.forEach((emp) => {
      const records: Record<string, HoldRecord> = {}

      // initialize only current year; other years generate dynamically later
      getMonthsForYear(currentSystemYear).forEach((m) => {
        records[m] = { month: m, isHeld: false }
      })

      data[emp.employeeId] = { ...emp, holdRecords: records }
    })

    return data
  })

  // ------------------------------
  // LOCAL STORAGE LOAD ON MOUNT
  // ------------------------------

  useEffect(() => {
    const stored = localStorage.getItem("employeeHoldData")
    if (stored) {
      setEmployeeHoldData(JSON.parse(stored))
    }
  }, [])

  // ------------------------------
  // LOCAL STORAGE SAVE
  // ------------------------------

  useEffect(() => {
    localStorage.setItem("employeeHoldData", JSON.stringify(employeeHoldData))
  }, [employeeHoldData])

  const months = getMonthsForYear(selectedYear)
  const currentEmployee = employeeHoldData[selectedEmployee]

  // Auto-create missing months when switching years
  useEffect(() => {
    setEmployeeHoldData((prev) => {
      const updated = { ...prev }

      mockEmployees.forEach((emp) => {
        const employee = updated[emp.employeeId]

        months.forEach((m) => {
          if (!employee.holdRecords[m]) {
            employee.holdRecords[m] = { month: m, isHeld: false }
          }
        })
      })

      return updated
    })
  }, [selectedYear])

  const heldCount = Object.values(currentEmployee.holdRecords).filter((r) => r.isHeld).length

  // ------------------------------
  // ACTIONS
  // ------------------------------

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

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <MainLayout>

      <div className="space-y-6 p-6">

        <h1 className="text-3xl font-bold">Salary Hold / Unhold</h1>
        <p className="text-muted-foreground">Manage monthly salary hold settings</p>

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

                {/* YEAR DROPDOWN */}
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
