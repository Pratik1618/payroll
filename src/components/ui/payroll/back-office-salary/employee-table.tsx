"use client"

import { useState } from "react"
import { format, startOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CalendarDays, Edit, Plus, Upload } from "lucide-react"

interface Employee {
  id: string
  name: string
  code: string
  department: string
  grossSalary: number
  netSalary: number
  attendanceEntries?: AttendanceEntry[]
}

interface AttendanceEntry {
  date: string
  status: "present" | "weekly-off" | "leave"
  location: string
  shift: string
  remark?: string
}

interface EmployeeTableProps {
  employees: Employee[]
  isLoading: boolean
  showAttendanceCalendar?: boolean
  onAddSalary: (employee: Employee) => void
  onEditSalary: (employee: Employee) => void
  onUploadSalary: (employee: Employee) => void
}

const statusStyles: Record<AttendanceEntry["status"], string> = {
  present:
    "border border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-200",
  "weekly-off":
    "border border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200",
  leave:
    "border border-rose-300 bg-rose-100 text-rose-950 hover:bg-rose-200",
}

function AttendanceCalendar({ employee }: { employee: Employee }) {
  const [month, setMonth] = useState(() =>
    employee.attendanceEntries?.length
      ? startOfMonth(new Date(employee.attendanceEntries[0].date))
      : startOfMonth(new Date()),
  )

  const attendanceEntries = employee.attendanceEntries ?? []
  const attendanceByDate = new Map(
    attendanceEntries.map((entry) => [format(new Date(entry.date), "yyyy-MM-dd"), entry]),
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">
          <CalendarDays className="mr-1 h-3 w-3" />
          Attendance
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto border-slate-200 p-0">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-950">{employee.name}</p>
          <p className="text-xs text-slate-600">Hover a marked date to check posting location and shift.</p>
        </div>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          className="mx-auto"
          components={{
            DayButton: (props) => {
              const dateKey = format(props.day.date, "yyyy-MM-dd")
              const entry = attendanceByDate.get(dateKey)
              const button = (
                <CalendarDayButton
                  {...props}
                  className={cn(entry ? statusStyles[entry.status] : undefined, props.className)}
                />
              )

              if (!entry) {
                return button
              }

              return (
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] p-3 text-left">
                    <div className="space-y-1">
                      <p className="font-semibold">{format(props.day.date, "dd MMM yyyy")}</p>
                      <p>Status: {entry.status}</p>
                      <p>Location: {entry.location}</p>
                      <p>Shift: {entry.shift}</p>
                      {entry.remark ? <p>Remark: {entry.remark}</p> : null}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            },
          }}
        />
        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-700">
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-900">Present</span>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">Weekly Off</span>
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-900">Leave</span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function EmployeeTable({
  employees,
  isLoading,
  showAttendanceCalendar = false,
  onAddSalary,
  onEditSalary,
  onUploadSalary,
}: EmployeeTableProps) {
  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg bg-card p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg bg-card p-6">
        <div className="text-center">
          <p className="mb-2 text-muted-foreground">Select a Sub Department to view employees</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 rounded-lg bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Employees</h2>
        <Badge variant="outline">{employees.length} Total</Badge>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Employee Name</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Gross Salary</TableHead>
              <TableHead className="text-right">Net Salary</TableHead>
              {showAttendanceCalendar && <TableHead className="w-36">Attendance</TableHead>}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.code}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.grossSalary)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(emp.netSalary)}</TableCell>
                {showAttendanceCalendar && (
                  <TableCell>
                    <AttendanceCalendar employee={emp} />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {emp.grossSalary > 0 ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEditSalary(emp)} className="text-xs">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onUploadSalary(emp)} className="text-xs">
                          <Upload className="mr-1 h-3 w-3" />
                          Upload
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="text-xs" onClick={() => onAddSalary(emp)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
