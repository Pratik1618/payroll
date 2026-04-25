"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Upload } from "lucide-react"

interface Employee {
  id: string
  name: string
  code: string
  department: string
  grossSalary: number
  netSalary: number
}

interface EmployeeTableProps {
  employees: Employee[]
  isLoading: boolean
  onAddSalary: (employee: Employee) => void
  onEditSalary: (employee: Employee) => void
  onUploadSalary: (employee: Employee) => void
}

export function EmployeeTable({ employees, isLoading, onAddSalary, onEditSalary, onUploadSalary }: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="flex-1 bg-card rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">Loading employees...</p>
        </div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="flex-1 bg-card rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Select a Sub Department to view employees</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-card rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Employees</h2>
        <Badge variant="outline">{employees.length} Total</Badge>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Employee Name</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Gross Salary</TableHead>
              <TableHead className="text-right">Net Salary</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.code}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell className="text-right">₹{emp.grossSalary.toLocaleString()}</TableCell>
                <TableCell className="text-right font-semibold">₹{emp.netSalary.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {emp.grossSalary > 0 ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditSalary(emp)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onUploadSalary(emp)}
                          className="text-xs"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => onAddSalary(emp)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
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
