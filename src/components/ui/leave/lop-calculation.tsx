"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"
import { withBasePath } from "@/lib/base-path"

// Backend's GET /api/leave/lop only returns empId/month/monthDays/
// presentDays/paidLeave/lopDays/lopAmount - there is no employee name,
// reason, basic salary, or dispute-status field, so those columns from the
// old mock table have been dropped rather than faked.
interface LOPRecord {
  empId: string
  month: string
  monthDays: number
  presentDays: number
  paidLeave: number
  lopDays: number
  lopAmount: number
}

interface LOPCalculationProps {
  onClose: () => void
}

export function LOPCalculation({ onClose }: LOPCalculationProps) {
  const [records, setRecords] = useState<LOPRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(withBasePath("/api/leave/lop"), {
          credentials: "include",
          cache: "no-store",
        })
        const json = await res.json()
        if (res.ok) {
          setRecords(json?.results?.data ?? [])
        } else {
          setRecords([])
        }
      } catch (error) {
        console.error("Error loading LOP data:", error)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalLOPAmount = records.reduce((sum, record) => sum + record.lopAmount, 0)
  const totalLOPDays = records.reduce((sum, record) => sum + record.lopDays, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Loss of Pay (LOP) Calculation</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                      <p className="text-2xl font-bold text-blue-800">{records.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Present Days</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Paid Leave</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">LOP Days</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">LOP Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={`${record.empId}-${index}`} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 font-medium text-foreground">{record.empId}</td>
                      <td className="py-3 px-4 text-foreground">{record.month}</td>
                      <td className="py-3 px-4 text-foreground">{record.presentDays}</td>
                      <td className="py-3 px-4 text-foreground">{record.paidLeave}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-red-600">{record.lopDays}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-red-600">-{formatCurrency(record.lopAmount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && records.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No LOP records found.</div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                LOP calculations are auto-generated based on attendance data and leave balances.
              </div>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
