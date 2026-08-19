"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Lock, Unlock } from "lucide-react"
import { toast } from "sonner"
import { withBasePath } from "@/lib/base-path"

interface SalaryHoldModalProps {
  onClose: () => void
}

interface HoldRecord {
  employeeId: string
  month: string
  status: "HELD" | "UNHELD"
  updatedAt: string
}

// The salary_hold backend module (Module 8) only exposes POST /hold,
// /unhold, /bulk-upload - there is no GET/list endpoint for currently-held
// employees, so this table can't be pre-loaded with real historical holds.
// It shows only the real results of hold/unhold actions taken in this
// session (from the actual API responses), rather than fabricating a
// roster - it starts empty rather than showing fake demo employees.
export function SalaryHoldModal({ onClose }: SalaryHoldModalProps) {
  const [holdRecords, setHoldRecords] = useState<HoldRecord[]>([])
  const [employeeId, setEmployeeId] = useState("")
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [holdReason, setHoldReason] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleAddHold = async () => {
    if (!employeeId.trim() || !holdReason.trim()) {
      toast.error("Please enter an employee ID and a reason")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(withBasePath("/api/salary-hold/hold"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          month,
          actionBy: { userId: "", name: "", role: "" },
          reason: holdReason.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || data?.errors?.[0]?.errorMessage || "Failed to add hold")
      }

      const result = data?.results ?? data
      setHoldRecords((prev) => [
        { employeeId: result.employeeId, month: result.month, status: result.status, updatedAt: result.updatedAt },
        ...prev,
      ])
      toast.success(`Salary hold added for ${result.employeeId}`)
      setShowAddForm(false)
      setEmployeeId("")
      setHoldReason("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add hold")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReleaseSalary = async (record: HoldRecord) => {
    try {
      const res = await fetch(withBasePath("/api/salary-hold/unhold"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: record.employeeId,
          month: record.month,
          actionBy: { userId: "", name: "", role: "" },
          reason: "Released via Salary Hold Management",
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || data?.errors?.[0]?.errorMessage || "Failed to release hold")
      }

      const result = data?.results ?? data
      setHoldRecords((prev) =>
        prev.map((r) =>
          r.employeeId === record.employeeId && r.month === record.month
            ? { ...r, status: result.status, updatedAt: result.updatedAt }
            : r
        )
      )
      toast.success(`Salary hold released for ${record.employeeId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to release hold")
    }
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
          {showAddForm && (
            <Card className="bg-accent/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Add Salary Hold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="holdEmployeeId" className="text-foreground">
                    Employee ID
                  </Label>
                  <Input
                    id="holdEmployeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP001"
                    className="bg-background"
                  />
                </div>

                <div>
                  <Label htmlFor="holdMonth" className="text-foreground">
                    Month
                  </Label>
                  <Input
                    id="holdMonth"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="bg-background"
                  />
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
                  <Button onClick={handleAddHold} disabled={submitting}>
                    {submitting ? "Adding..." : "Add Hold"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Salary Holds This Session</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdRecords.map((record) => (
                    <tr key={`${record.employeeId}-${record.month}`} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 font-medium text-foreground">{record.employeeId}</td>
                      <td className="py-3 px-4 text-foreground">{record.month}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={
                            record.status === "HELD" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }
                        >
                          {record.status === "HELD" ? "On Hold" : "Released"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {record.status === "HELD" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReleaseSalary(record)}
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
                <div className="text-center py-8 text-muted-foreground">
                  No holds added this session. The backend has no listing endpoint for historical holds.
                </div>
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
