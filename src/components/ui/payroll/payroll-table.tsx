"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Lock, Eye } from "lucide-react"

interface PayrollRecord {
  id: string
  employeeCode: string
  employeeName: string
  designation: string
  basic: number
  hra: number
  da: number
  otHours: number
  otAmount: number
  gross: number
  pf: number
  esi: number
  tds: number
  totalDeductions: number
  netPay: number
  status: "calculated" | "approved" | "hold" | "processed"
  holdReason?: string
}

interface PayrollTableProps {
  selectedSite: string
}

const mockPayrollData: PayrollRecord[] = [
  {
    id: "1",
    employeeCode: "EMP001",
    employeeName: "Rajesh Kumar",
    designation: "Manager",
    basic: 50000,
    hra: 20000,
    da: 5000,
    otHours: 8,
    otAmount: 2000,
    gross: 77000,
    pf: 6000,
    esi: 540,
    tds: 5000,
    totalDeductions: 11540,
    netPay: 65460,
    status: "calculated",
  },
  {
    id: "2",
    employeeCode: "EMP002",
    employeeName: "Priya Sharma",
    designation: "Supervisor",
    basic: 35000,
    hra: 14000,
    da: 3500,
    otHours: 12,
    otAmount: 1800,
    gross: 54300,
    pf: 4200,
    esi: 380,
    tds: 2000,
    totalDeductions: 6580,
    netPay: 47720,
    status: "approved",
  },
  {
    id: "3",
    employeeCode: "EMP003",
    employeeName: "Amit Singh",
    designation: "Technician",
    basic: 30000,
    hra: 12000,
    da: 3000,
    otHours: 55,
    otAmount: 6875,
    gross: 51875,
    pf: 3600,
    esi: 364,
    tds: 1500,
    totalDeductions: 5464,
    netPay: 46411,
    status: "calculated",
  },
  {
    id: "4",
    employeeCode: "EMP004",
    employeeName: "Sunita Devi",
    designation: "Operator",
    basic: 25000,
    hra: 10000,
    da: 2500,
    otHours: 20,
    otAmount: 2083,
    gross: 39583,
    pf: 3000,
    esi: 277,
    tds: 800,
    totalDeductions: 4077,
    netPay: 35506,
    status: "hold",
    holdReason: "Document verification pending",
  },
]

export function PayrollTable({ selectedSite }: PayrollTableProps) {
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>(mockPayrollData)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      calculated: { label: "Calculated", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      hold: { label: "On Hold", className: "bg-red-100 text-red-800" },
      processed: { label: "Processed", className: "bg-gray-100 text-gray-800" },
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

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords((prev) => (prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]))
  }

  const handleBulkApprove = () => {
    setPayrollData((prev) =>
      prev.map((record) => (selectedRecords.includes(record.id) ? { ...record, status: "approved" as const } : record)),
    )
    setSelectedRecords([])
  }

  return (
    <div className="space-y-4">
      {selectedRecords.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
          <span className="text-sm text-foreground">{selectedRecords.length} records selected</span>
          <div className="space-x-2">
            <Button size="sm" onClick={handleBulkApprove} title="Marks payroll rows as approved (not leave approval)">
              Mark Reviewed
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedRecords([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                <Checkbox
                  checked={selectedRecords.length === payrollData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRecords(payrollData.map((r) => r.id))
                    } else {
                      setSelectedRecords([])
                    }
                  }}
                />
              </th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Employee</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Basic</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">HRA</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">DA</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">OT</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Gross</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Deductions</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Net Pay</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-accent/50">
                <td className="py-3 px-2">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => toggleRecordSelection(record.id)}
                  />
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-foreground">{record.employeeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.employeeCode} • {record.designation}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-foreground">{formatCurrency(record.basic)}</td>
                <td className="py-3 px-2 text-foreground">{formatCurrency(record.hra)}</td>
                <td className="py-3 px-2 text-foreground">{formatCurrency(record.da)}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <span className="text-foreground">{record.otHours}h</span>
                    {record.otHours > 50 && <AlertTriangle className="ml-1 h-3 w-3 text-red-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(record.otAmount)}</div>
                </td>
                <td className="py-3 px-2 font-medium text-foreground">{formatCurrency(record.gross)}</td>
                <td className="py-3 px-2">
                  <div className="text-foreground">{formatCurrency(record.totalDeductions)}</div>
                  <div className="text-xs text-muted-foreground">
                    PF: {formatCurrency(record.pf)} • ESI: {formatCurrency(record.esi)}
                  </div>
                </td>
                <td className="py-3 px-2 font-bold text-green-600">{formatCurrency(record.netPay)}</td>
                <td className="py-3 px-2">
                  {getStatusBadge(record.status)}
                  {record.holdReason && <div className="text-xs text-red-600 mt-1">{record.holdReason}</div>}
                </td>
                <td className="py-3 px-2">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {record.status === "hold" && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Lock className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border text-sm text-muted-foreground">
        <div>
          Total Records: {payrollData.length} | Selected: {selectedRecords.length}
        </div>
        <div className="font-medium">
          Total Gross: {formatCurrency(payrollData.reduce((sum, record) => sum + record.gross, 0))} | Total Net:{" "}
          {formatCurrency(payrollData.reduce((sum, record) => sum + record.netPay, 0))}
        </div>
      </div>
    </div>
  )
}
