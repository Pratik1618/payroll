"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Lock, Unlock } from "lucide-react"

interface SalaryHoldModalProps {
  onClose: () => void
}

interface HoldRecord {
  id: string
  employeeCode: string
  employeeName: string
  reason: string
  holdDate: string
  amount: number
  status: "active" | "released"
}

const mockHoldRecords: HoldRecord[] = [
  {
    id: "1",
    employeeCode: "EMP004",
    employeeName: "Sunita Devi",
    reason: "Document verification pending",
    holdDate: "2024-01-15",
    amount: 35506,
    status: "active",
  },
  {
    id: "2",
    employeeCode: "EMP007",
    employeeName: "Ravi Gupta",
    reason: "Disciplinary action pending",
    holdDate: "2024-01-12",
    amount: 42000,
    status: "active",
  },
]

export function SalaryHoldModal({ onClose }: SalaryHoldModalProps) {
  const [holdRecords, setHoldRecords] = useState<HoldRecord[]>(mockHoldRecords)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [holdReason, setHoldReason] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleReleaseSalary = (recordId: string) => {
    setHoldRecords((prev) =>
      prev.map((record) => (record.id === recordId ? { ...record, status: "released" as const } : record)),
    )
  }

  const handleAddHold = () => {
    if (!selectedEmployees.length || !holdReason) {
      alert("Please select employees and provide a reason")
      return
    }

    // Add new hold records
    console.log("Adding salary hold:", { selectedEmployees, holdReason })
    setShowAddForm(false)
    setSelectedEmployees([])
    setHoldReason("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Salary Hold Management</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
              <Lock className="mr-2 h-4 w-4" />
              Add Hold
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Hold Form */}
          {showAddForm && (
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Add Salary Hold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-foreground">Select Employees</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {[
                      { code: "EMP001", name: "Rajesh Kumar" },
                      { code: "EMP002", name: "Priya Sharma" },
                      { code: "EMP003", name: "Amit Singh" },
                      { code: "EMP005", name: "Vikram Patel" },
                    ].map((employee) => (
                      <div key={employee.code} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedEmployees.includes(employee.code)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees((prev) => [...prev, employee.code])
                            } else {
                              setSelectedEmployees((prev) => prev.filter((code) => code !== employee.code))
                            }
                          }}
                        />
                        <span className="text-sm text-foreground">
                          {employee.name} ({employee.code})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="holdReason" className="text-foreground">
                    Reason for Hold *
                  </Label>
                  <Textarea
                    id="holdReason"
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="Enter reason for salary hold"
                    rows={3}
                    className="bg-background"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddHold}>Add Hold</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Hold Records */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Current Salary Holds</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hold Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-foreground">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.employeeCode}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {new Date(record.holdDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{formatCurrency(record.amount)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{record.reason}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={
                            record.status === "active" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }
                        >
                          {record.status === "active" ? "On Hold" : "Released"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {record.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReleaseSalary(record.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            Release
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {holdRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No salary holds found.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
