"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle } from "lucide-react"

interface LeaveBalance {
  type: string
  total: number
  used: number
  remaining: number
  color: string
}

const leaveBalances: LeaveBalance[] = [
  {
    type: "Annual Leave",
    total: 21,
    used: 8,
    remaining: 13,
    color: "bg-blue-500",
  },
  {
    type: "Sick Leave",
    total: 12,
    used: 3,
    remaining: 9,
    color: "bg-green-500",
  },
  {
    type: "Casual Leave",
    total: 7,
    used: 2,
    remaining: 5,
    color: "bg-purple-500",
  },
  {
    type: "Maternity Leave",
    total: 180,
    used: 0,
    remaining: 180,
    color: "bg-pink-500",
  },
]

export function LeaveBalanceCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Calendar className="mr-2 h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaveBalances.map((leave) => (
          <div key={leave.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{leave.type}</span>
              <Badge variant="outline" className="text-xs">
                {leave.remaining}/{leave.total} days
              </Badge>
            </div>
            <Progress value={(leave.remaining / leave.total) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used: {leave.used} days</span>
              <span>Remaining: {leave.remaining} days</span>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Leave Policy</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Annual Reset
            </Badge>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Policy Year:</span>
              <span>Jan 2024 - Dec 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Carry Forward:</span>
              <span>Max 5 days</span>
            </div>
            <div className="flex justify-between">
              <span>Encashment:</span>
              <span>Allowed</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
            <div className="text-xs text-orange-800">
              <p className="font-medium">Reminder</p>
              <p>5 days will expire on Dec 31, 2024. Consider applying for leave or encashment.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
