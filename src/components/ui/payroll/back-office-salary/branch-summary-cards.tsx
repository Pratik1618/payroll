"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Briefcase } from "lucide-react"

interface BranchSummaryCardsProps {
  branchName: string
  totalEmployees: number
  totalDepartments: number
  totalBudget: number
}

export function BranchSummaryCards({
  branchName,
  totalEmployees,
  totalDepartments,
  totalBudget,
}: BranchSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">in {branchName}</p>
        </CardContent>
      </Card>

      {/* Total Departments Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDepartments}</div>
          <p className="text-xs text-muted-foreground">in {branchName}</p>
        </CardContent>
      </Card>

      {/* Total Budget Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{(totalBudget / 100000).toFixed(1)}L</div>
          <p className="text-xs text-muted-foreground">gross salary budget</p>
        </CardContent>
      </Card>
    </div>
  )
}
