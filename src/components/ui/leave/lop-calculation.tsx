"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, AlertTriangle } from "lucide-react"

interface LOPRecord {
  id: string
  employeeName: string
  employeeCode: string
  month: string
  lopDays: number
  reason: string
  basicSalary: number
  lopAmount: number
  status: "calculated" | "applied" | "disputed"
}

interface LOPCalculationProps {
  onClose: () => void
}

const mockLOPRecords: LOPRecord[] = [
  {
    id: "1",
    employeeName: "Rajesh Kumar",
    employeeCode: "EMP001",
    month: "January 2024",
    lopDays: 2,
    reason: "Unauthorized absence",
    basicSalary: 50000,
    lopAmount: 3333,
    status: "applied",
  },
  {
    id: "2",
    employeeName: "Amit Singh",
    employeeCode: "EMP003",
    month: "January 2024",
    lopDays: 1,
    reason: "Late arrival beyond grace period",
    basicSalary: 35000,
    lopAmount: 1167,
    status: "calculated",
  },
  {
    id: "3",
    employeeName: "Vikram Patel",
    employeeCode: "EMP005",
    month: "January 2024",
    lopDays: 3,
    reason: "Exceeded leave balance",
    basicSalary: 25000,
    lopAmount: 2500,
    status: "disputed",
  },
]

export function LOPCalculation({ onClose }: LOPCalculationProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      calculated: { label: "Calculated", className: "bg-blue-100 text-blue-800" },
      applied: { label: "Applied", className: "bg-green-100 text-green-800" },
      disputed: { label: "Disputed", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.calculated

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalLOPAmount = mockLOPRecords.reduce((sum, record) => sum + record.lopAmount, 0)
  const totalLOPDays = mockLOPRecords.reduce((sum, record) => sum + record.lopDays, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Loss of Pay (LOP) Calculation</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Total LOP Days</p>
                      <p className="text-2xl font-bold text-red-800">{totalLOPDays}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Total LOP Amount</p>
                      <p className="text-2xl font-bold text-orange-800">{formatCurrency(totalLOPAmount)}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Affected Employees</p>
                      <p className="text-2xl font-bold text-blue-800">{mockLOPRecords.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LOP Calculation Formula */}
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">LOP Calculation Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>LOP Amount = (Basic Salary ÷ Total Working Days in Month) × LOP Days</strong>
                  </p>
                  <p>• Total Working Days: 30 days (standard month)</p>
                  <p>• LOP is calculated on Basic Salary component only</p>
                  <p>• Statutory deductions (PF, ESI) are adjusted accordingly</p>
                </div>
              </CardContent>
            </Card>

            {/* LOP Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">LOP Days</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Basic Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">LOP Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLOPRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-foreground">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.employeeCode}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{record.month}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-red-600">{record.lopDays}</span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{formatCurrency(record.basicSalary)}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-red-600">-{formatCurrency(record.lopAmount)}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{record.reason}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                LOP calculations are auto-generated based on attendance data and leave balances.
              </div>
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export LOP Report
                </Button>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
