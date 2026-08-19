"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { withBasePath } from "@/lib/base-path"

// Backend's leave_tracking module (Module 17) is explicitly read-only and
// system-driven (derived from locked payroll attendance) - there is no
// leave-application/approve-reject workflow to wire this table's old
// pending/approved/rejected actions to, so this now shows the real
// per-employee leave balance/tracking data instead.
interface LeaveTrackingRecord {
  empId: string
  empName: string
  leaveType: string
  totalEarned: number
  totalAvailed: number
  totalLapsed: number
  currentBalance: number
  lopDays: number
}

export function LeaveHistoryTable() {
  const [records, setRecords] = useState<LeaveTrackingRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(withBasePath("/api/leave/tracking"), {
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
        console.error("Error loading leave tracking:", error)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getLeaveTypeBadge = (type: string) => {
    const typeConfig: Record<string, string> = {
      PL: "bg-blue-100 text-blue-800",
      SL: "bg-green-100 text-green-800",
      CL: "bg-purple-100 text-purple-800",
    }
    return (
      <Badge variant="secondary" className={typeConfig[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Leave Type</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Earned</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Availed</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lapsed</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Balance</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">LOP Days</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.empId} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{record.empName}</div>
                  <div className="text-sm text-muted-foreground">{record.empId}</div>
                </div>
              </td>
              <td className="py-3 px-4">{getLeaveTypeBadge(record.leaveType)}</td>
              <td className="py-3 px-4 text-foreground">{record.totalEarned}</td>
              <td className="py-3 px-4 text-foreground">{record.totalAvailed}</td>
              <td className="py-3 px-4 text-foreground">{record.totalLapsed}</td>
              <td className="py-3 px-4 font-medium text-foreground">{record.currentBalance}</td>
              <td className="py-3 px-4">
                <span className={record.lopDays > 0 ? "font-medium text-red-600" : "text-foreground"}>
                  {record.lopDays}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && records.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No leave tracking records found.</div>
      )}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
