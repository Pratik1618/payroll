"use client"

import { Briefcase, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">in {branchName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-violet-700">{totalDepartments}</div>
          <p className="text-xs text-muted-foreground">in {branchName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">Rs. {(totalBudget / 100000).toFixed(1)}L</div>
          <p className="text-xs text-muted-foreground">gross salary budget</p>
        </CardContent>
      </Card>
    </div>
  )
}
