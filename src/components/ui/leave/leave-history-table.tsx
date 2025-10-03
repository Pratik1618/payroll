"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"

interface LeaveApplication {
  id: string
  employeeName: string
  employeeCode: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
  approvedBy?: string
}

const mockLeaveApplications: LeaveApplication[] = [
  {
    id: "1",
    employeeName: "Rajesh Kumar",
    employeeCode: "EMP001",
    leaveType: "Annual Leave",
    fromDate: "2024-01-20",
    toDate: "2024-01-22",
    days: 3,
    reason: "Family function",
    status: "pending",
    appliedDate: "2024-01-15",
  },
  {
    id: "2",
    employeeName: "Priya Sharma",
    employeeCode: "EMP002",
    leaveType: "Sick Leave",
    fromDate: "2024-01-18",
    toDate: "2024-01-19",
    days: 2,
    reason: "Fever and cold",
    status: "approved",
    appliedDate: "2024-01-17",
    approvedBy: "Manager",
  },
  {
    id: "3",
    employeeName: "Amit Singh",
    employeeCode: "EMP003",
    leaveType: "Casual Leave",
    fromDate: "2024-01-25",
    toDate: "2024-01-25",
    days: 1,
    reason: "Personal work",
    status: "rejected",
    appliedDate: "2024-01-24",
    approvedBy: "Manager",
  },
  {
    id: "4",
    employeeName: "Sunita Devi",
    employeeCode: "EMP004",
    leaveType: "Annual Leave",
    fromDate: "2024-02-01",
    toDate: "2024-02-05",
    days: 5,
    reason: "Vacation with family",
    status: "approved",
    appliedDate: "2024-01-20",
    approvedBy: "Manager",
  },
]

export function LeaveHistoryTable() {
  const [applications, setApplications] = useState<LeaveApplication[]>(mockLeaveApplications)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-orange-100 text-orange-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getLeaveTypeBadge = (type: string) => {
    const typeConfig = {
      "Annual Leave": "bg-blue-100 text-blue-800",
      "Sick Leave": "bg-green-100 text-green-800",
      "Casual Leave": "bg-purple-100 text-purple-800",
      "Maternity Leave": "bg-pink-100 text-pink-800",
      "Emergency Leave": "bg-red-100 text-red-800",
    }

    return (
      <Badge variant="secondary" className={typeConfig[type as keyof typeof typeConfig] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    )
  }

  const handleApprove = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: "approved" as const, approvedBy: "Manager" } : app,
      ),
    )
  }

  const handleReject = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: "rejected" as const, approvedBy: "Manager" } : app,
      ),
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Leave Type</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Days</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} className="border-b border-border hover:bg-accent/50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">{application.employeeName}</div>
                  <div className="text-sm text-muted-foreground">{application.employeeCode}</div>
                </div>
              </td>
              <td className="py-3 px-4">{getLeaveTypeBadge(application.leaveType)}</td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  <div className="text-foreground">
                    {formatDate(application.fromDate)} - {formatDate(application.toDate)}
                  </div>
                  <div className="text-muted-foreground">Applied: {formatDate(application.appliedDate)}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-foreground">{application.days}</span>
              </td>
              <td className="py-3 px-4">{getStatusBadge(application.status)}</td>
              <td className="py-3 px-4">
                {application.status === "pending" ? (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(application.id)}
                      className="h-8 px-2"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(application.id)}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {applications.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No leave applications found.</div>
      )}
    </div>
  )
}
